import {
  MATCHING_WEIGHTS,
  MATCHING_THRESHOLDS,
} from "./matching-config";
import type {
  UserProfile,
  SkillItem,
  MatchResult,
  MatchType,
  MatchScoreBreakdown,
  AvailabilitySchedule,
} from "@/types";

/**
 * Computes cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA?: number[], vecB?: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculates availability overlap in mutual days between two users.
 */
export function calculateAvailabilityOverlap(
  schedA?: AvailabilitySchedule | null,
  schedB?: AvailabilitySchedule | null
): { score: number; overlappingDays: string[] } {
  if (!schedA || !schedB) {
    return { score: 7, overlappingDays: ["Flexible"] }; // default modest score
  }

  const daysA = Object.keys(schedA).filter((d) => (schedA[d] || []).length > 0);
  const daysB = Object.keys(schedB).filter((d) => (schedB[d] || []).length > 0);

  const mutualDays = daysA.filter((day) => daysB.includes(day));

  // Max 15 points
  const score = Math.min(
    MATCHING_WEIGHTS.availabilityOverlapMax,
    Math.round((mutualDays.length / 2) * MATCHING_WEIGHTS.availabilityOverlapMax)
  );

  return {
    score: Math.max(4, score),
    overlappingDays: mutualDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)),
  };
}

/**
 * Evaluates match quality between the current user (User A) and a candidate peer (User B).
 */
export function computeUserMatch(
  currentUser: UserProfile,
  candidate: UserProfile,
  allSkills: SkillItem[]
): MatchResult {
  const getSkills = (u: UserProfile, type: "TEACH" | "LEARN"): SkillItem[] => {
    const list = (u.userSkills || []).filter((us) => us.type === type);
    return list
      .map((us) => us.skill || allSkills.find((s) => s.id === us.skillId))
      .filter(Boolean) as SkillItem[];
  };

  const aTeach = getSkills(currentUser, "TEACH");
  const aLearn = getSkills(currentUser, "LEARN");
  const bTeach = getSkills(candidate, "TEACH");
  const bLearn = getSkills(candidate, "LEARN");

  // 1. Direct Skill Overlap
  // A teaches what B wants
  const directAToB = aTeach.filter((at) =>
    bLearn.some((bl) => bl.id === at.id || bl.name.toLowerCase() === at.name.toLowerCase())
  );
  // B teaches what A wants
  const directBToA = bTeach.filter((bt) =>
    aLearn.some((al) => al.id === bt.id || al.name.toLowerCase() === bt.name.toLowerCase())
  );

  const isTwoWayDirect = directAToB.length > 0 && directBToA.length > 0;
  const isOneWayDirect = directAToB.length > 0 || directBToA.length > 0;

  let skillOverlapScore = 0;
  if (isTwoWayDirect) {
    skillOverlapScore = MATCHING_WEIGHTS.skillOverlapMax;
  } else if (isOneWayDirect) {
    skillOverlapScore = Math.round(MATCHING_WEIGHTS.skillOverlapMax * 0.55);
  }

  // 2. Semantic Similarity on Embeddings
  // Calculate max similarity for A -> B
  let maxSimAToB = 0;
  let topSemanticAToB: { a: SkillItem; b: SkillItem; sim: number } | null = null;
  for (const at of aTeach) {
    for (const bl of bLearn) {
      const sim = cosineSimilarity(at.embedding, bl.embedding);
      if (sim > maxSimAToB) {
        maxSimAToB = sim;
        topSemanticAToB = { a: at, b: bl, sim };
      }
    }
  }

  // Calculate max similarity for B -> A
  let maxSimBToA = 0;
  let topSemanticBToA: { b: SkillItem; a: SkillItem; sim: number } | null = null;
  for (const bt of bTeach) {
    for (const al of aLearn) {
      const sim = cosineSimilarity(bt.embedding, al.embedding);
      if (sim > maxSimBToA) {
        maxSimBToA = sim;
        topSemanticBToA = { b: bt, a: al, sim };
      }
    }
  }

  const avgSemanticSim = (maxSimAToB + maxSimBToA) / 2;
  const semanticScore = Math.min(
    MATCHING_WEIGHTS.semanticSimilarityMax,
    Math.round(avgSemanticSim * MATCHING_WEIGHTS.semanticSimilarityMax)
  );

  // 3. Availability Overlap
  const avail = calculateAvailabilityOverlap(currentUser.availability, candidate.availability);

  // 4. Rating & Reputation
  const avgRating = candidate.averageRating ?? 5.0;
  const ratingScore = Math.min(
    MATCHING_WEIGHTS.ratingReputationMax,
    Math.round((avgRating / 5.0) * MATCHING_WEIGHTS.ratingReputationMax)
  );

  // Composite Score
  let totalScore = Math.round(
    skillOverlapScore + semanticScore + avail.score + ratingScore
  );
  if (isTwoWayDirect) {
    totalScore = Math.min(99, totalScore + MATCHING_THRESHOLDS.directMatchBonus);
  }
  totalScore = Math.min(100, Math.max(10, totalScore));

  // Determine Match Type
  let matchType: MatchType = "PARTIAL";
  if (isTwoWayDirect) {
    matchType = "DIRECT";
  } else if (
    avgSemanticSim >= MATCHING_THRESHOLDS.semanticMinSimilarity ||
    (topSemanticAToB?.sim && topSemanticAToB.sim >= 0.72) ||
    (topSemanticBToA?.sim && topSemanticBToA.sim >= 0.72)
  ) {
    matchType = "SEMANTIC";
  } else {
    matchType = "PARTIAL";
  }

  // AI-generated 2-sentence explanation template
  const whatBOffers = directBToA.length > 0
    ? directBToA.map((s) => s.name).join(", ")
    : topSemanticBToA && topSemanticBToA.sim > 0.65
    ? topSemanticBToA.b.name
    : bTeach[0]?.name || "valuable experience";

  const whatAOffers = directAToB.length > 0
    ? directAToB.map((s) => s.name).join(", ")
    : topSemanticAToB && topSemanticAToB.sim > 0.65
    ? topSemanticAToB.a.name
    : aTeach[0]?.name || "skills";

  const daysText = avail.overlappingDays.length > 0 && avail.overlappingDays[0] !== "Flexible"
    ? `You both have convenient availability on ${avail.overlappingDays.slice(0, 2).join(" and ")}.`
    : `Your schedules align well for flexible weekend and evening sessions.`;

  let aiExplanation = "";
  if (matchType === "DIRECT") {
    aiExplanation = `${candidate.name} can teach you ${whatBOffers}, while you can guide them through ${whatAOffers}. ${daysText}`;
  } else if (matchType === "SEMANTIC") {
    aiExplanation = `${candidate.name}'s expertise in ${whatBOffers} pairs naturally with your goals in ${aLearn[0]?.name || "learning"}, while your background in ${whatAOffers} offers great cross-disciplinary value. ${daysText}`;
  } else {
    aiExplanation = `${candidate.name} is looking to learn ${bLearn[0]?.name || "new skills"}, making this an ideal peer exchange opportunity. ${daysText}`;
  }

  const scoreBreakdown: MatchScoreBreakdown = {
    skillOverlap: skillOverlapScore,
    semanticSimilarity: semanticScore,
    availabilityOverlap: avail.score,
    ratingReputation: ratingScore,
  };

  return {
    user: candidate,
    matchScore: totalScore,
    matchType,
    mutualTeachSkills: directAToB,
    mutualLearnSkills: directBToA,
    offeredSkills: bTeach,
    wantedSkills: bLearn,
    aiExplanation,
    scoreBreakdown,
    overlappingDays: avail.overlappingDays,
  };
}

/**
 * Ranks all candidates for the given user.
 */
export function rankMatchesForUser(
  currentUser: UserProfile,
  allUsers: UserProfile[],
  allSkills: SkillItem[]
): MatchResult[] {
  const candidates = allUsers.filter((u) => u.id !== currentUser.id);

  const results = candidates.map((cand) =>
    computeUserMatch(currentUser, cand, allSkills)
  );

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}
