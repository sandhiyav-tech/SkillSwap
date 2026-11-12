import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, memoryStore, checkDbConnection } from "@/lib/prisma";
import { rankMatchesForUser } from "@/lib/matching";
import type { UserProfile, SkillItem } from "@/types";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const matchType = searchParams.get("type"); // DIRECT, SEMANTIC, PARTIAL
    const searchQuery = searchParams.get("q")?.toLowerCase();

    // Default to demo user if not logged in (to allow seamless instant exploration of match feed)
    const userEmail = session?.user?.email || "demo@skillswap.app";

    const hasDb = await checkDbConnection();

    let allUsers: UserProfile[] = [];
    let allSkills: SkillItem[] = [];

    if (hasDb) {
      try {
        const dbSkills = await prisma.skill.findMany();
        allSkills = dbSkills as SkillItem[];

        const dbUsers = await prisma.user.findMany({
          include: {
            userSkills: {
              include: { skill: true },
            },
            reviewsReceived: true,
          },
        });

        allUsers = dbUsers.map((u) => {
          const avg =
            u.reviewsReceived.length > 0
              ? Number(
                  (
                    u.reviewsReceived.reduce((a, b) => a + b.rating, 0) /
                    u.reviewsReceived.length
                  ).toFixed(1)
                )
              : 5.0;

          return {
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            bio: u.bio,
            timezone: u.timezone,
            availability: u.availability as any,
            createdAt: u.createdAt,
            userSkills: u.userSkills as any,
            averageRating: avg,
          };
        });
      } catch (err: any) {
        console.warn("DB matches fetch failed, using memory store:", err.message);
      }
    }

    if (allUsers.length === 0) {
      allSkills = memoryStore.skills;
      allUsers = memoryStore.users.map((u) => {
        const uSkills = memoryStore.userSkills
          .filter((us) => us.userId === u.id)
          .map((us) => ({
            ...us,
            skill: memoryStore.skills.find((s) => s.id === us.skillId),
          }));

        const uReviews = memoryStore.reviews.filter((r) => r.revieweeId === u.id);
        const avg =
          uReviews.length > 0
            ? Number(
                (
                  uReviews.reduce((a, b) => a + b.rating, 0) / uReviews.length
                ).toFixed(1)
              )
            : 5.0;

        return {
          ...u,
          userSkills: uSkills,
          averageRating: avg,
        };
      });
    }

    const currentUser =
      allUsers.find((u) => u.email.toLowerCase() === userEmail.toLowerCase()) ||
      allUsers[0];

    if (!currentUser) {
      return NextResponse.json({ matches: [] });
    }

    let rankedMatches = rankMatchesForUser(currentUser, allUsers, allSkills);

    // Apply Filters
    if (matchType && matchType !== "ALL") {
      rankedMatches = rankedMatches.filter(
        (m) => m.matchType.toUpperCase() === matchType.toUpperCase()
      );
    }

    if (category && category !== "All") {
      rankedMatches = rankedMatches.filter((m) =>
        m.offeredSkills.some(
          (s) => s.category.toLowerCase() === category.toLowerCase()
        )
      );
    }

    if (searchQuery) {
      rankedMatches = rankedMatches.filter(
        (m) =>
          m.user.name.toLowerCase().includes(searchQuery) ||
          m.offeredSkills.some((s) =>
            s.name.toLowerCase().includes(searchQuery)
          ) ||
          m.wantedSkills.some((s) => s.name.toLowerCase().includes(searchQuery))
      );
    }

    return NextResponse.json({
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      matches: rankedMatches,
      count: rankedMatches.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate matches" }, { status: 500 });
  }
}
