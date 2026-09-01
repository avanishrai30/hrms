import { describe, expect, it } from "vitest";
import { BurnoutEngine } from "../src/modules/engagement/engines/burnout.engine.js";

describe("BurnoutEngine", () => {
  it("flags CRITICAL burnout risk when overtime is high and no leaves have been taken", () => {
    const result = BurnoutEngine.assessBurnoutRisk({
      overtimeHoursLastMonth: 40, // 30 pts
      daysSinceLastLeaveTaken: 130, // 25 pts
      pulseStressRating: 5, // 15 pts
      pulseEnergyRating: 1, // 15 pts
      recentSentimentScore: -0.6 // 15 pts
    });

    // Total points = 100
    expect(result.burnoutRiskScore).toBe(100);
    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.riskFactors.length).toBeGreaterThanOrEqual(4);
    expect(result.recommendedAction).toContain("Immediate manager 1:1 intervention");
  });

  it("calculates LOW risk for balanced workload and positive sentiment", () => {
    const result = BurnoutEngine.assessBurnoutRisk({
      overtimeHoursLastMonth: 5,
      daysSinceLastLeaveTaken: 30,
      pulseStressRating: 2,
      pulseEnergyRating: 4,
      recentSentimentScore: 0.8
    });

    expect(result.burnoutRiskScore).toBe(0);
    expect(result.riskLevel).toBe("LOW");
    expect(result.recommendedAction).toContain("Maintain healthy work rhythms");
  });
});
