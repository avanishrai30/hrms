import { z } from "zod";

export const payrollRunStatusSchema = z.enum([
  "DRAFT",
  "PROCESSING",
  "GENERATED",
  "APPROVED",
  "LOCKED",
  "CANCELLED"
]);

export const payrollEmployeeStatusSchema = z.enum([
  "CALCULATED",
  "FLAGGED",
  "APPROVED",
  "PAID",
  "EXCLUDED"
]);

export const payrollAdjustmentTypeSchema = z.enum([
  "BONUS",
  "PENALTY",
  "REIMBURSEMENT",
  "ADVANCE_RECOVERY",
  "CUSTOM"
]);

export const createPayrollRunSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  notes: z.string().trim().max(500).optional()
});

export const addPayrollAdjustmentSchema = z.object({
  payrollRunEmployeeId: z.string().uuid(),
  type: payrollAdjustmentTypeSchema,
  title: z.string().trim().min(2).max(100),
  amount: z.number().refine((val) => val !== 0, "Adjustment amount cannot be zero"),
  reason: z.string().trim().min(2).max(500)
});

export const approvePayrollRunSchema = z.object({
  note: z.string().trim().max(500).optional()
});

export const lockPayrollRunSchema = z.object({
  note: z.string().trim().max(500).optional()
});

export const payrollFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  status: payrollRunStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

// TASK 30 SCHEMAS

export const CreatePayrollCycleSchema = z.object({
  name: z.string().min(2).max(100),
  frequency: z.enum(["MONTHLY", "BIWEEKLY", "WEEKLY"]).default("MONTHLY"),
  startDay: z.number().int().min(1).max(31).default(1),
  endDay: z.number().int().min(1).max(31).default(30),
  payoutDay: z.number().int().min(1).max(31).default(30)
});

export const SubmitTaxDeclarationSchema = z.object({
  financialYear: z.string().regex(/^\d{4}-\d{4}$/, "Format must be YYYY-YYYY e.g. 2026-2027"),
  taxRegime: z.enum(["OLD", "NEW"]).default("NEW"),
  section80C: z.number().min(0).max(150000).default(0),
  section80D: z.number().min(0).max(100000).default(0),
  section24HomeLoanInterest: z.number().min(0).max(200000).default(0),
  section80CCD_NPS: z.number().min(0).max(50000).default(0),
  hraExemptionRentPaidAnnual: z.number().min(0).default(0),
  isMetroCity: z.boolean().default(false),
  otherDeductions: z.number().min(0).default(0),
  notes: z.string().optional()
});

export const VerifyTaxDeclarationSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  notes: z.string().optional()
});

export const UploadTaxProofSchema = z.object({
  declarationId: z.string().uuid(),
  section: z.string().min(2).max(50),
  claimedAmount: z.number().min(1),
  documentUrl: z.string().url()
});

export const VerifyTaxProofSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  verifiedAmount: z.number().min(0).optional(),
  rejectionReason: z.string().optional()
});

export const CreatePayrollSettlementSchema = z.object({
  employeeId: z.string().uuid(),
  resignationDate: z.string().datetime(),
  lastWorkingDate: z.string().datetime(),
  noticePeriodDays: z.number().int().min(0).default(30),
  noticeServedDays: z.number().int().min(0).default(30),
  isNoticeShortfallPayableByEmployee: z.boolean().default(true),
  monthlyGrossSalary: z.number().min(0),
  monthlyBasicSalary: z.number().min(0),
  workingDaysInLastMonth: z.number().min(1).default(30),
  workedDaysInLastMonth: z.number().min(0).default(30),
  remainingPaidLeaveBalanceDays: z.number().min(0).default(0),
  gratuityAmount: z.number().min(0).default(0),
  variablePayAmount: z.number().min(0).default(0),
  bonusAmount: z.number().min(0).default(0),
  pendingReimbursements: z.number().min(0).default(0),
  outstandingLoanBalance: z.number().min(0).default(0),
  assetDamageRecovery: z.number().min(0).default(0),
  otherEarnings: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
  notes: z.string().optional()
});

export const ReviewPayrollSettlementSchema = z.object({
  status: z.enum(["HR_APPROVED", "FINANCE_APPROVED", "DISBURSED"]),
  notes: z.string().optional()
});

export const CalculateGratuitySchema = z.object({
  employeeId: z.string().uuid(),
  dateOfJoining: z.string().datetime(),
  dateOfLeaving: z.string().datetime(),
  lastDrawnBasicSalary: z.number().min(0),
  lastDrawnDa: z.number().min(0).default(0),
  isSeparationDueToDeathOrDisablement: z.boolean().default(false)
});

export const CreatePayrollBonusSchema = z.object({
  employeeId: z.string().uuid(),
  bonusType: z.enum(["ANNUAL", "FESTIVE", "PERFORMANCE", "SIGN_ON", "RETENTION"]).default("PERFORMANCE"),
  financialYear: z.string().regex(/^\d{4}-\d{4}$/),
  month: z.number().int().min(1).max(12),
  bonusAmount: z.number().min(1),
  payoutDate: z.string().datetime(),
  notes: z.string().optional()
});

export const CreatePayrollIncentiveSchema = z.object({
  employeeId: z.string().uuid(),
  incentiveType: z.enum(["SALES_COMMISSION", "KPI_REWARD", "PROJECT_MILESTONE"]).default("KPI_REWARD"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  targetMetric: z.string().min(2).max(100),
  achievedMetric: z.string().min(2).max(100),
  incentiveAmount: z.number().min(1)
});

export const CreatePayrollLoanSchema = z.object({
  employeeId: z.string().uuid(),
  loanType: z.enum(["SALARY_ADVANCE", "EMERGENCY_LOAN", "EDUCATION_LOAN"]).default("SALARY_ADVANCE"),
  principalAmount: z.number().min(1000),
  annualInterestRate: z.number().min(0).default(0),
  totalInstallments: z.number().int().min(1).max(60),
  monthlyEmiAmount: z.number().min(1),
  notes: z.string().optional()
});

export const CreateCompensationRevisionSchema = z.object({
  employeeId: z.string().uuid(),
  currentCtc: z.number().min(1),
  proposedCtc: z.number().min(1),
  percentageHike: z.number(),
  revisionType: z.enum(["ANNUAL_APPRAISAL", "PROMOTION", "MARKET_CORRECTION"]).default("ANNUAL_APPRAISAL"),
  effectiveDate: z.string().datetime(),
  notes: z.string().optional()
});

export const ReviewCompensationRevisionSchema = z.object({
  status: z.enum(["MANAGER_APPROVED", "HR_APPROVED", "CEO_APPROVED", "APPLIED"]),
  notes: z.string().optional()
});

export const CreateSalaryBandSchema = z.object({
  bandCode: z.string().min(1).max(20),
  bandName: z.string().min(2).max(100),
  jobLevel: z.string().min(1).max(50),
  minCtc: z.number().min(1),
  midCtc: z.number().min(1),
  maxCtc: z.number().min(1),
  currency: z.string().default("INR")
});

export type CreatePayrollRunDto = z.infer<typeof createPayrollRunSchema>;
export type AddPayrollAdjustmentDto = z.infer<typeof addPayrollAdjustmentSchema>;
export type ApprovePayrollRunDto = z.infer<typeof approvePayrollRunSchema>;
export type LockPayrollRunDto = z.infer<typeof lockPayrollRunSchema>;
export type PayrollFilterDto = z.infer<typeof payrollFilterSchema>;
