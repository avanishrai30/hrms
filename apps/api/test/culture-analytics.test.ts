import { describe, expect, it } from "vitest";
import { CultureAnalyticsEngine } from "../src/modules/engagement/engines/culture-analytics.engine.js";

describe("CultureAnalyticsEngine", () => {
  it("computes comprehensive Culture Health Index (CHI) and assigns grade", () => {
    const result = CultureAnalyticsEngine.computeCultureHealth({
      engagementScore: 85, // 85 * 0.3 = 25.5
      enpsScore: 50, // ((150/200)*100)*0.25 = 75*0.25 = 18.75
      averageHappinessRating: 4.5, // (4.5/5)*100*0.15 = 90*0.15 = 13.5
      monthlyRecognitionsPerEmployee: 2.0, // 100*0.15 = 15.0
      burnoutRiskAverage: 15 // (100-15)*0.15 = 85*0.15 = 12.75
    });

    // Sum: 25.5 + 18.75 + 13.5 + 15.0 + 12.75 = 85.5
    expect(result.cultureHealthIndex).toBe(85.5);
    expect(result.grade).toBe("A");
    expect(result.pillarScores.engagementWeight).toBe(25.5);
    expect(result.summaryDiagnosis).toContain("Strong culture");
  });

  it("assigns D grade for severe disengagement signals", () => {
    const result = CultureAnalyticsEngine.computeCultureHealth({
      engagementScore: 30,
      enpsScore: -60,
      averageHappinessRating: 2.0,
      monthlyRecognitionsPerEmployee: 0.2,
      burnoutRiskAverage: 75
    });

    expect(result.cultureHealthIndex).toBeLessThan(40);
    expect(result.grade).toBe("D");
    expect(result.summaryDiagnosis).toContain("Critical culture disengagement");
  });
});
