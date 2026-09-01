import { describe, expect, it } from "vitest";
import { BudgetEngine } from "./budget.engine.js";

describe("BudgetEngine", () => {
  it("calculates consumed, committed, remaining, and threshold notifications", () => {
    const metric = new BudgetEngine().evaluate({
      id: "budget-1",
      costCenterId: "cc-1",
      totalBudget: 100000,
      allocatedAmount: 70000,
      consumedAmount: 80000,
      committedAmount: 12000,
      warningThreshold: 90
    });

    expect(metric.utilizationPct).toBe(92);
    expect(metric.remaining).toBe(8000);
    expect(metric.threshold).toBe("90");
    expect(metric.notifications).toContain("budget.warning_threshold.exceeded");
  });
});
