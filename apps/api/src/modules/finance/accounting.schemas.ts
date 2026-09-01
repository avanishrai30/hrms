import { z } from "zod";

export const accountTypeSchema = z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]);
export const invoiceStatusSchema = z.enum(["DRAFT", "SUBMITTED", "APPROVED", "PAID", "PARTIALLY_PAID", "CANCELLED", "OVERDUE"]);
export const erpProviderSchema = z.enum(["TALLY", "ZOHO_BOOKS", "QUICKBOOKS", "SAP"]);

export const createAccountGroupSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: accountTypeSchema,
  parentId: z.string().uuid().optional()
});

export const createAccountSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: accountTypeSchema,
  groupId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  openingBalance: z.number().default(0)
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  isActive: z.boolean().optional()
});

export const journalLineSchema = z.object({
  accountId: z.string().uuid(),
  description: z.string().optional(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0)
});

export const createJournalSchema = z.object({
  entryDate: z.coerce.date(),
  narration: z.string().min(3),
  periodId: z.string().uuid().optional(),
  sourceType: z.string().optional(),
  sourceId: z.string().uuid().optional(),
  lines: z.array(journalLineSchema).min(2)
});

export const updateJournalStatusSchema = z.object({
  action: z.enum(["APPROVE", "POST", "REVERSE"]),
  remarks: z.string().optional()
});

export const createPeriodSchema = z.object({
  name: z.string().min(2),
  fiscalYear: z.number().int().min(2000),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
});

export const updatePeriodStatusSchema = z.object({
  action: z.enum(["CLOSE", "LOCK", "UNLOCK"]),
  remarks: z.string().optional()
});

export const createBankAccountSchema = z.object({
  accountName: z.string().min(2),
  bankName: z.string().min(2),
  accountNumber: z.string().min(4),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  openingBalance: z.number().default(0),
  currentBalance: z.number().default(0),
  currency: z.string().length(3).default("INR")
});

export const bankTransactionSchema = z.object({
  bankAccountId: z.string().uuid(),
  statementId: z.string().uuid().optional(),
  transactionDate: z.coerce.date(),
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z.number().positive(),
  reference: z.string().optional(),
  narration: z.string().optional()
});

export const createBankStatementSchema = z.object({
  bankAccountId: z.string().uuid(),
  statementNumber: z.string().optional(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  fileObjectKey: z.string().optional(),
  transactions: z.array(bankTransactionSchema.omit({ bankAccountId: true, statementId: true })).default([])
});

export const createVendorSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  addressJson: z.record(z.unknown()).optional()
});

export const createCustomerSchema = createVendorSchema;

const invoiceItemSchema = z.object({
  description: z.string().min(2),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().min(0),
  gstRate: z.number().min(0).max(100).default(0)
});

export const createVendorInvoiceSchema = z.object({
  vendorId: z.string().uuid(),
  invoiceNumber: z.string().min(2),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  tdsRate: z.number().min(0).max(100).default(0),
  currency: z.string().length(3).default("INR"),
  items: z.array(invoiceItemSchema).min(1)
});

export const createCustomerInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  invoiceNumber: z.string().min(2),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  currency: z.string().length(3).default("INR"),
  items: z.array(invoiceItemSchema).min(1)
});

export const recordVendorPaymentSchema = z.object({
  vendorId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  paymentDate: z.coerce.date(),
  amount: z.number().positive(),
  reference: z.string().optional(),
  mode: z.string().optional()
});

export const recordCustomerPaymentSchema = z.object({
  customerId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  paymentDate: z.coerce.date(),
  amount: z.number().positive(),
  reference: z.string().optional(),
  mode: z.string().optional()
});

export const reconcileBankSchema = z.object({
  bankAccountId: z.string().uuid()
});

export const gstReturnSchema = z.object({
  returnType: z.enum(["GSTR-1", "GSTR-3B"]),
  period: z.string().min(4)
});

export const erpIntegrationSchema = z.object({
  provider: erpProviderSchema,
  name: z.string().min(2),
  settings: z.record(z.unknown()).optional()
});

export const erpSyncSchema = z.object({
  integrationId: z.string().uuid(),
  jobType: z.enum(["JOURNALS", "INVOICES", "VENDORS", "PAYMENTS"]),
  payload: z.record(z.unknown()).default({})
});

export const accountingReportSchema = z.object({
  report: z.enum(["TRIAL_BALANCE", "PROFIT_AND_LOSS", "BALANCE_SHEET", "CASH_FLOW", "EXPENSE_STATEMENT", "VENDOR_OUTSTANDING", "CUSTOMER_OUTSTANDING", "BANK_RECONCILIATION_SUMMARY", "GST_SUMMARY", "TDS_SUMMARY"]),
  format: z.enum(["CSV", "EXCEL", "PDF", "JSON"]).default("CSV"),
  period: z.string().optional()
});

export type CreateAccountGroupDto = z.infer<typeof createAccountGroupSchema>;
export type CreateAccountDto = z.infer<typeof createAccountSchema>;
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
export type CreateJournalDto = z.infer<typeof createJournalSchema>;
export type UpdateJournalStatusDto = z.infer<typeof updateJournalStatusSchema>;
export type CreatePeriodDto = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodStatusDto = z.infer<typeof updatePeriodStatusSchema>;
export type CreateBankAccountDto = z.infer<typeof createBankAccountSchema>;
export type CreateBankStatementDto = z.infer<typeof createBankStatementSchema>;
export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type CreateVendorInvoiceDto = z.infer<typeof createVendorInvoiceSchema>;
export type CreateCustomerInvoiceDto = z.infer<typeof createCustomerInvoiceSchema>;
export type RecordVendorPaymentDto = z.infer<typeof recordVendorPaymentSchema>;
export type RecordCustomerPaymentDto = z.infer<typeof recordCustomerPaymentSchema>;
export type ReconcileBankDto = z.infer<typeof reconcileBankSchema>;
export type GSTReturnDto = z.infer<typeof gstReturnSchema>;
export type ERPIntegrationDto = z.infer<typeof erpIntegrationSchema>;
export type ERPSyncDto = z.infer<typeof erpSyncSchema>;
export type AccountingReportDto = z.infer<typeof accountingReportSchema>;
