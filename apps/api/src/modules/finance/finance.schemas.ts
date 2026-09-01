import { z } from "zod";

export const expenseCategorySchema = z.enum([
  "TRAVEL",
  "HOTEL",
  "MEALS",
  "FUEL",
  "INTERNET",
  "MOBILE",
  "TRAINING",
  "OFFICE_SUPPLIES",
  "CLIENT_ENTERTAINMENT",
  "MEDICAL",
  "MILEAGE",
  "MISCELLANEOUS"
]);

export const expenseStatusSchema = z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "PAID", "CANCELLED"]);
export const travelStatusSchema = z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const travelClassSchema = z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST_CLASS", "TRAIN_AC1", "TRAIN_AC2", "TRAIN_AC3", "TRAIN_SLEEPER", "BUS_AC", "BUS_NON_AC", "CAB", "SELF_DRIVE"]);

export const createExpenseCategorySchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: expenseCategorySchema,
  description: z.string().optional(),
  maxAmount: z.number().positive().optional(),
  requiresReceipt: z.boolean().default(true)
});

export const createExpensePolicySchema = z.object({
  name: z.string().min(2),
  category: expenseCategorySchema,
  maxAmountPerItem: z.number().positive().optional(),
  maxAmountPerDay: z.number().positive().optional(),
  maxAmountPerMonth: z.number().positive().optional(),
  mileageRatePerKm: z.number().positive().optional(),
  perDiemRate: z.number().positive().optional(),
  allowedTravelClass: z.array(travelClassSchema).default([]),
  hardLimit: z.boolean().default(false),
  autoReject: z.boolean().default(false),
  warningThreshold: z.number().min(1).max(100).optional(),
  requiresPreApproval: z.boolean().default(false),
  currency: z.string().length(3).default("INR"),
  metadataJson: z.record(z.unknown()).optional()
});

export const expenseReceiptSchema = z.object({
  fileUrl: z.string().min(3),
  fileName: z.string().min(2),
  fileType: z.enum(["PDF", "JPG", "JPEG", "PNG", "HEIC"]),
  fileSizeBytes: z.number().int().positive().optional(),
  contentHash: z.string().min(8).optional(),
  ocrText: z.string().optional()
});

export const expenseItemSchema = z.object({
  categoryId: z.string().uuid().optional(),
  category: expenseCategorySchema,
  description: z.string().min(2),
  amount: z.number().positive(),
  taxAmount: z.number().min(0).default(0),
  gstNumber: z.string().optional(),
  gstAmount: z.number().min(0).optional(),
  currency: z.string().length(3).default("INR"),
  expenseDate: z.coerce.date(),
  merchantName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  mileageKm: z.number().positive().optional(),
  mileageRate: z.number().positive().optional(),
  receipts: z.array(expenseReceiptSchema).default([])
});

export const createExpenseClaimSchema = z.object({
  employeeId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  currency: z.string().length(3).default("INR"),
  costCenterId: z.string().uuid().optional(),
  items: z.array(expenseItemSchema).min(1)
});

export const updateExpenseStatusSchema = z.object({
  action: z.enum(["SUBMIT", "MANAGER_APPROVE", "FINANCE_APPROVE", "APPROVE", "REJECT", "PAY", "CANCEL"]),
  remarks: z.string().optional(),
  approvedAmount: z.number().positive().optional()
});

export const ocrReceiptSchema = z.object({
  fileName: z.string().min(2),
  fileType: z.enum(["PDF", "JPG", "JPEG", "PNG", "HEIC"]),
  sourceText: z.string().default(""),
  contentHash: z.string().min(8).optional()
});

export const uploadReceiptSchema = z.object({
  itemId: z.string().uuid(),
  fileName: z.string().min(2),
  fileType: z.enum(["PDF", "JPG", "JPEG", "PNG", "HEIC"]),
  contentType: z.string().min(3).default("application/octet-stream"),
  base64: z.string().min(4),
  ocrText: z.string().optional()
});

export const travelSegmentSchema = z.object({
  segmentOrder: z.number().int().positive().default(1),
  origin: z.string().min(2),
  destination: z.string().min(2),
  departureDate: z.coerce.date(),
  returnDate: z.coerce.date().optional(),
  travelMode: z.string().min(2),
  travelClass: travelClassSchema.default("ECONOMY"),
  estimatedCost: z.number().min(0).default(0),
  notes: z.string().optional()
});

export const createTravelRequestSchema = z.object({
  employeeId: z.string().uuid(),
  title: z.string().min(2),
  purpose: z.string().min(3),
  travelType: z.enum(["DOMESTIC", "INTERNATIONAL"]).default("DOMESTIC"),
  estimatedBudget: z.number().min(0).default(0),
  currency: z.string().length(3).default("INR"),
  costCenterId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  segments: z.array(travelSegmentSchema).min(1)
});

export const updateTravelStatusSchema = z.object({
  action: z.enum(["SUBMIT", "APPROVE", "REJECT", "START", "COMPLETE", "CANCEL"]),
  remarks: z.string().optional()
});

export const createTravelAdvanceSchema = z.object({
  requestId: z.string().uuid(),
  employeeId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  remarks: z.string().optional()
});

export const createTravelSettlementSchema = z.object({
  requestId: z.string().uuid(),
  employeeId: z.string().uuid(),
  totalActualSpend: z.number().min(0),
  remarks: z.string().optional()
});

export const createCostCenterSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional()
});

export const createDepartmentBudgetSchema = z.object({
  costCenterId: z.string().uuid(),
  fiscalYear: z.number().int().min(2000),
  quarter: z.number().int().min(1).max(4).optional(),
  totalBudget: z.number().min(0),
  allocatedAmount: z.number().min(0).default(0),
  currency: z.string().length(3).default("INR"),
  warningThreshold: z.number().min(1).max(100).default(80)
});

export const createBudgetAllocationSchema = z.object({
  budgetId: z.string().uuid(),
  costCenterId: z.string().uuid(),
  category: z.string().min(2),
  description: z.string().optional(),
  amount: z.number().positive(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional()
});

export const reportExportSchema = z.object({
  report: z.enum(["EXPENSE_REGISTER", "TRAVEL_REGISTER", "BUDGET_CONSUMPTION", "ADVANCE_LEDGER", "SETTLEMENT_LEDGER", "REIMBURSEMENT_REGISTER", "POLICY_VIOLATION"]),
  format: z.enum(["CSV", "EXCEL", "PDF", "JSON"]).default("CSV")
});

export const analyticsPeriodSchema = z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).default("monthly");

export const payrollPostingSchema = z.object({
  payrollRunId: z.string().uuid(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).optional()
});

export type CreateExpenseCategoryDto = z.infer<typeof createExpenseCategorySchema>;
export type CreateExpensePolicyDto = z.infer<typeof createExpensePolicySchema>;
export type CreateExpenseClaimDto = z.infer<typeof createExpenseClaimSchema>;
export type UpdateExpenseStatusDto = z.infer<typeof updateExpenseStatusSchema>;
export type OcrReceiptDto = z.infer<typeof ocrReceiptSchema>;
export type UploadReceiptDto = z.infer<typeof uploadReceiptSchema>;
export type CreateTravelRequestDto = z.infer<typeof createTravelRequestSchema>;
export type UpdateTravelStatusDto = z.infer<typeof updateTravelStatusSchema>;
export type CreateTravelAdvanceDto = z.infer<typeof createTravelAdvanceSchema>;
export type CreateTravelSettlementDto = z.infer<typeof createTravelSettlementSchema>;
export type CreateCostCenterDto = z.infer<typeof createCostCenterSchema>;
export type CreateDepartmentBudgetDto = z.infer<typeof createDepartmentBudgetSchema>;
export type CreateBudgetAllocationDto = z.infer<typeof createBudgetAllocationSchema>;
export type ReportExportDto = z.infer<typeof reportExportSchema>;
export type AnalyticsPeriodDto = z.infer<typeof analyticsPeriodSchema>;
export type PayrollPostingDto = z.infer<typeof payrollPostingSchema>;
