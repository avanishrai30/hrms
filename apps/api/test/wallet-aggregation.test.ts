import { describe, expect, it } from "vitest";
import { WalletAggregationEngine } from "../src/modules/ess/engines/wallet-aggregation.engine.js";

describe("WalletAggregationEngine", () => {
  it("should calculate total liquid holdings and points INR equivalence", () => {
    const summary = WalletAggregationEngine.computeWalletOverview({
      rewardPointsBalance: 1500,
      recognitionPointsLifetime: 5000,
      pendingReimbursementAmount: 2500,
      approvedReimbursementAmount: 6000,
      latestPayrollNetSalary: 85000,
      currency: "INR"
    });

    expect(summary.rewardPointsBalance).toBe(1500);
    expect(summary.rewardPointsValueInInr).toBe(1500);
    expect(summary.totalPendingClaimsInr).toBe(2500);
    expect(summary.totalApprovedClaimsInr).toBe(6000);
    expect(summary.latestNetSalaryPaidInr).toBe(85000);
    // 1500 pts INR + 6000 approved claims = 7500 INR
    expect(summary.totalLiquidHoldingsInr).toBe(7500);
    expect(summary.currency).toBe("INR");
  });
});
