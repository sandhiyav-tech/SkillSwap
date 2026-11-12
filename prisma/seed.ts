import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  SEED_SKILLS,
  SEED_USERS,
  DEMO_PASSWORD,
  INITIAL_REQUESTS,
  INITIAL_SESSIONS,
  INITIAL_REVIEWS,
  INITIAL_LEARNING_PLAN,
} from "../lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SkillSwap database seed...");

  // 1. Seed Skills
  console.log(`Inserting ${SEED_SKILLS.length} skills...`);
  for (const s of SEED_SKILLS) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: {
        category: s.category,
        embedding: s.embedding,
      },
      create: {
        id: s.id,
        name: s.name,
        category: s.category,
        embedding: s.embedding,
      },
    });
  }

  // 2. Hash default password
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 3. Seed Users & UserSkills
  console.log(`Inserting ${SEED_USERS.length} demo users...`);
  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        bio: u.bio,
        timezone: u.timezone,
        image: u.image,
        availability: u.availability,
        passwordHash,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        bio: u.bio,
        timezone: u.timezone,
        image: u.image,
        availability: u.availability,
        passwordHash,
      },
    });

    // Clean existing user skills to avoid duplicates
    await prisma.userSkill.deleteMany({
      where: { userId: user.id },
    });

    // Insert TEACH skills
    for (const ts of u.teachSkills) {
      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: ts.skillId,
          type: "TEACH",
          level: ts.level,
        },
      });
    }

    // Insert LEARN skills
    for (const ls of u.learnSkills) {
      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: ls.skillId,
          type: "LEARN",
          level: ls.level,
        },
      });
    }
  }

  // 4. Seed Requests
  console.log("Seeding demo swap requests...");
  for (const req of INITIAL_REQUESTS) {
    await prisma.swapRequest.upsert({
      where: { id: req.id },
      update: {
        status: req.status,
        message: req.message,
      },
      create: {
        id: req.id,
        fromUserId: req.fromUserId,
        toUserId: req.toUserId,
        offeredSkillId: req.offeredSkillId,
        requestedSkillId: req.requestedSkillId,
        message: req.message,
        status: req.status,
        createdAt: new Date(req.createdAt),
      },
    });
  }

  // 5. Seed Sessions
  console.log("Seeding demo sessions...");
  for (const ses of INITIAL_SESSIONS) {
    await prisma.session.upsert({
      where: { id: ses.id },
      update: {
        status: ses.status,
        meetingLink: ses.meetingLink,
        notes: ses.notes,
        scheduledAt: new Date(ses.scheduledAt),
      },
      create: {
        id: ses.id,
        swapRequestId: ses.swapRequestId,
        scheduledAt: new Date(ses.scheduledAt),
        durationMins: ses.durationMins,
        meetingLink: ses.meetingLink,
        notes: ses.notes,
        status: ses.status,
      },
    });
  }

  // 6. Seed Reviews
  console.log("Seeding demo reviews...");
  for (const rev of INITIAL_REVIEWS) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {
        rating: rev.rating,
        comment: rev.comment,
      },
      create: {
        id: rev.id,
        sessionId: rev.sessionId,
        reviewerId: rev.reviewerId,
        revieweeId: rev.revieweeId,
        rating: rev.rating,
        comment: rev.comment,
        createdAt: new Date(rev.createdAt),
      },
    });
  }

  // 7. Seed Learning Plan
  console.log("Seeding AI learning plan...");
  await prisma.learningPlan.upsert({
    where: { id: INITIAL_LEARNING_PLAN.id },
    update: {
      content: INITIAL_LEARNING_PLAN.content as any,
    },
    create: {
      id: INITIAL_LEARNING_PLAN.id,
      swapRequestId: INITIAL_LEARNING_PLAN.swapRequestId,
      content: INITIAL_LEARNING_PLAN.content as any,
    },
  });

  console.log("✅ SkillSwap seed complete! Demo account: demo@skillswap.app / Demo@1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
