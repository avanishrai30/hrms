import { describe, expect, it } from "vitest";
import { WorkforceForecastingEngine } from "../src/modules/workforce/engines/forecasting.engine.js";

describe("TASK 28 — Workforce Forecasting Engine", () => {
  it("should project 12-month horizon hiring and attrition accurately", () => {
    const result = WorkforceForecastingEngine.generateHorizonForecast({
      currentHeadcount: 240,
      annualizedAttritionRate: 0.10, // 24 backfills
      plannedGrowthRate: 0.15, // 36 expansion
      averageCostPerHeadAnnual: 1000000,
      timeHorizonMonths: 12
    });

    expect(result.startingHeadcount).toBe(240);
    expect(result.projectedOrganicAttrition).toBe(24);
    expect(result.projectedNewHiringDemand).toBe(60); // 24 + 36
    expect(result.projectedEndingHeadcount).toBe(276);
    expect(result.netHeadcountChange).toBe(36);
    expect(result.recruitmentCapacityRequiredMonthly).toBe(5); // 60 / 12 = 5
  });

  it("should scale correctly for 6-month planning horizon", () => {
    const result = WorkforceForecastingEngine.generateHorizonForecast({
      currentHeadcount: 200,
      annualizedAttritionRate: 0.12,
      plannedGrowthRate: 0.20,
      averageCostPerHeadAnnual: 800000,
      timeHorizonMonths: 6
    });

    expect(result.horizonMonths).toBe(6);
    expect(result.projectedOrganicAttrition).toBe(12); // 200 * 0.12 * 0.5
    expect(result.projectedNewHiringDemand).toBe(32); // 12 + (200 * 0.2 * 0.5) = 12 + 20 = 32
    expect(result.projectedEndingHeadcount).toBe(220);
  });

  it("should generate Best/Expected/Worst scenario triad", () => {
    const triad = WorkforceForecastingEngine.generateScenarioTriad(240, 850000);

    expect(triad.bestCase.projectedEndingHeadcount).toBeGreaterThan(triad.expectedCase.projectedEndingHeadcount);
    expect(triad.expectedCase.projectedEndingHeadcount).toBeGreaterThan(triad.worstCase.projectedEndingHeadcount);
    expect(triad.worstCase.projectedOrganicAttrition).toBeGreaterThan(triad.bestCase.projectedOrganicAttrition);
  });
});
