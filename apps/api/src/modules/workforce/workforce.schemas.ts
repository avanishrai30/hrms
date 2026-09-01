import { z } from "zod";

export const CreatePositionSchema = z.object({
  positionCode: z.string().min(2).max(50),
  title: z.string().min(2).max(150),
  departmentId: z.string().uuid().optional(),
  businessUnitId: z.string().uuid().optional(),
  grade: z.string().optional(),
  level: z.string().optional(),
  reportsToPositionId: z.string().uuid().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]).default("FULL_TIME"),
  isCriticalRole: z.boolean().default(false),
  approvedHeadcount: z.number().int().min(1).default(1),
  budgetedAnnualCost: z.number().min(0).default(0),
  currency: z.string().default("INR")
});

export const UpdatePositionSchema = CreatePositionSchema.partial().extend({
  status: z.enum(["DRAFT", "APPROVED", "ACTIVE", "FROZEN", "CLOSED"]).optional()
});

export const AssignPositionSchema = z.object({
  positionId: z.string().uuid(),
  employeeId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  isPrimary: z.boolean().default(true)
});

export const CreateHeadcountPlanSchema = z.object({
  name: z.string().min(3).max(150),
  fiscalYear: z.number().int().min(2020).max(2050),
  periodType: z.enum(["ANNUAL", "QUARTERLY", "MONTHLY"]).default("ANNUAL"),
  departmentId: z.string().uuid().optional(),
  businessUnitId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  currentHeadcount: z.number().int().min(0).default(0),
  approvedHeadcount: z.number().int().min(0).default(0),
  forecastHeadcount: z.number().int().min(0).default(0),
  budgetHeadcount: z.number().int().min(0).default(0),
  vacancyHeadcount: z.number().int().min(0).default(0)
});

export const CreateHeadcountScenarioSchema = z.object({
  planId: z.string().uuid(),
  name: z.string().min(3).max(150),
  description: z.string().optional(),
  growthCase: z.enum(["BEST_CASE", "EXPECTED_CASE", "WORST_CASE"]).default("EXPECTED_CASE"),
  headcountDelta: z.number().int(),
  budgetDelta: z.number().default(0),
  scenarioCost: z.number().min(0).default(0),
  impactSummary: z.string().optional()
});

export const SimulateCostForecastSchema = z.object({
  baseHeadcount: z.number().int().min(1),
  baseAnnualBudget: z.number().min(0).default(0),
  averageAnnualSalaryPerHead: z.number().min(0),
  benefitsRatio: z.number().min(0).max(1).default(0.20),
  taxesAndContributionsRatio: z.number().min(0).max(1).default(0.12),
  headcountDelta: z.number().int(),
  trainingCostPerHire: z.number().min(0).default(25000),
  recruitmentCostPerHire: z.number().min(0).default(50000),
  assetCostPerHire: z.number().min(0).default(75000)
});

export const CreateOrgVersionSchema = z.object({
  versionName: z.string().min(2).max(100),
  effectiveDate: z.string().datetime().optional(),
  snapshotData: z.record(z.unknown()).default({})
});

export const AssessAttritionRiskSchema = z.object({
  employeeId: z.string().uuid(),
  tenureMonths: z.number().int().min(0),
  monthsSinceLastPromotion: z.number().int().min(0),
  monthsSinceLastSalaryIncrement: z.number().int().min(0),
  compensationCompaRatio: z.number().min(0.1).max(3.0).default(1.0),
  recentPerformanceRating: z.number().min(1.0).max(5.0).default(3.0),
  leaveSpikeLast90Days: z.boolean().default(false),
  attendanceIrregularityRate: z.number().min(0).max(1).default(0.05),
  lmsEngagementScore: z.number().min(0).max(1).default(0.5),
  managerChangesLast12Months: z.number().int().min(0).default(0)
});

export const CreateSkillForecastSchema = z.object({
  skillId: z.string().uuid().optional(),
  skillName: z.string().min(2).max(100),
  category: z.string().default("Technical"),
  currentSupplyCount: z.number().int().min(0),
  futureDemandCount: z.number().int().min(0),
  targetHorizonMonths: z.number().int().min(1).max(36).default(12),
  recommendedTrainingTrack: z.string().optional()
});
