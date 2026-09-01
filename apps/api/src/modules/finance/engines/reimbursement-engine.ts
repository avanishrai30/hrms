export interface ReimbursementInput {
  sourceType: "EXPENSE" | "TRAVEL";
  sourceId: string;
  employeeId: string;
  currency: string;
  requestedAmount: number;
  approvedAmount?: number | null;
  advanceAmount?: number | null;
  paidAmount?: number | null;
}

export interface ReimbursementLedgerEntry {
  sourceType: "EXPENSE" | "TRAVEL";
  sourceId: string;
  employeeId: string;
  currency: string;
  amountApproved: number;
  amountPaid: number;
  advanceAdjusted: number;
  balancePending: number;
  recoveryAmount: number;
}

export class ReimbursementEngine {
  calculate(input: ReimbursementInput): ReimbursementLedgerEntry {
    const amountApproved = input.approvedAmount ?? input.requestedAmount;
    const advanceAdjusted = Math.min(amountApproved, input.advanceAmount ?? 0);
    const amountPaid = input.paidAmount ?? Math.max(0, amountApproved - advanceAdjusted);
    const balancePending = Math.max(0, amountApproved - advanceAdjusted - amountPaid);
    const recoveryAmount = Math.max(0, (input.advanceAmount ?? 0) - amountApproved);

    return {
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      employeeId: input.employeeId,
      currency: input.currency,
      amountApproved: Number(amountApproved.toFixed(2)),
      amountPaid: Number(amountPaid.toFixed(2)),
      advanceAdjusted: Number(advanceAdjusted.toFixed(2)),
      balancePending: Number(balancePending.toFixed(2)),
      recoveryAmount: Number(recoveryAmount.toFixed(2))
    };
  }
}
