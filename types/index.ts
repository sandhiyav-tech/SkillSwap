export type SkillType = "TEACH" | "LEARN";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type RequestStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
export type SessionStatus = "PROPOSED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  embedding?: number[];
  createdAt?: Date | string;
}

export interface UserSkillItem {
  id: string;
  userId: string;
  skillId: string;
  type: SkillType;
  level: SkillLevel;
  skill?: SkillItem;
}

export interface AvailabilitySchedule {
  [day: string]: string[]; // "monday": ["09:00-11:00", "14:00-16:00"]
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  timezone: string;
  availability?: AvailabilitySchedule | null;
  createdAt: Date | string;
  userSkills?: (UserSkillItem & { skill: SkillItem })[];
  reviewsReceived?: ReviewItem[];
  averageRating?: number;
  sessionsTaughtCount?: number;
  sessionsLearnedCount?: number;
}

export interface ReviewItem {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date | string;
  reviewer?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export interface SessionItem {
  id: string;
  swapRequestId: string;
  scheduledAt: Date | string;
  durationMins: number;
  meetingLink?: string | null;
  notes?: string | null;
  status: SessionStatus;
  createdAt: Date | string;
  swapRequest?: SwapRequestItem;
  reviews?: ReviewItem[];
}

export interface SwapRequestItem {
  id: string;
  fromUserId: string;
  toUserId: string;
  offeredSkillId: string;
  requestedSkillId: string;
  message?: string | null;
  status: RequestStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
  fromUser?: UserProfile;
  toUser?: UserProfile;
  offeredSkill?: SkillItem;
  requestedSkill?: SkillItem;
  sessions?: SessionItem[];
  learningPlans?: LearningPlanItem[];
}

export interface LearningSessionPlan {
  sessionNumber: number;
  title: string;
  goal: string;
  topics: string[];
  exercises: string[];
  resources: string[];
}

export interface LearningPlanContent {
  learnerDirection: {
    teacherName: string;
    learnerName: string;
    skillName: string;
    targetLevel: string;
    overview: string;
    sessions: LearningSessionPlan[];
  };
  returnDirection?: {
    teacherName: string;
    learnerName: string;
    skillName: string;
    targetLevel: string;
    overview: string;
    sessions: LearningSessionPlan[];
  };
}

export interface LearningPlanItem {
  id: string;
  swapRequestId: string;
  content: LearningPlanContent;
  createdAt: Date | string;
}

export type MatchType = "DIRECT" | "SEMANTIC" | "PARTIAL";

export interface MatchScoreBreakdown {
  skillOverlap: number;       // e.g. 0-40
  semanticSimilarity: number; // e.g. 0-30
  availabilityOverlap: number;// e.g. 0-15
  ratingReputation: number;   // e.g. 0-15
}

export interface MatchResult {
  user: UserProfile;
  matchScore: number; // 0 to 100
  matchType: MatchType;
  mutualTeachSkills: SkillItem[];
  mutualLearnSkills: SkillItem[];
  offeredSkills: SkillItem[];
  wantedSkills: SkillItem[];
  aiExplanation: string;
  scoreBreakdown: MatchScoreBreakdown;
  overlappingDays: string[];
}

