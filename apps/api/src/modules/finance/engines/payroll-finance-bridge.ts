export interface PayrollFinancePostingSource {
  id: string;
  employeeId: string;
  amount: number;
  currency: string;
  type: "REIMBURSEMENT" | "RECOVERY";
}

export interface PayrollFinanceInput {
  payrollRunId: string;
  sources: PayrollFinancePostingSource[];
  alreadyPostedSourceIds?: string[];
}

export class PayrollFinanceBridge {
  generatePayrollInputs(input: PayrollFinanceInput) {
    const alreadyPosted = new Set(input.alreadyPostedSourceIds ?? []);
    return input.sources
      .filter((source) => !alreadyPosted.has(source.id))
      .map((source) => ({
        payrollRunId: input.payrollRunId,
        employeeId: source.employeeId,
        sourceId: source.id,
        adjustmentType: source.type === "REIMBURSEMENT" ? "EARNING" : "DEDUCTION",
        code: source.type === "REIMBURSEMENT" ? "FIN_REIMBURSEMENT" : "FIN_RECOVERY",
        amount: Number(source.amount.toFixed(2)),
        currency: source.currency,
        metadata: {
          sourceType: source.type,
          bridge: "PayrollFinanceBridge"
        }
      }));
  }
}
