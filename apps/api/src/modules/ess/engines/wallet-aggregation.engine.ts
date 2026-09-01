/**
 * TASK 32 — EMPLOYEE DIGITAL WALLET AGGREGATION ENGINE
 * Consolidates reward points, recognition awards, pending expense reimbursements, and payroll net disbursements into a single wallet overview.
 */

export interface WalletSummaryInput {
  rewardPointsBalance: number;
  recognitionPointsLifetime: number;
  pendingReimbursementAmount: number;
  approvedReimbursementAmount: number;
  latestPayrollNetSalary: number;
  currency?: string;
}

export interface WalletSummaryResult {
  rewardPointsBalance: number;
  rewardPointsValueInInr: number;
  totalPendingClaimsInr: number;
  totalApprovedClaimsInr: number;
  latestNetSalaryPaidInr: number;
  totalLiquidHoldingsInr: number; // approved claims + points cash value
  currency: string;
}

export class WalletAggregationEngine {
  /**
   * Aggregate all employee digital balances.
   */
  static computeWalletOverview(input: WalletSummaryInput): WalletSummaryResult {
    const pointsValueInInr = input.rewardPointsBalance * 1.0; // 1 pt = ₹1 INR
    const totalLiquidHoldingsInr = pointsValueInInr + input.approvedReimbursementAmount;

    return {
      rewardPointsBalance: input.rewardPointsBalance,
      rewardPointsValueInInr: pointsValueInInr,
      totalPendingClaimsInr: input.pendingReimbursementAmount,
      totalApprovedClaimsInr: input.approvedReimbursementAmount,
      latestNetSalaryPaidInr: input.latestPayrollNetSalary,
      totalLiquidHoldingsInr,
      currency: input.currency || "INR"
    };
  }
}
