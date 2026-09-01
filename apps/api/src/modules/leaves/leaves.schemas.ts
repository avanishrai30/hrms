import { z } from "zod";

export const leaveCategorySchema = z.enum([
  "CASUAL",
  "SICK",
  "EARNED",
  "COMPENSATORY_OFF",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "CUSTOM"
]);

export const leaveRequestStatusSchema = z.enum([
  "PENDING_MANAGER",
  "PENDING_HR",
  "APPROVED",
  "REJECTED",
  "CANCELLED"
]);

export const leaveAccrualFrequencySchema = z.enum([
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "MANUAL"
]);

export const sandwichPolicyTypeSchema = z.enum([
  "NONE",
  "WEEKENDS_ONLY",
  "HOLIDAYS_ONLY",
  "WEEKENDS_AND_HOLIDAYS"
]);

export const createLeaveTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z.string().min(2, "Code must be 2-10 characters").max(10).toUpperCase(),
  category: leaveCategorySchema,
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g. #3B82F6)").default("#3B82F6"),
  isPaid: z.boolean().default(true),
  isActive: z.boolean().default(true)
});

export const updateLeavePolicySchema = z.object({
  leaveTypeId: z.string().uuid(),
  annualAllocationDays: z.number().nonnegative(),
  accrualFrequency: leaveAccrualFrequencySchema,
  accrualDaysPerPeriod: z.number().nonnegative(),
  maxCarryForwardDays: z.number().default(0),
  carryForwardExpiryMonths: z.number().int().positive().default(12),
  allowNegativeBalance: z.boolean().default(false),
  maxNegativeBalanceDays: z.number().nonnegative().default(0),
  requiresManagerApproval: z.boolean().default(true),
  requiresHrApproval: z.boolean().default(false),
  requiresAttachment: z.boolean().default(false),
  attachmentMandatoryAboveDays: z.number().int().nonnegative().default(2),
  minimumNoticeDays: z.number().int().nonnegative().default(0),
  maxConsecutiveDays: z.number().int().positive().default(15),
  sandwichPolicy: sandwichPolicyTypeSchema.default("NONE"),
  isActive: z.boolean().default(true)
});

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid().optional(),
  leaveTypeId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  isHalfDay: z.boolean().default(false),
  halfDaySession: z.enum(["FIRST_HALF", "SECOND_HALF"]).optional(),
  reason: z.string().min(4, "Reason must be at least 4 characters").max(500),
  attachmentObjectKey: z.string().optional()
});

export const reviewLeaveRequestSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional()
});

export const cancelLeaveRequestSchema = z.object({
  reason: z.string().min(4, "Cancellation reason must be at least 4 characters").max(300)
});

export const adjustBalanceSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  year: z.number().int().positive(),
  days: z.number(), // positive to credit, negative to debit
  reason: z.string().min(4, "Reason must be at least 4 characters")
});

export const createHolidaySchema = z.object({
  name: z.string().min(2, "Holiday name must be at least 2 characters").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  isOptional: z.boolean().default(false),
  description: z.string().optional()
});

export const leaveFilterSchema = z.object({
  employeeId: z.string().uuid().optional(),
  leaveTypeId: z.string().uuid().optional(),
  status: leaveRequestStatusSchema.optional(),
  year: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export const calendarQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departmentId: z.string().uuid().optional()
});

export type CreateLeaveTypeDto = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeavePolicyDto = z.infer<typeof updateLeavePolicySchema>;
export type CreateLeaveRequestDto = z.infer<typeof createLeaveRequestSchema>;
export type ReviewLeaveRequestDto = z.infer<typeof reviewLeaveRequestSchema>;
export type CancelLeaveRequestDto = z.infer<typeof cancelLeaveRequestSchema>;
export type AdjustBalanceDto = z.infer<typeof adjustBalanceSchema>;
export type CreateHolidayDto = z.infer<typeof createHolidaySchema>;
export type LeaveFilterDto = z.infer<typeof leaveFilterSchema>;
export type CalendarQueryDto = z.infer<typeof calendarQuerySchema>;
