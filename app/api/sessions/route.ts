import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import { z } from "zod";

const CreateSessionSchema = z.object({
  swapRequestId: z.string().min(1),
  scheduledAt: z.string().min(1),
  durationMins: z.number().int().min(15).max(180).default(60),
  meetingLink: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

const UpdateSessionSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["PROPOSED", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "demo@skillswap.app";
    const { searchParams } = new URL(request.url);
    const swapRequestId = searchParams.get("swapRequestId");

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: userEmail.toLowerCase() },
        });

        const where: any = {};
        if (swapRequestId) {
          where.swapRequestId = swapRequestId;
        } else if (user) {
          where.swapRequest = {
            OR: [{ fromUserId: user.id }, { toUserId: user.id }],
          };
        }

        const sessions = await prisma.session.findMany({
          where,
          include: {
            swapRequest: {
              include: {
                fromUser: true,
                toUser: true,
                offeredSkill: true,
                requestedSkill: true,
              },
            },
            reviews: true,
          },
          orderBy: { scheduledAt: "asc" },
        });

        return NextResponse.json({ sessions });
      } catch (err: any) {
        console.warn("DB sessions fetch failed, using memory store:", err.message);
      }
    }

    // Memory Store
    const memUser =
      memoryStore.users.find(
        (u) => u.email.toLowerCase() === userEmail.toLowerCase()
      ) || memoryStore.users[0];

    let filtered = [...memoryStore.sessions];
    if (swapRequestId) {
      filtered = filtered.filter((s) => s.swapRequestId === swapRequestId);
    } else {
      const userReqIds = memoryStore.swapRequests
        .filter((r) => r.fromUserId === memUser.id || r.toUserId === memUser.id)
        .map((r) => r.id);
      filtered = filtered.filter((s) => userReqIds.includes(s.swapRequestId));
    }

    const populated = filtered.map((s) => {
      const req = memoryStore.swapRequests.find((r) => r.id === s.swapRequestId);
      return {
        ...s,
        swapRequest: req
          ? {
              ...req,
              fromUser: memoryStore.users.find((u) => u.id === req.fromUserId),
              toUser: memoryStore.users.find((u) => u.id === req.toUserId),
              offeredSkill: memoryStore.skills.find(
                (sk) => sk.id === req.offeredSkillId
              ),
              requestedSkill: memoryStore.skills.find(
                (sk) => sk.id === req.requestedSkillId
              ),
            }
          : undefined,
        reviews: memoryStore.reviews.filter((r) => r.sessionId === s.id),
      };
    });

    return NextResponse.json({ sessions: populated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Check if this is an update or create
    if (body.sessionId) {
      const parsedUpdate = UpdateSessionSchema.safeParse(body);
      if (!parsedUpdate.success) {
        return NextResponse.json(
          { error: "Invalid session update data", details: parsedUpdate.error.format() },
          { status: 400 }
        );
      }

      const { sessionId, status, meetingLink, notes } = parsedUpdate.data;
      const hasDb = await checkDbConnection();

      if (hasDb) {
        try {
          const updated = await prisma.session.update({
            where: { id: sessionId },
            data: {
              ...(status ? { status } : {}),
              ...(meetingLink !== undefined ? { meetingLink: meetingLink || null } : {}),
              ...(notes !== undefined ? { notes: notes || null } : {}),
            },
            include: {
              swapRequest: true,
            },
          });
          return NextResponse.json({ session: updated });
        } catch (err: any) {
          console.warn("DB session update failed, using memory store:", err.message);
        }
      }

      const memSession = memoryStore.sessions.find((s) => s.id === sessionId);
      if (!memSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      if (status) memSession.status = status;
      if (meetingLink !== undefined) memSession.meetingLink = meetingLink || null;
      if (notes !== undefined) memSession.notes = notes || null;
      memSession.updatedAt = new Date().toISOString();

      return NextResponse.json({ session: memSession });
    }

    // Create new session
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid session data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { swapRequestId, scheduledAt, durationMins, meetingLink, notes } =
      parsed.data;
    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const newSession = await prisma.session.create({
          data: {
            swapRequestId,
            scheduledAt: new Date(scheduledAt),
            durationMins,
            meetingLink: meetingLink || "https://meet.google.com/new",
            notes: notes || "Initial learning session",
            status: "CONFIRMED",
          },
          include: {
            swapRequest: true,
          },
        });
        return NextResponse.json({ session: newSession }, { status: 201 });
      } catch (err: any) {
        console.warn("DB session create failed, saving to memory store:", err.message);
      }
    }

    const newMemSession = {
      id: `ses_${Date.now()}`,
      swapRequestId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMins,
      meetingLink: meetingLink || "https://meet.google.com/new",
      notes: notes || "Initial learning session",
      status: "CONFIRMED" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.sessions.push(newMemSession);
    return NextResponse.json({ session: newMemSession }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save session" }, { status: 500 });
  }
}

