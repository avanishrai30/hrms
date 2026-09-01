import { z } from "zod";

export const payslipStatusSchema = z.enum([
  "DRAFT",
  "GENERATED",
  "DISTRIBUTED",
  "VIEWED",
  "DOWNLOADED",
  "ARCHIVED"
]);

export const payslipSignatureStatusSchema = z.enum([
  "UNSIGNED",
  "SIGNED",
  "REVOKED"
]);

export const payslipDistributionStatusSchema = z.enum([
  "PENDING",
  "QUEUED",
  "SENT",
  "DELIVERED",
  "OPENED",
  "FAILED"
]);

export const generateRunPayslipsSchema = z.object({
  payrollRunId: z.string().uuid()
});

export const generateEmployeePayslipSchema = z.object({
  payrollRunEmployeeId: z.string().uuid()
});

export const distributePayslipsSchema = z.object({
  payslipIds: z.array(z.string().uuid()).min(1, "At least one payslip ID is required"),
  channel: z.enum(["EMAIL"]).default("EMAIL")
});

export const payslipFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  employeeId: z.string().uuid().optional(),
  status: payslipStatusSchema.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const distributionFilterSchema = z.object({
  status: payslipDistributionStatusSchema.optional(),
  employeeId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type GenerateRunPayslipsDto = z.infer<typeof generateRunPayslipsSchema>;
export type GenerateEmployeePayslipDto = z.infer<typeof generateEmployeePayslipSchema>;
export type DistributePayslipsDto = z.infer<typeof distributePayslipsSchema>;
export type PayslipFilterDto = z.infer<typeof payslipFilterSchema>;
export type DistributionFilterDto = z.infer<typeof distributionFilterSchema>;
