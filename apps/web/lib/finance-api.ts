"use client";

import { apiRequest } from "./api";

export interface FinanceClaim {
  id: string;
  claimNumber: string;
  title: string;
  status: string;
  totalAmount: number;
  approvedAmount?: number | null;
  currency: string;
  employee?: { fullName: string };
  items?: Array<{ id: string; category: string; description?: string | null; amount: number; merchantName?: string | null; receipts?: Array<{ id: string; fileName: string; isDuplicate: boolean }> }>;
  approvals?: Array<{ action: string; remarks?: string | null; actionAt: string }>;
  audits?: Array<{ action: string; previousStatus?: string | null; newStatus?: string | null; createdAt: string }>;
}

export interface FinanceTravelRequest {
  id: string;
  requestNumber: string;
  title: string;
  purpose: string;
  status: string;
  estimatedBudget: number;
  actualSpend?: number | null;
  currency: string;
  employee?: { fullName: string };
  segments?: Array<{ origin: string; destination: string; travelMode: string; estimatedCost: number }>;
  advances?: Array<{ id: string; amount: number; status: string }>;
  settlements?: Array<{ id: string; totalActualSpend: number; balanceDue: number; refundAmount: number }>;
}

export interface FinanceDashboard {
  monthlySpend: number;
  travelSpend: number;
  pendingApprovals: number;
  pendingReimbursements: number;
  policyViolations: number;
  forecastBurnRate: number;
  averageApprovalTimeHours: number;
  averageSettlementTimeHours: number;
  reimbursementCycleHours: number;
  categoryBreakdown: Array<{ key: string; amount: number }>;
  budgetConsumption: Array<{ costCenter: string; totalBudget: number; consumedAmount: number; utilizationPct: number }>;
  budgetMetrics: Array<{ budgetId: string; utilizationPct: number; remaining: number; threshold: string }>;
}

export const financeApi = {
  dashboard: (period = "monthly") => apiRequest<FinanceDashboard>(`/finance?period=${period}`),
  expenses: () => apiRequest<FinanceClaim[]>("/finance/expenses"),
  expense: (id: string) => apiRequest<FinanceClaim>(`/finance/expenses/${id}`),
  createExpense: (payload: unknown) => apiRequest<FinanceClaim>("/finance/expenses", { method: "POST", body: JSON.stringify(payload) }),
  updateExpenseStatus: (id: string, payload: unknown) => apiRequest<FinanceClaim>(`/finance/expenses/${id}/status`, { method: "POST", body: JSON.stringify(payload) }),
  ocrReceipt: (payload: unknown) => apiRequest<unknown>("/finance/receipts/ocr", { method: "POST", body: JSON.stringify(payload) }),
  uploadReceipt: (payload: unknown) => apiRequest<unknown>("/finance/receipts/upload", { method: "POST", body: JSON.stringify(payload) }),
  travel: () => apiRequest<FinanceTravelRequest[]>("/finance/travel"),
  createTravel: (payload: unknown) => apiRequest<FinanceTravelRequest>("/finance/travel", { method: "POST", body: JSON.stringify(payload) }),
  reimbursements: () => apiRequest<FinanceClaim[]>("/finance/reimbursements"),
  exportReport: (payload: unknown) => apiRequest<{ format: string; content: string; mimeType?: string }>("/finance/reports/export", { method: "POST", body: JSON.stringify(payload) })
};

export const accountingApi = {
  accounts: () => apiRequest<Array<{ id: string; code: string; name: string; type: string; isActive: boolean }>>("/finance/accounts"),
  journals: () => apiRequest<Array<{ id: string; entryNumber: string; narration: string; status: string; totalDebit: number; totalCredit: number }>>("/finance/journals"),
  periods: () => apiRequest<Array<{ id: string; name: string; fiscalYear: number; month?: number | null; status: string }>>("/finance/periods"),
  banks: () => apiRequest<Array<{ id: string; accountName: string; bankName: string; currentBalance: number; currency: string }>>("/finance/banks"),
  vendors: () => apiRequest<Array<{ id: string; code: string; name: string; riskScore: number }>>("/finance/vendors"),
  payables: () => apiRequest<Array<{ id: string; invoiceNumber: string; totalAmount: number; paidAmount: number; status: string; vendor?: { name: string } }>>("/finance/payables"),
  receivables: () => apiRequest<Array<{ id: string; invoiceNumber: string; totalAmount: number; paidAmount: number; status: string; customer?: { name: string } }>>("/finance/receivables"),
  intelligence: () => apiRequest<Record<string, number | string | unknown[]>>("/finance/intelligence"),
  exportAccountingReport: (payload: unknown) => apiRequest<{ format: string; content: string; mimeType?: string }>("/finance/accounting/reports/export", { method: "POST", body: JSON.stringify(payload) })
};
