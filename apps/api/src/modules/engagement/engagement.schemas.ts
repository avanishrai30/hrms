import { z } from "zod";

export const CreateEngagementSurveySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  surveyType: z.enum(["ANNUAL_ENGAGEMENT", "CULTURE", "ONBOARDING", "EXIT", "CUSTOM"]).default("ANNUAL_ENGAGEMENT"),
  isAnonymous: z.boolean().default(true),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetDepartmentId: z.string().uuid().optional(),
  targetLocationId: z.string().uuid().optional(),
  questions: z.array(
    z.object({
      questionText: z.string().min(2).max(500),
      questionType: z.enum(["RATING_1_5", "RATING_1_10", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "TEXT", "BOOLEAN"]).default("RATING_1_5"),
      category: z.string().default("CULTURE"),
      isRequired: z.boolean().default(true),
      options: z.array(z.string()).default([])
    })
  ).min(1)
});

export const SubmitSurveyResponseSchema = z.object({
  surveyId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      ratingValue: z.number().optional(),
      textValue: z.string().optional(),
      selectedOptions: z.array(z.string()).optional()
    })
  ).min(1)
});

export const CreatePulseSurveySchema = z.object({
  title: z.string().min(3).max(200),
  questionText: z.string().min(3).max(500),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]).default("WEEKLY"),
  category: z.string().default("HAPPINESS")
});

export const SubmitPulseResponseSchema = z.object({
  pulseSurveyId: z.string().uuid(),
  happinessRating: z.number().int().min(1).max(5),
  stressRating: z.number().int().min(1).max(5).default(2),
  energyRating: z.number().int().min(1).max(5).default(3),
  note: z.string().optional()
});

export const CreateENPSCampaignSchema = z.object({
  title: z.string().min(3).max(200),
  quarter: z.string().min(1).max(10), // e.g. "Q3"
  year: z.number().int().min(2020).max(2100)
});

export const SubmitENPSResponseSchema = z.object({
  campaignId: z.string().uuid(),
  score: z.number().int().min(0).max(10),
  feedbackText: z.string().optional()
});

export const CreateRecognitionSchema = z.object({
  receiverEmployeeId: z.string().uuid(),
  badgeId: z.string().uuid().optional(),
  recognitionType: z.enum([
    "PEER_APPRECIATION",
    "MANAGER_KUDOS",
    "COMPANY_AWARD",
    "VALUES_CHAMPION",
    "MILESTONE_ANNIVERSARY",
    "INNOVATION_STAR"
  ]).default("PEER_APPRECIATION"),
  message: z.string().min(2).max(1000),
  pointsAwarded: z.number().int().min(10).max(1000).default(50),
  isPublic: z.boolean().default(true)
});

export const CreateRewardCatalogItemSchema = z.object({
  itemName: z.string().min(2).max(150),
  category: z.enum(["GIFT_CARD", "EXPERIENCE", "MERCHANDISE", "LEARNING_VOUCHER", "WELLNESS"]).default("GIFT_CARD"),
  pointsCost: z.number().int().min(10),
  cashValueEquivalent: z.number().min(0).default(0),
  stockQuantity: z.number().int().min(0).default(100),
  imageUrl: z.string().url().optional(),
  description: z.string().min(2).max(1000)
});

export const RedeemRewardSchema = z.object({
  catalogItemId: z.string().uuid(),
  fulfillmentDetails: z.record(z.unknown()).default({})
});

export const CreateCommunitySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
  communityType: z.enum(["DEPARTMENT", "INTEREST_GROUP", "CULTURE_CLUB", "SPORTS_WELLNESS", "INNOVATION"]).default("INTEREST_GROUP"),
  icon: z.string().default("💬"),
  isPrivate: z.boolean().default(false)
});

export const CreateCommunityPostSchema = z.object({
  communityId: z.string().uuid().optional(),
  postType: z.enum(["GENERAL", "APPRECIATION", "ANNOUNCEMENT", "EVENT", "POLL"]).default("GENERAL"),
  content: z.string().min(1).max(2000),
  mediaUrls: z.array(z.string().url()).default([])
});

export const CreateCommunityCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(1000)
});

export const CreateSuggestionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  category: z.enum(["PROCESS_IMPROVEMENT", "WORKPLACE_CULTURE", "HEALTH_SAFETY", "SUSTAINABILITY", "TECH_INNOVATION"]).default("PROCESS_IMPROVEMENT"),
  isAnonymous: z.boolean().default(false)
});

export const ReviewSuggestionSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "ACCEPTED", "IMPLEMENTED", "DECLINED"]),
  adminFeedback: z.string().optional(),
  rewardPointsGranted: z.number().int().min(0).default(0)
});

export const CreateInnovationChallengeSchema = z.object({
  title: z.string().min(3).max(200),
  theme: z.string().min(2).max(200),
  description: z.string().min(5).max(3000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rewardPointsPool: z.number().int().min(100).default(10000)
});

export const SubmitInnovationProposalSchema = z.object({
  challengeId: z.string().uuid(),
  proposalTitle: z.string().min(3).max(200),
  executiveSummary: z.string().min(10).max(1000),
  detailedPitch: z.string().min(20).max(5000),
  teamMembers: z.array(z.string()).default([])
});
