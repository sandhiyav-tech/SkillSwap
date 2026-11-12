import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import { z } from "zod";

const CreateReviewSchema = z.object({
  sessionId: z.string().min(1),
  revieweeId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const where: any = {};
        if (userId) where.revieweeId = userId;
        if (sessionId) where.sessionId = sessionId;

        const reviews = await prisma.review.findMany({
          where,
          include: {
            reviewer: { select: { id: true, name: true, image: true } },
            session: true,
          },
          orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ reviews });
      } catch (err: any) {
        console.warn("DB reviews fetch failed, using memory store:", err.message);
      }
    }

    let list = [...memoryStore.reviews];
    if (userId) list = list.filter((r) => r.revieweeId === userId);
    if (sessionId) list = list.filter((r) => r.sessionId === sessionId);

    const populated = list.map((r) => ({
      ...r,
      reviewer: memoryStore.users.find((u) => u.id === r.reviewerId),
      session: memoryStore.sessions.find((s) => s.id === r.sessionId),
    }));

    return NextResponse.json({ reviews: populated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "demo@skillswap.app";

    const body = await request.json();
    const parsed = CreateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, revieweeId, rating, comment } = parsed.data;
    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const currentUser = await prisma.user.findUnique({
          where: { email: userEmail.toLowerCase() },
        });

        if (!currentUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newReview = await prisma.review.create({
          data: {
            sessionId,
            reviewerId: currentUser.id,
            revieweeId,
            rating,
            comment: comment || "Great session!",
          },
          include: {
            reviewer: { select: { id: true, name: true, image: true } },
          },
        });

        // Mark session completed if it wasn't already
        await prisma.session.update({
          where: { id: sessionId },
          data: { status: "COMPLETED" },
        });

        return NextResponse.json({ review: newReview }, { status: 201 });
      } catch (err: any) {
        console.warn("DB review create failed, using memory store:", err.message);
      }
    }

    const curMem =
      memoryStore.users.find(
        (u) => u.email.toLowerCase() === userEmail.toLowerCase()
      ) || memoryStore.users[0];

    const newMemReview = {
      id: `rev_${Date.now()}`,
      sessionId,
      reviewerId: curMem.id,
      revieweeId,
      rating,
      comment: comment || "Great session!",
      createdAt: new Date().toISOString(),
      reviewer: curMem,
    };

    memoryStore.reviews.push(newMemReview);

    // Update session status in memory
    const ses = memoryStore.sessions.find((s) => s.id === sessionId);
    if (ses) ses.status = "COMPLETED";

    return NextResponse.json({ review: newMemReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
