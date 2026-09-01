import { describe, expect, it } from "vitest";
import { AttritionEngine } from "../src/modules/workforce/engines/attrition.engine.js";

describe("TASK 28 — Attrition Prediction & Flight Risk Engine", () => {
  it("should score low flight risk for stable, compensated, highly engaged employee", () => {
    const result = AttritionEngine.evaluateAttritionRisk({
      tenureMonths: 48,
      monthsSinceLastPromotion: 12,
      monthsSinceLastSalaryIncrement: 6,
      compensationCompaRatio: 1.10,
      recentPerformanceRating: 4.5,
      leaveSpikeLast90Days: false,
      attendanceIrregularityRate: 0.02,
      lmsEngagementScore: 0.85,
      managerChangesLast12Months: 0
    });

    expect(result.riskScore).toBeLessThan(35);
    expect(result.riskCategory).toBe("LOW");
    expect(result.mitigatingFactors.length).toBeGreaterThan(0);
    expect(result.primaryDrivers.length).toBe(0);
  });

  it("should flag critical flight risk when employee is stagnant and underpaid", () => {
    const result = AttritionEngine.evaluateAttritionRisk({
      tenureMonths: 36,
      monthsSinceLastPromotion: 30,
      monthsSinceLastSalaryIncrement: 20,
      compensationCompaRatio: 0.80,
      recentPerformanceRating: 4.8,
      leaveSpikeLast90Days: true,
      attendanceIrregularityRate: 0.30,
      lmsEngagementScore: 0.2,
      managerChangesLast12Months: 2
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(75);
    expect(result.riskCategory).toBe("CRITICAL");
    expect(result.primaryDrivers).toContain("High performer without promotion for over 24 months");
    expect(result.primaryDrivers).toContain("Compensation is below 85% of designation benchmark median");
    expect(result.primaryDrivers).toContain("Elevated single-day unplanned leave frequency in last 90 days");
    expect(result.recommendedActions.length).toBeGreaterThan(0);
  });

  it("should provide explainable drivers and mitigation playbooks", () => {
    const result = AttritionEngine.evaluateAttritionRisk({
      tenureMonths: 18,
      monthsSinceLastPromotion: 18,
      monthsSinceLastSalaryIncrement: 19,
      compensationCompaRatio: 0.90,
      recentPerformanceRating: 3.5,
      leaveSpikeLast90Days: false,
      attendanceIrregularityRate: 0.05,
      lmsEngagementScore: 0.4,
      managerChangesLast12Months: 0
    });

    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.recommendedActions).toBeDefined();
  });
});
