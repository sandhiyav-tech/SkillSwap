import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const requestId = params.id;

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const updated = await prisma.swapRequest.update({
          where: { id: requestId },
          data: { status: "DECLINED" },
        });

        return NextResponse.json({ success: true, request: updated });
      } catch (err: any) {
        console.warn("DB decline request failed, using memory store:", err.message);
      }
    }

    // Memory Store
    const memReq = memoryStore.swapRequests.find((r) => r.id === requestId);
    if (!memReq) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    memReq.status = "DECLINED";
    memReq.updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, request: memReq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to decline request" }, { status: 500 });
  }
}
