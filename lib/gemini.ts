import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { LearningPlanContent, LearningSessionPlan } from "@/types";

// In-Memory Embeddings Cache
const embeddingCache = new Map<string, number[]>();

// Simple In-Memory Rate Limiter (Max 15 requests per minute per key)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// Zod Schema for Structured 4-Session Learning Plan
export const LearningSessionSchema = z.object({
  sessionNumber: z.number(),
  title: z.string(),
  goal: z.string(),
  topics: z.array(z.string()),
  exercises: z.array(z.string()),
  resources: z.array(z.string()),
});

export const LearningDirectionSchema = z.object({
  teacherName: z.string(),
  learnerName: z.string(),
  skillName: z.string(),
  targetLevel: z.string(),
  overview: z.string(),
  sessions: z.array(LearningSessionSchema),
});

export const LearningPlanContentSchema = z.object({
  learnerDirection: LearningDirectionSchema,
  returnDirection: LearningDirectionSchema.optional(),
});

/**
 * Generate 2-sentence match explanation using Gemini or intelligent fallback
 */
export async function generateMatchExplanation(params: {
  userAName: string;
  userBName: string;
  userATeach: string[];
  userALearn: string[];
  userBTeach: string[];
  userBLearn: string[];
  commonDays?: string[];
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are the AI matching engine for SkillSwap, a peer-to-peer skill exchange platform.
User A: ${params.userAName} (Teaches: ${params.userATeach.join(", ")}; Wants to learn: ${params.userALearn.join(", ")})
User B: ${params.userBName} (Teaches: ${params.userBTeach.join(", ")}; Wants to learn: ${params.userBLearn.join(", ")})
Overlapping schedule days: ${params.commonDays?.join(", ") || "Weekends and evenings"}.

Write EXACTLY 2 concise, energetic sentences explaining why these two users are an ideal learning match for each other.
Highlight what they can teach each other and their schedule synergy. Do not use markdown or quotes.
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      console.warn("Gemini API call failed, using graceful fallback:", err);
    }
  }

  // Graceful fallback template
  const bOffers = params.userBTeach[0] || "specialized skills";
  const aOffers = params.userATeach[0] || "core knowledge";
  const days = params.commonDays && params.commonDays.length > 0
    ? `with mutual free time on ${params.commonDays.slice(0, 2).join(" and ")}`
    : `with flexible evening availability`;

  return `${params.userBName}'s expertise in ${bOffers} directly satisfies your learning goals, while your experience in ${aOffers} provides an exciting exchange for them. You both share a great opportunity to collaborate ${days}!`;
}

/**
 * Generate 4-session starter plan for both directions using Gemini or intelligent fallback
 */
export async function generateAIStarterPlan(params: {
  teacherAName: string;
  learnerAName: string;
  skillA: string;
  levelA?: string;
  teacherBName?: string;
  learnerBName?: string;
  skillB?: string;
  levelB?: string;
}): Promise<LearningPlanContent> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
Create a structured 4-session peer-to-peer learning plan for SkillSwap.
Direction 1:
- Teacher: ${params.teacherAName}
- Learner: ${params.learnerAName}
- Skill: ${params.skillA} (Target level: ${params.levelA || "Beginner to Intermediate"})

${
  params.skillB
    ? `Direction 2:
- Teacher: ${params.teacherBName}
- Learner: ${params.learnerBName}
- Skill: ${params.skillB} (Target level: ${params.levelB || "Beginner to Intermediate"})`
    : ""
}

Return JSON with exactly this structure:
{
  "learnerDirection": {
    "teacherName": "${params.teacherAName}",
    "learnerName": "${params.learnerAName}",
    "skillName": "${params.skillA}",
    "targetLevel": "...",
    "overview": "A 2-sentence summary of this 4-week roadmap",
    "sessions": [
      {
        "sessionNumber": 1,
        "title": "Title of session 1",
        "goal": "Core objective of session 1",
        "topics": ["topic 1", "topic 2", "topic 3"],
        "exercises": ["exercise 1", "exercise 2"],
        "resources": ["resource 1", "resource 2"]
      },
      ...exactly 4 sessions
    ]
  }
  ${params.skillB ? `,"returnDirection": { ...same structure for direction 2 }` : ""}
}
`;

      const result = await model.generateContent(prompt);
      const rawJson = JSON.parse(result.response.text());
      const validated = LearningPlanContentSchema.parse(rawJson);
      return validated;
    } catch (err) {
      console.warn("Gemini Learning Plan API call failed, using graceful fallback:", err);
    }
  }

  // Guaranteed resilient fallback plan
  return createFallbackLearningPlan(params);
}

function createFallbackLearningPlan(params: {
  teacherAName: string;
  learnerAName: string;
  skillA: string;
  levelA?: string;
  teacherBName?: string;
  learnerBName?: string;
  skillB?: string;
  levelB?: string;
}): LearningPlanContent {
  const createSessions = (skill: string): LearningSessionPlan[] => [
    {
      sessionNumber: 1,
      title: `Foundations & Core Principles of ${skill}`,
      goal: `Establish key mental models, terminology, and development environment.`,
      topics: [
        `Overview and real-world applications of ${skill}`,
        `Core concepts, tools, and recommended workflow setup`,
        `Deconstructing beginner pitfalls and foundational mental models`,
      ],
      exercises: [
        `Walk through a live starter project together`,
        `Complete a quick hands-on challenge with live peer feedback`,
      ],
      resources: [
        `Official ${skill} Documentation & Quickstart`,
        `Interactive Beginner Roadmap & Cheat Sheet`,
      ],
    },
    {
      sessionNumber: 2,
      title: `Practical Application & Guided Workflow`,
      goal: `Build confidence applying intermediate techniques to practical scenarios.`,
      topics: [
        `Deep dive into standard patterns and best practices`,
        `Step-by-step troubleshooting and debugging strategies`,
        `Workflow speed improvements and common shortcuts`,
      ],
      exercises: [
        `Pair-programming or co-working session on a medium-difficulty problem`,
        `Identify and refactor two common anti-patterns`,
      ],
      resources: [
        `Curated Best Practices Repository`,
        `Video Walkthroughs of Real-World Case Studies`,
      ],
    },
    {
      sessionNumber: 3,
      title: `Intermediate Techniques & Optimization`,
      goal: `Advance into production-grade techniques, architecture, and refinement.`,
      topics: [
        `Modular architecture, scalability, and clean structure`,
        `Performance tips and industry standards`,
        `Adapting techniques to the learner's personal project goals`,
      ],
      exercises: [
        `Draft and implement the learner's custom showcase mini-project`,
        `Conduct a mutual review and identify optimization areas`,
      ],
      resources: [
        `Deep Dive Technical Articles`,
        `Architecture & System Design Patterns`,
      ],
    },
    {
      sessionNumber: 4,
      title: `Capstone Review, Showcase & Next Steps`,
      goal: `Synthesize skills into a polished project and define future learning path.`,
      topics: [
        `Final project review and polish`,
        `Self-assessment and answering open advanced questions`,
        `Resources and communities for continued independent mastery`,
      ],
      exercises: [
        `Present the completed capstone project`,
        `Complete an open Q&A and knowledge-sharing recap`,
      ],
      resources: [
        `Advanced Community Forums & Discord channels`,
        `Portfolio and Resume Presentation Checklist`,
      ],
    },
  ];

  const plan: LearningPlanContent = {
    learnerDirection: {
      teacherName: params.teacherAName,
      learnerName: params.learnerAName,
      skillName: params.skillA,
      targetLevel: params.levelA || "Intermediate",
      overview: `A structured 4-session peer-to-peer accelerator taking ${params.learnerAName} through essential foundations, hands-on application, and a capstone project in ${params.skillA}, mentored by ${params.teacherAName}.`,
      sessions: createSessions(params.skillA),
    },
  };

  if (params.skillB && params.teacherBName && params.learnerBName) {
    plan.returnDirection = {
      teacherName: params.teacherBName,
      learnerName: params.learnerBName,
      skillName: params.skillB,
      targetLevel: params.levelB || "Intermediate",
      overview: `A reciprocal 4-session track where ${params.teacherBName} guides ${params.learnerBName} through practical mastery of ${params.skillB}.`,
      sessions: createSessions(params.skillB),
    };
  }

  return plan;
}

/**
 * Generate or fetch embedding vector for skill name
 */
export async function getSkillEmbedding(skillName: string): Promise<number[]> {
  const normalized = skillName.trim().toLowerCase();
  if (embeddingCache.has(normalized)) {
    return embeddingCache.get(normalized)!;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(skillName);
      if (result.embedding?.values) {
        // Take first 8 normalized components for uniform compatibility
        const values = result.embedding.values.slice(0, 8);
        embeddingCache.set(normalized, values);
        return values;
      }
    } catch (err) {
      console.warn(`Embedding generation failed for "${skillName}", using deterministic vector:`, err);
    }
  }

  // Deterministic 8D pseudo-embedding based on string character hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }

  const deterministicVec = Array.from({ length: 8 }, (_, i) => {
    const val = Math.sin(hash + i * 1.618) * 0.5 + 0.5;
    return Number(val.toFixed(4));
  });

  embeddingCache.set(normalized, deterministicVec);
  return deterministicVec;
}
