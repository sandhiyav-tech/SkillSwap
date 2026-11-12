import { NextResponse } from "next/server";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import { getSkillEmbedding } from "@/lib/gemini";
import { z } from "zod";

const CreateSkillSchema = z.object({
  name: z.string().min(2).max(60),
  category: z.string().min(2).max(40),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase();
    const category = searchParams.get("category");

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const where: any = {};
        if (query) {
          where.name = { contains: query, mode: "insensitive" };
        }
        if (category && category !== "All") {
          where.category = category;
        }

        const skills = await prisma.skill.findMany({
          where,
          orderBy: { name: "asc" },
        });

        return NextResponse.json({ skills });
      } catch (err: any) {
        console.warn("DB skills fetch failed, using memory store:", err.message);
      }
    }

    // Memory store fallback
    let list = [...memoryStore.skills];
    if (query) {
      list = list.filter((s) => s.name.toLowerCase().includes(query));
    }
    if (category && category !== "All") {
      list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({ skills: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateSkillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid skill data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, category } = parsed.data;
    const embedding = await getSkillEmbedding(name);

    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const skill = await prisma.skill.upsert({
          where: { name },
          update: { category, embedding },
          create: { name, category, embedding },
        });
        return NextResponse.json({ skill }, { status: 201 });
      } catch (err: any) {
        console.warn("DB skill create failed, saving to memory:", err.message);
      }
    }

    // Check memory store
    const existing = memoryStore.skills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      return NextResponse.json({ skill: existing });
    }

    const newSkill = {
      id: `sk_${Date.now()}`,
      name,
      category,
      embedding,
    };
    memoryStore.skills.push(newSkill);

    return NextResponse.json({ skill: newSkill }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create skill" }, { status: 500 });
  }
}
