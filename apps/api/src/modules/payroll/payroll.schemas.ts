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

export type CreatePayrollRunDto = z.infer<typeof createPayrollRunSchema>;
export type AddPayrollAdjustmentDto = z.infer<typeof addPayrollAdjustmentSchema>;
export type ApprovePayrollRunDto = z.infer<typeof approvePayrollRunSchema>;
export type LockPayrollRunDto = z.infer<typeof lockPayrollRunSchema>;
export type PayrollFilterDto = z.infer<typeof payrollFilterSchema>;
