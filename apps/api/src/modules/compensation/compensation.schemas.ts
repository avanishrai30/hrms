import { z } from "zod";

export const salaryComponentTypeSchema = z.enum([
  "EARNING",
  "DEDUCTION",
  "EMPLOYER_CONTRIBUTION",
  "INFORMATIONAL"
]);

export const salaryComponentCategorySchema = z.enum([
  "BASIC",
  "HRA",
  "CONVEYANCE",
  "MEDICAL",
  "SPECIAL_ALLOWANCE",
  "BONUS",
  "PF",
  "ESI",
  "PROFESSIONAL_TAX",
  "TDS",
  "CUSTOM"
]);

export const compensationCalculationTypeSchema = z.enum([
  "FLAT_AMOUNT",
  "PERCENTAGE_OF_BASIC",
  "PERCENTAGE_OF_GROSS",
  "FORMULA"
]);

export const compensationStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "REVISED",
  "TERMINATED"
]);

export const compensationChangeReasonSchema = z.enum([
  "JOINING_SALARY",
  "ANNUAL_REVISION",
  "PROMOTION_INCREASE",
  "MANUAL_ADJUSTMENT",
  "OTHER"
]);

export const createSalaryComponentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(20).toUpperCase(),
  type: salaryComponentTypeSchema,
  category: salaryComponentCategorySchema,
  isTaxable: z.boolean().default(true),
  isFixed: z.boolean().default(true),
  calculationType: compensationCalculationTypeSchema,
  calculationValue: z.number().min(0),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true)
});

export const updateSalaryComponentSchema = createSalaryComponentSchema.partial();

export const compensationTemplateItemInputSchema = z.object({
  componentId: z.string().uuid(),
  calculationType: compensationCalculationTypeSchema,
  calculationValue: z.number().min(0),
  monthlyAmount: z.number().min(0),
  annualAmount: z.number().min(0),
  order: z.number().int().min(0).optional()
});

export const createCompensationTemplateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(20).toUpperCase(),
  description: z.string().trim().max(500).optional(),
  jobRole: z.string().trim().max(100).optional(),
  currency: z.string().trim().length(3).toUpperCase(),
  isActive: z.boolean().default(true),
  items: z.array(compensationTemplateItemInputSchema).min(1, "Template must include at least one salary component")
});

export const updateCompensationTemplateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  jobRole: z.string().trim().max(100).optional(),
  currency: z.string().trim().min(2).max(10).optional(),
  isActive: z.boolean().optional(),
  items: z.array(compensationTemplateItemInputSchema).optional()
});

export const employeeCompensationItemInputSchema = z.object({
  componentId: z.string().uuid(),
  monthlyAmount: z.number().min(0),
  annualAmount: z.number().min(0)
});

export const assignEmployeeCompensationSchema = z.object({
  employeeId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  monthlyCtc: z.number().positive("Monthly CTC must be greater than 0"),
  annualCtc: z.number().positive("Annual CTC must be greater than 0").optional(),
  currency: z.string().trim().length(3).toUpperCase(),
  reason: compensationChangeReasonSchema.default("JOINING_SALARY"),
  notes: z.string().trim().max(500).optional(),
  items: z.array(employeeCompensationItemInputSchema).optional()
});

export const reviseEmployeeCompensationSchema = z.object({
  newMonthlyCtc: z.number().positive("New Monthly CTC must be greater than 0"),
  newAnnualCtc: z.number().positive("New Annual CTC must be greater than 0").optional(),
  templateId: z.string().uuid().optional(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  reason: compensationChangeReasonSchema,
  notes: z.string().trim().min(3, "Please provide a reason or notes for the revision").max(500),
  items: z.array(employeeCompensationItemInputSchema).optional()
});

export const calculateBreakdownSchema = z.object({
  monthlyCtc: z.number().positive("Monthly CTC must be greater than 0"),
  templateId: z.string().uuid().optional()
});

export const compensationFilterSchema = z.object({
  status: compensationStatusSchema.optional(),
  employeeId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateSalaryComponentDto = z.infer<typeof createSalaryComponentSchema>;
export type UpdateSalaryComponentDto = z.infer<typeof updateSalaryComponentSchema>;
export type CreateCompensationTemplateDto = z.infer<typeof createCompensationTemplateSchema>;
export type UpdateCompensationTemplateDto = z.infer<typeof updateCompensationTemplateSchema>;
export type AssignEmployeeCompensationDto = z.infer<typeof assignEmployeeCompensationSchema>;
export type ReviseEmployeeCompensationDto = z.infer<typeof reviseEmployeeCompensationSchema>;
export type CalculateBreakdownDto = z.infer<typeof calculateBreakdownSchema>;
export type CompensationFilterDto = z.infer<typeof compensationFilterSchema>;
