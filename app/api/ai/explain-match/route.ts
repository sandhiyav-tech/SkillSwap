import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateMatchExplanation, checkRateLimit } from "@/lib/gemini";
import { z } from "zod";

const ExplainMatchSchema = z.object({
  userAName: z.string(),
  userBName: z.string(),
  userATeach: z.array(z.string()),
  userALearn: z.array(z.string()),
  userBTeach: z.array(z.string()),
  userBLearn: z.array(z.string()),
  commonDays: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const clientKey = session?.user?.email || "anonymous_sparkathon";

    // Rate Limiting Check
    if (!checkRateLimit(clientKey, 20, 60000)) {
      return NextResponse.json(
        { error: "Too many AI explanation requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ExplainMatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const explanation = await generateMatchExplanation(parsed.data);

    return NextResponse.json({ explanation });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate match explanation" },
      { status: 500 }
    );
  }
}

