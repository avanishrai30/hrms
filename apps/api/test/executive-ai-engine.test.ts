import { describe, it, expect } from "vitest";
import { ExecutiveAiEngine } from "../src/modules/ai/engines/executive-ai.engine.js";

describe("Executive AI Engine (Task 33)", () => {
  it("calculates CEO enterprise metrics accurately", () => {
    const ceo = ExecutiveAiEngine.computeCeoMetrics({
      totalEmployees: 100,
      annualRevenueInr: 50000000,
      totalPayrollAnnualInr: 12000000,
      avgOpenDays: 20,
      attritionCount: 8,
      completedGoalsPercent: 90
    });

    expect(ceo.totalEmployees).toBe(100);
    expect(ceo.revenuePerEmployee).toBe(500000);
    expect(ceo.attritionRiskPercent).toBe(8.0);
    expect(ceo.productivityIndex).toBeGreaterThan(70);
    expect(ceo.growthForecastPercent).toBeGreaterThan(0);
  });

  it("calculates CHRO talent & succession metrics accurately", () => {
    const chro = ExecutiveAiEngine.computeChroMetrics({
      avgHappinessScore: 4.4,
      performanceRatingAvg: 4.2,
      completedTrainings: 40,
      enrolledTrainings: 50,
      readySuccessors: 15,
      keyPositions: 20,
      flightRisks: 3
    });

    expect(chro.averageEngagementScore).toBe(4.4);
    expect(chro.successionReadinessPercent).toBe(75.0);
    expect(chro.learningRoiIndex).toBeGreaterThan(80);
    expect(chro.flightRiskCount).toBe(3);
  });

  it("calculates CFO budget consumption and run rate accurately", () => {
    const cfo = ExecutiveAiEngine.computeCfoMetrics({
      monthlyPayrollInr: 5000000,
      allocatedAnnualBudgetInr: 70000000,
      spentToDateInr: 35000000,
      pendingClaimsInr: 150000,
      statutoryTaxesInr: 900000
    });

    expect(cfo.monthlyPayrollSpendInr).toBe(5000000);
    expect(cfo.annualBudgetConsumptionPercent).toBe(50.0);
    expect(cfo.costTrend).toBe("OPTIMIZED");
    expect(cfo.projectedAnnualRunRateInr).toBe(61050000);
  });

  it("generates contextual AI risk insights when thresholds are breached", () => {
    const ceo = ExecutiveAiEngine.computeCeoMetrics({
      totalEmployees: 100,
      annualRevenueInr: 40000000,
      totalPayrollAnnualInr: 15000000,
      avgOpenDays: 35,
      attritionCount: 18,
      completedGoalsPercent: 65
    });

    const chro = ExecutiveAiEngine.computeChroMetrics({
      avgHappinessScore: 3.2,
      performanceRatingAvg: 3.5,
      completedTrainings: 10,
      enrolledTrainings: 50,
      readySuccessors: 8,
      keyPositions: 20,
      flightRisks: 5
    });

    const cfo = ExecutiveAiEngine.computeCfoMetrics({
      monthlyPayrollInr: 6000000,
      allocatedAnnualBudgetInr: 70000000,
      spentToDateInr: 62000000,
      pendingClaimsInr: 500000,
      statutoryTaxesInr: 1000000
    });

    const risks = ExecutiveAiEngine.generateAiRiskInsights({ ceo, chro, cfo });
    expect(risks.length).toBeGreaterThan(1);
    expect(risks.some((r) => r.category === "ATTRITION")).toBe(true);
    expect(risks.some((r) => r.category === "TALENT")).toBe(true);
    expect(risks.some((r) => r.category === "COST")).toBe(true);
  });
});
