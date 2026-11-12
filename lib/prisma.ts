import { PrismaClient } from "@prisma/client";
import {
  SEED_SKILLS,
  SEED_USERS,
  INITIAL_REQUESTS,
  INITIAL_SESSIONS,
  INITIAL_REVIEWS,
  INITIAL_LEARNING_PLAN,
  DEMO_PASSWORD,
} from "./seed-data";
import bcrypt from "bcryptjs";

// Global Prisma Client instance (standard Next.js pattern to prevent multiple connections)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Resilient In-Memory Data Store
 * Initialized with 15 realistic users, 30 skills, requests, sessions, reviews, and learning plans.
 * Used automatically when a remote PostgreSQL instance is not yet connected or during local quick demos.
 */
class MemoryDataStore {
  skills = [...SEED_SKILLS];
  users: any[] = [];
  userSkills: any[] = [];
  swapRequests: any[] = [];
  sessions: any[] = [];
  reviews: any[] = [];
  learningPlans: any[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed() {
    const defaultHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
    this.skills = [...SEED_SKILLS];
    this.users = SEED_USERS.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      bio: u.bio,
      timezone: u.timezone,
      image: u.image,
      availability: u.availability,
      passwordHash: defaultHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.userSkills = [];
    SEED_USERS.forEach((u) => {
      u.teachSkills.forEach((ts, idx) => {
        this.userSkills.push({
          id: `usk_${u.id}_t_${idx}`,
          userId: u.id,
          skillId: ts.skillId,
          type: "TEACH",
          level: ts.level,
          createdAt: new Date().toISOString(),
        });
      });
      u.learnSkills.forEach((ls, idx) => {
        this.userSkills.push({
          id: `usk_${u.id}_l_${idx}`,
          userId: u.id,
          skillId: ls.skillId,
          type: "LEARN",
          level: ls.level,
          createdAt: new Date().toISOString(),
        });
      });
    });

    this.swapRequests = INITIAL_REQUESTS.map((r) => ({
      ...r,
      updatedAt: r.createdAt,
    }));

    this.sessions = INITIAL_SESSIONS.map((s) => ({
      ...s,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.reviews = INITIAL_REVIEWS.map((r) => ({
      ...r,
    }));

    this.learningPlans = [
      {
        ...INITIAL_LEARNING_PLAN,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

// Global in-memory store singleton for server runtime
const globalForStore = globalThis as unknown as {
  memoryStore: MemoryDataStore | undefined;
};

export const memoryStore = globalForStore.memoryStore ?? new MemoryDataStore();
if (process.env.NODE_ENV !== "production") globalForStore.memoryStore = memoryStore;

// Quick helper to test if Postgres is responsive
let isDbConnected: boolean | null = null;

export async function checkDbConnection(): Promise<boolean> {
  if (isDbConnected !== null) return isDbConnected;
  try {
    // 2-second timeout check
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB timeout")), 1500)
    );
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    isDbConnected = true;
    return true;
  } catch {
    isDbConnected = false;
    return false;
  }
}

