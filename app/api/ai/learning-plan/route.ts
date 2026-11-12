import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import { generateAIStarterPlan, checkRateLimit } from "@/lib/gemini";
import { z } from "zod";

const GeneratePlanSchema = z.object({
  swapRequestId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const swapRequestId = searchParams.get("swapRequestId");

    if (!swapRequestId) {
      return NextResponse.json(
        { error: "swapRequestId is required" },
        { status: 400 }
      );
    }

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const plan = await prisma.learningPlan.findFirst({
          where: { swapRequestId },
          orderBy: { createdAt: "desc" },
        });

        if (plan) {
          return NextResponse.json({ plan });
        }
      } catch (err: any) {
        console.warn("DB plan fetch failed, using memory store:", err.message);
      }
    }

    const memPlan = memoryStore.learningPlans.find(
      (p) => p.swapRequestId === swapRequestId
    );

    return NextResponse.json({ plan: memPlan || null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch learning plan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientKey = session?.user?.email || "anonymous_sparkathon";

    // Rate Limiting Check
    if (!checkRateLimit(clientKey, 10, 60000)) {
      return NextResponse.json(
        { error: "Too many learning plan requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = GeneratePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { swapRequestId } = parsed.data;
    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const swapReq = await prisma.swapRequest.findUnique({
          where: { id: swapRequestId },
          include: {
            fromUser: true,
            toUser: true,
            offeredSkill: true,
            requestedSkill: true,
          },
        });

        if (!swapReq) {
          return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
        }

        const planContent = await generateAIStarterPlan({
          teacherAName: swapReq.fromUser.name,
          learnerAName: swapReq.toUser.name,
          skillA: swapReq.offeredSkill.name,
          teacherBName: swapReq.toUser.name,
          learnerBName: swapReq.fromUser.name,
          skillB: swapReq.requestedSkill.name,
        });

        const plan = await prisma.learningPlan.create({
          data: {
            swapRequestId,
            content: planContent as any,
          },
        });

        return NextResponse.json({ plan }, { status: 201 });
      } catch (err: any) {
        console.warn("DB plan generation failed, using memory store:", err.message);
      }
    }

    // Memory Store
    const memReq = memoryStore.swapRequests.find((r) => r.id === swapRequestId);
    if (!memReq) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
    }

    const fromUser = memoryStore.users.find((u) => u.id === memReq.fromUserId);
    const toUser = memoryStore.users.find((u) => u.id === memReq.toUserId);
    const offeredSkill = memoryStore.skills.find((s) => s.id === memReq.offeredSkillId);
    const requestedSkill = memoryStore.skills.find((s) => s.id === memReq.requestedSkillId);

    const planContent = await generateAIStarterPlan({
      teacherAName: fromUser?.name || "Teacher",
      learnerAName: toUser?.name || "Learner",
      skillA: offeredSkill?.name || "Offered Skill",
      teacherBName: toUser?.name || "Teacher B",
      learnerBName: fromUser?.name || "Learner B",
      skillB: requestedSkill?.name || "Requested Skill",
    });

    const newMemPlan = {
      id: `plan_${Date.now()}`,
      swapRequestId,
      content: planContent,
      createdAt: new Date().toISOString(),
    };

    memoryStore.learningPlans.push(newMemPlan);
    return NextResponse.json({ plan: newMemPlan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate learning plan" },
      { status: 500 }
    );
  }
}
