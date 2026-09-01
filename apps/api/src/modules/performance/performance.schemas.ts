import { z } from "zod";

// 1. Goal Cycles
export const CreateGoalCycleSchema = z.object({
  name: z.string().min(2).max(100),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  type: z.enum(["QUARTERLY", "HALF_YEARLY", "ANNUAL"]).default("QUARTERLY"),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]).default("DRAFT")
});

export const UpdateGoalCycleStatusSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"])
});

// 2. Goals & Key Results
export const CreateKeyResultSchema = z.object({
  title: z.string().min(2).max(200),
  metricType: z.enum(["PERCENTAGE", "NUMERIC", "CURRENCY", "BOOLEAN"]).default("PERCENTAGE"),
  startValue: z.number().default(0),
  targetValue: z.number().default(100),
  currentValue: z.number().default(0),
  weightage: z.number().min(0).max(100).default(25),
  confidenceScore: z.number().min(0).max(1).default(1)
});

export const UpdateKeyResultSchema = z.object({
  currentValue: z.number(),
  confidenceScore: z.number().min(0).max(1).optional()
});

export const CreateGoalSchema = z.object({
  cycleId: z.string().uuid(),
  employeeId: z.string().uuid().optional(), // If omitted, defaults to logged-in user's employee
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.enum(["OKR", "KRA", "DEVELOPMENT"]).default("OKR"),
  weightage: z.number().min(0).max(100).default(10),
  targetValue: z.number().default(100),
  achievedValue: z.number().default(0),
  metricUnit: z.string().optional(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  keyResults: z.array(CreateKeyResultSchema).optional()
});

export const UpdateGoalSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  weightage: z.number().min(0).max(100).optional(),
  targetValue: z.number().optional(),
  achievedValue: z.number().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  evidenceText: z.string().optional(),
  evidenceUrl: z.string().url().optional(),
  managerComments: z.string().optional()
});

export const ApproveGoalSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  comments: z.string().optional(),
  adjustedWeightage: z.number().min(0).max(100).optional()
});

// 3. Continuous Feedback
export const CreateFeedbackSchema = z.object({
  toEmployeeId: z.string().uuid(),
  category: z.enum(["PEER_FEEDBACK", "MANAGER_COACHING", "SPOT_AWARD", "BADGE_RECOGNITION", "GENERAL"]).default("PEER_FEEDBACK"),
  rating: z.number().min(1).max(5).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  badgeName: z.string().optional(),
  visibility: z.enum(["PRIVATE", "MANAGER_ONLY", "EMPLOYEE_VISIBLE", "HR_VISIBLE"]).default("EMPLOYEE_VISIBLE")
});

// 4. 1:1 Meetings
export const ActionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean().default(false),
  dueDate: z.string().optional()
});

export const CreateOneOnOneSchema = z.object({
  employeeId: z.string().uuid(),
  scheduledAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  meetingDurationMinutes: z.number().min(15).max(120).default(30),
  meetingUrl: z.string().url().optional(),
  agenda: z.string().optional(),
  notes: z.string().optional(),
  actionItems: z.array(ActionItemSchema).optional()
});

export const UpdateOneOnOneSchema = z.object({
  scheduledAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  meetingUrl: z.string().url().optional(),
  agenda: z.string().optional(),
  notes: z.string().optional(),
  actionItems: z.array(ActionItemSchema).optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"]).optional()
});

// 5. Review Cycles & 360 Appraisals
export const CreateReviewCycleSchema = z.object({
  name: z.string().min(2).max(100),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  status: z.enum(["DRAFT", "ACTIVE", "SELF_REVIEW", "MANAGER_REVIEW", "CALIBRATION", "FINALIZED", "CLOSED"]).default("DRAFT"),
  settings: z.record(z.unknown()).optional()
});

export const UpdateReviewCycleStageSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "SELF_REVIEW", "MANAGER_REVIEW", "CALIBRATION", "FINALIZED", "CLOSED"])
});

export const CompetencyRatingInputSchema = z.object({
  competencyId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comments: z.string().optional()
});

export const SubmitSelfAssessmentSchema = z.object({
  selfScore: z.number().min(1).max(5),
  selfComments: z.string().optional(),
  strengths: z.string().optional(),
  areasOfGrowth: z.string().optional(),
  competencyRatings: z.array(CompetencyRatingInputSchema).optional()
});

export const SubmitManagerReviewSchema = z.object({
  managerScore: z.number().min(1).max(5),
  managerComments: z.string().optional(),
  strengths: z.string().optional(),
  areasOfGrowth: z.string().optional(),
  ratingLabel: z.enum(["OUTSTANDING", "EXCEEDS_EXPECTATIONS", "MEETS_EXPECTATIONS", "NEEDS_IMPROVEMENT", "UNSATISFACTORY"]).optional(),
  competencyRatings: z.array(CompetencyRatingInputSchema).optional()
});

export const Submit360ScoreSchema = z.object({
  raterType: z.enum(["SELF", "MANAGER", "PEER", "SKIP_MANAGER", "CROSS_FUNCTIONAL"]),
  score: z.number().min(1).max(5),
  weightage: z.number().min(0).max(100).optional(),
  comments: z.string().optional()
});

// 6. Competencies
export const CreateCompetencySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(50),
  description: z.string().optional(),
  category: z.enum(["TECHNICAL", "BEHAVIORAL", "FUNCTIONAL", "LEADERSHIP"]).default("BEHAVIORAL")
});

export const MapDesignationCompetencySchema = z.object({
  designationId: z.string().uuid(),
  competencyId: z.string().uuid(),
  expectedLevel: z.number().min(1).max(5).default(3),
  weightage: z.number().min(0).max(100).default(20)
});

// 7. Calibration
export const CreateCalibrationSessionSchema = z.object({
  cycleId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  sessionName: z.string().min(2).max(100),
  targetDistribution: z.record(z.number()).optional(),
  notes: z.string().optional()
});

export const AdjustCalibrationReviewSchema = z.object({
  reviewId: z.string().uuid(),
  calibratedScore: z.number().min(1).max(5),
  calibratedLabel: z.enum(["OUTSTANDING", "EXCEEDS_EXPECTATIONS", "MEETS_EXPECTATIONS", "NEEDS_IMPROVEMENT", "UNSATISFACTORY"]),
  justification: z.string().min(5)
});

// 8. Salary Increments
export const SetSalaryIncrementRuleSchema = z.object({
  ratingLabel: z.enum(["OUTSTANDING", "EXCEEDS_EXPECTATIONS", "MEETS_EXPECTATIONS", "NEEDS_IMPROVEMENT", "UNSATISFACTORY"]),
  defaultIncrementPct: z.number().min(0).max(100),
  minIncrementPct: z.number().min(0).max(100).default(0),
  maxIncrementPct: z.number().min(0).max(100).default(25),
  budgetAllocationPct: z.number().min(0).max(100).default(100),
  isActive: z.boolean().default(true)
});

// 9. Promotions & Succession
export const EvaluatePromotionSchema = z.object({
  employeeId: z.string().uuid(),
  targetDesignationId: z.string().uuid(),
  potentialScore: z.number().min(1).max(5).default(3),
  proposedSalaryBumpPct: z.number().min(0).max(100).optional(),
  justification: z.string().optional()
});

export const ApprovePromotionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  proposedSalaryBumpPct: z.number().optional(),
  effectiveDate: z.string().optional(),
  comments: z.string().optional()
});

export const CreateSuccessionPositionSchema = z.object({
  designationId: z.string().uuid(),
  title: z.string().min(2).max(100),
  criticality: z.enum(["CRITICAL", "HIGH", "MEDIUM"]).default("HIGH"),
  riskOfLoss: z.string().default("MEDIUM"),
  impactOfLoss: z.string().default("HIGH"),
  notes: z.string().optional()
});

export const AddSuccessorSchema = z.object({
  positionId: z.string().uuid(),
  employeeId: z.string().uuid(),
  readiness: z.enum(["READY_NOW", "READY_IN_6_MONTHS", "READY_IN_1_YEAR", "READY_IN_2_YEARS", "EMERGENCY_BACKUP"]).default("READY_IN_1_YEAR"),
  flightRisk: z.string().default("LOW"),
  nineBoxPosition: z.enum([
    "STAR_HIGH_POTENTIAL",
    "HIGH_PERFORMER_GROWTH",
    "SOLID_PERFORMER_KEY",
    "HIGH_POTENTIAL_DEVELOP",
    "CORE_CONTRIBUTOR",
    "EFFECTIVE_PERFORMER",
    "DILEMMA_QUESTION_MARK",
    "UNDERPERFORMER_COACH",
    "RISK_LOW_PERFORMER"
  ]).default("HIGH_PERFORMER_GROWTH"),
  developmentPlan: z.string().optional()
});

export type CreateGoalCycleDto = z.infer<typeof CreateGoalCycleSchema>;
export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type ApproveGoalDto = z.infer<typeof ApproveGoalSchema>;
export type CreateKeyResultDto = z.infer<typeof CreateKeyResultSchema>;
export type CreateFeedbackDto = z.infer<typeof CreateFeedbackSchema>;
export type CreateOneOnOneDto = z.infer<typeof CreateOneOnOneSchema>;
export type UpdateOneOnOneDto = z.infer<typeof UpdateOneOnOneSchema>;
export type CreateReviewCycleDto = z.infer<typeof CreateReviewCycleSchema>;
export type SubmitSelfAssessmentDto = z.infer<typeof SubmitSelfAssessmentSchema>;
export type SubmitManagerReviewDto = z.infer<typeof SubmitManagerReviewSchema>;
export type Submit360ScoreDto = z.infer<typeof Submit360ScoreSchema>;
export type CreateCompetencyDto = z.infer<typeof CreateCompetencySchema>;
export type CreateCalibrationSessionDto = z.infer<typeof CreateCalibrationSessionSchema>;
export type AdjustCalibrationReviewDto = z.infer<typeof AdjustCalibrationReviewSchema>;
export type SetSalaryIncrementRuleDto = z.infer<typeof SetSalaryIncrementRuleSchema>;
export type EvaluatePromotionDto = z.infer<typeof EvaluatePromotionSchema>;
export type ApprovePromotionDto = z.infer<typeof ApprovePromotionSchema>;
export type CreateSuccessionPositionDto = z.infer<typeof CreateSuccessionPositionSchema>;
export type AddSuccessorDto = z.infer<typeof AddSuccessorSchema>;

