/**
 * SkillSwap Matching Engine Configuration
 * Defines weights, thresholds, and scoring parameters for pairing users.
 */

export const MATCHING_WEIGHTS = {
  // Max weights totaling 100 points
  skillOverlapMax: 40,        // Direct mutual two-way fit
  semanticSimilarityMax: 30,  // Vector embedding cosine similarity
  availabilityOverlapMax: 15, // Mutual day/slot overlap
  ratingReputationMax: 15,    // Teacher/Learner star rating
};

export const MATCHING_THRESHOLDS = {
  // Cosine similarity minimum to count as a semantic match
  semanticMinSimilarity: 0.68,
  // Minimum overall score to display in the primary feed
  minimumMatchScore: 15,
  // Direct match boost
  directMatchBonus: 10,
};

export const MATCH_CATEGORIES = [
  "All",
  "Programming",
  "Design",
  "Languages",
  "Music & Audio",
  "Business & Career",
  "Photography & Video",
  "Writing & Content",
  "Lifestyle & Other",
] as const;

