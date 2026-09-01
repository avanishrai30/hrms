import { z } from "zod";

export const complianceTypeSchema = z.enum(["PF", "ESI", "PT", "TDS"]);
export const taxRegimeSchema = z.enum(["OLD", "NEW"]);

export const createComplianceRuleSchema = z.object({
  type: complianceTypeSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
  state: z.string().trim().optional(),
  description: z.string().optional(),
  configuration: z.record(z.unknown()).default({}),
  effectiveFrom: z.coerce.date().default(() => new Date())
});

export const createRuleVersionSchema = z.object({
  configuration: z.record(z.unknown()),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional()
});

export const calculatePreviewSchema = z.object({
  employeeId: z.string().uuid().optional(),
  basicWage: z.coerce.number().min(0),
  grossWage: z.coerce.number().min(0),
  state: z.string().default("MH"),
  month: z.coerce.number().min(1).max(12).default(new Date().getMonth() + 1),
  year: z.coerce.number().min(2020).max(2100).default(new Date().getFullYear()),
  isVpfEnabled: z.boolean().default(false),
  vpfRate: z.coerce.number().min(0).max(100).default(0),
  taxRegime: taxRegimeSchema.default("NEW"),
  taxDeclarations80C: z.coerce.number().min(0).default(0),
  taxDeclarations80D: z.coerce.number().min(0).default(0)
});

export const complianceReportFilterSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
  payrollRunId: z.string().uuid().optional()
});

export type CreateComplianceRuleDto = z.infer<typeof createComplianceRuleSchema>;
export type CreateRuleVersionDto = z.infer<typeof createRuleVersionSchema>;
export type CalculatePreviewDto = z.infer<typeof calculatePreviewSchema>;
export type ComplianceReportFilterDto = z.infer<typeof complianceReportFilterSchema>;
