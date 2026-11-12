import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import { generateAIStarterPlan } from "@/lib/gemini";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "demo@skillswap.app";
    const requestId = params.id;

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const swapReq = await prisma.swapRequest.findUnique({
          where: { id: requestId },
          include: {
            fromUser: true,
            toUser: true,
            offeredSkill: true,
            requestedSkill: true,
          },
        });

        if (!swapReq) {
          return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        const updated = await prisma.swapRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" },
        });

        // Generate AI 4-session learning plan for both directions
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
            swapRequestId: requestId,
            content: planContent as any,
          },
        });

        return NextResponse.json({
          success: true,
          request: updated,
          learningPlan: plan,
        });
      } catch (err: any) {
        console.warn("DB accept request failed, using memory store:", err.message);
      }
    }

    // Memory Store
    const memReq = memoryStore.swapRequests.find((r) => r.id === requestId);
    if (!memReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    memReq.status = "ACCEPTED";
    memReq.updatedAt = new Date().toISOString();

    const fromUser = memoryStore.users.find((u) => u.id === memReq.fromUserId);
    const toUser = memoryStore.users.find((u) => u.id === memReq.toUserId);
    const offeredSkill = memoryStore.skills.find((s) => s.id === memReq.offeredSkillId);
    const requestedSkill = memoryStore.skills.find((s) => s.id === memReq.requestedSkillId);

    const planContent = await generateAIStarterPlan({
      teacherAName: fromUser?.name || "Teacher",
      learnerAName: toUser?.name || "Learner",
      skillA: offeredSkill?.name || "Skill A",
      teacherBName: toUser?.name || "Teacher B",
      learnerBName: fromUser?.name || "Learner B",
      skillB: requestedSkill?.name || "Skill B",
    });

    const newPlan = {
      id: `plan_${Date.now()}`,
      swapRequestId: requestId,
      content: planContent,
      createdAt: new Date().toISOString(),
    };

    memoryStore.learningPlans.push(newPlan);

    return NextResponse.json({
      success: true,
      request: memReq,
      learningPlan: newPlan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to accept request" }, { status: 500 });
  }
}

