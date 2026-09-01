import { describe, expect, it } from "vitest";
import { FinanceAnalyticsEngine } from "./finance-analytics.engine.js";

describe("FinanceAnalyticsEngine", () => {
  it("builds spend, category, budget, and cycle metrics", () => {
    const analytics = new FinanceAnalyticsEngine().build({
      period: "monthly",
      expenses: [{
        status: "APPROVED",
        totalAmount: 1200,
        approvedAmount: 1000,
        createdAt: new Date("2026-09-01"),
        submittedAt: new Date("2026-09-01T00:00:00Z"),
        approvedAt: new Date("2026-09-02T00:00:00Z"),
        employeeId: "emp-1",
        costCenterId: "cc-1"
      }],
      items: [{ category: "TRAVEL", amount: 1200, claim: { employeeId: "emp-1", costCenterId: "cc-1" } }],
      travel: [{ status: "APPROVED", estimatedBudget: 5000, actualSpend: 4500, createdAt: new Date("2026-09-01"), approvedAt: new Date("2026-09-03"), costCenterId: "cc-1" }],
      budgets: [{ id: "budget-1", totalBudget: 10000, consumedAmount: 2500, costCenter: { code: "OPS", name: "Operations" } }]
    });

    expect(analytics.monthlySpend).toBe(1000);
    expect(analytics.travelSpend).toBe(4500);
    expect(analytics.categoryBreakdown[0]).toEqual({ key: "TRAVEL", amount: 1200 });
    expect(analytics.averageApprovalTimeHours).toBe(24);
  });
});
