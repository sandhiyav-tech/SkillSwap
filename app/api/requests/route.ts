import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import { z } from "zod";

const CreateRequestSchema = z.object({
  toUserId: z.string().min(1),
  offeredSkillId: z.string().min(1),
  requestedSkillId: z.string().min(1),
  message: z.string().max(1000).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "demo@skillswap.app";
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "received"; // "received" or "sent"

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: userEmail.toLowerCase() },
        });

        if (!user) {
          return NextResponse.json({ requests: [] });
        }

        const where =
          tab === "sent" ? { fromUserId: user.id } : { toUserId: user.id };

        const requests = await prisma.swapRequest.findMany({
          where,
          include: {
            fromUser: {
              select: { id: true, name: true, image: true, bio: true, timezone: true },
            },
            toUser: {
              select: { id: true, name: true, image: true, bio: true, timezone: true },
            },
            offeredSkill: true,
            requestedSkill: true,
            sessions: true,
          },
          orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ requests });
      } catch (err: any) {
        console.warn("DB requests fetch failed, using memory store:", err.message);
      }
    }

    // Memory Store
    const memUser =
      memoryStore.users.find(
        (u) => u.email.toLowerCase() === userEmail.toLowerCase()
      ) || memoryStore.users[0];

    const filtered = memoryStore.swapRequests.filter((r) =>
      tab === "sent" ? r.fromUserId === memUser.id : r.toUserId === memUser.id
    );

    const populated = filtered.map((r) => ({
      ...r,
      fromUser: memoryStore.users.find((u) => u.id === r.fromUserId),
      toUser: memoryStore.users.find((u) => u.id === r.toUserId),
      offeredSkill: memoryStore.skills.find((s) => s.id === r.offeredSkillId),
      requestedSkill: memoryStore.skills.find((s) => s.id === r.requestedSkillId),
      sessions: memoryStore.sessions.filter((s) => s.swapRequestId === r.id),
    }));

    return NextResponse.json({ requests: populated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "demo@skillswap.app";

    const body = await request.json();
    const parsed = CreateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { toUserId, offeredSkillId, requestedSkillId, message } = parsed.data;
    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const currentUser = await prisma.user.findUnique({
          where: { email: userEmail.toLowerCase() },
        });

        if (!currentUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (currentUser.id === toUserId) {
          return NextResponse.json(
            { error: "You cannot send a swap request to yourself" },
            { status: 400 }
          );
        }

        const newReq = await prisma.swapRequest.create({
          data: {
            fromUserId: currentUser.id,
            toUserId,
            offeredSkillId,
            requestedSkillId,
            message: message || "Let's connect and swap skills!",
            status: "PENDING",
          },
          include: {
            fromUser: true,
            toUser: true,
            offeredSkill: true,
            requestedSkill: true,
          },
        });

        return NextResponse.json({ request: newReq }, { status: 201 });
      } catch (err: any) {
        console.warn("DB request create failed, saving to memory:", err.message);
      }
    }

    // Memory Store
    const curMem =
      memoryStore.users.find(
        (u) => u.email.toLowerCase() === userEmail.toLowerCase()
      ) || memoryStore.users[0];

    const newMemReq = {
      id: `req_${Date.now()}`,
      fromUserId: curMem.id,
      toUserId,
      offeredSkillId,
      requestedSkillId,
      message: message || "Let's connect and swap skills!",
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.swapRequests.unshift(newMemReq);

    const populated = {
      ...newMemReq,
      fromUser: curMem,
      toUser: memoryStore.users.find((u) => u.id === toUserId),
      offeredSkill: memoryStore.skills.find((s) => s.id === offeredSkillId),
      requestedSkill: memoryStore.skills.find((s) => s.id === requestedSkillId),
    };

    return NextResponse.json({ request: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send request" }, { status: 500 });
  }
}
