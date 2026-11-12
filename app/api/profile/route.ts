import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  availability: z.record(z.array(z.string())).optional(),
  teachSkills: z
    .array(
      z.object({
        skillId: z.string(),
        level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      })
    )
    .optional(),
  learnSkills: z
    .array(
      z.object({
        skillId: z.string(),
        level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      })
    )
    .optional(),
});

const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            userSkills: {
              include: { skill: true },
            },
            reviewsReceived: {
              include: {
                reviewer: { select: { id: true, name: true, image: true } },
              },
            },
          },
        });

        if (user) {
          const sessionsTaught = await prisma.session.count({
            where: {
              swapRequest: { fromUserId: user.id },
              status: "COMPLETED",
            },
          });

          const sessionsLearned = await prisma.session.count({
            where: {
              swapRequest: { toUserId: user.id },
              status: "COMPLETED",
            },
          });

          const avgRating =
            user.reviewsReceived.length > 0
              ? Number(
                  (
                    user.reviewsReceived.reduce((a, b) => a + b.rating, 0) /
                    user.reviewsReceived.length
                  ).toFixed(1)
                )
              : 5.0;

          return NextResponse.json({
            user: {
              ...user,
              averageRating: avgRating,
              sessionsTaughtCount: sessionsTaught,
              sessionsLearnedCount: sessionsLearned,
            },
          });
        }
      } catch (err: any) {
        console.warn("DB profile fetch failed, using memory store:", err.message);
      }
    }

    // Memory Store fallback
    const memUser = memoryStore.users.find(
      (u) => u.email.toLowerCase() === email
    );

    if (!memUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userSkills = memoryStore.userSkills
      .filter((us) => us.userId === memUser.id)
      .map((us) => ({
        ...us,
        skill: memoryStore.skills.find((s) => s.id === us.skillId),
      }));

    const reviewsReceived = memoryStore.reviews
      .filter((r) => r.revieweeId === memUser.id)
      .map((r) => ({
        ...r,
        reviewer: memoryStore.users.find((u) => u.id === r.reviewerId),
      }));

    const avgRating =
      reviewsReceived.length > 0
        ? Number(
            (
              reviewsReceived.reduce((a, b) => a + b.rating, 0) /
              reviewsReceived.length
            ).toFixed(1)
          )
        : 5.0;

    return NextResponse.json({
      user: {
        ...memUser,
        userSkills,
        reviewsReceived,
        averageRating: avgRating,
        sessionsTaughtCount: 1,
        sessionsLearnedCount: 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Update basic fields
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: data.name ?? user.name,
            bio: data.bio ?? user.bio,
            timezone: data.timezone ?? user.timezone,
            image: data.image !== undefined ? (data.image || null) : user.image,
            availability: (data.availability as any) ?? user.availability,
          },
        });

        // Update skills if provided
        if (data.teachSkills || data.learnSkills) {
          await prisma.userSkill.deleteMany({ where: { userId: user.id } });

          if (data.teachSkills) {
            for (const ts of data.teachSkills) {
              await prisma.userSkill.create({
                data: {
                  userId: user.id,
                  skillId: ts.skillId,
                  type: "TEACH",
                  level: ts.level,
                },
              });
            }
          }

          if (data.learnSkills) {
            for (const ls of data.learnSkills) {
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
        }

        return NextResponse.json({ success: true, message: "Profile updated successfully" });
      } catch (err: any) {
        console.warn("DB profile update failed, using memory store:", err.message);
      }
    }

    // Memory Store update
    const memUser = memoryStore.users.find(
      (u) => u.email.toLowerCase() === email
    );

    if (!memUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (data.name) memUser.name = data.name;
    if (data.bio !== undefined) memUser.bio = data.bio;
    if (data.timezone) memUser.timezone = data.timezone;
    if (data.image !== undefined) memUser.image = data.image || null;
    if (data.availability) memUser.availability = data.availability;

    if (data.teachSkills || data.learnSkills) {
      memoryStore.userSkills = memoryStore.userSkills.filter(
        (us) => us.userId !== memUser.id
      );

      data.teachSkills?.forEach((ts, idx) => {
        memoryStore.userSkills.push({
          id: `usk_${memUser.id}_t_${idx}_${Date.now()}`,
          userId: memUser.id,
          skillId: ts.skillId,
          type: "TEACH",
          level: ts.level,
        });
      });

      data.learnSkills?.forEach((ls, idx) => {
        memoryStore.userSkills.push({
          id: `usk_${memUser.id}_l_${idx}_${Date.now()}`,
          userId: memUser.id,
          skillId: ls.skillId,
          type: "LEARN",
          level: ls.level,
        });
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);
    const hasDb = await checkDbConnection();

    if (hasDb) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (existing) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
          );
        }

        const user = await prisma.user.create({
          data: {
            name,
            email: cleanEmail,
            passwordHash,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              cleanEmail
            )}`,
            timezone: "America/New_York",
          },
        });

        return NextResponse.json(
          {
            user: { id: user.id, name: user.name, email: user.email },
            message: "Account created successfully",
          },
          { status: 201 }
        );
      } catch (err: any) {
        console.warn("DB user creation failed, falling back to memory store:", err.message);
      }
    }

    // Memory Store Signup
    const existingMem = memoryStore.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (existingMem) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email: cleanEmail,
      passwordHash,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        cleanEmail
      )}`,
      bio: "Excited to share and learn new skills!",
      timezone: "America/New_York",
      availability: {
        monday: ["18:00-20:00"],
        wednesday: ["18:00-20:00"],
        saturday: ["10:00-13:00"],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.users.push(newUser);

    return NextResponse.json(
      {
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 });
  }
}
