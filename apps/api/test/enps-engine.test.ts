import { describe, expect, it } from "vitest";
import { EnpsEngine } from "../src/modules/engagement/engines/enps.engine.js";

describe("EnpsEngine", () => {
  it("calculates standardized eNPS score and category percentage distribution", () => {
    // 10 responses: 6 Promoters (9, 10), 2 Passives (7, 8), 2 Detractors (3, 5)
    // % Promoters = 60%, % Detractors = 20% -> eNPS = +40
    const scores = [10, 9, 9, 10, 9, 10, 8, 7, 5, 3];
    const result = EnpsEngine.calculateEnps({ scores });

    expect(result.totalResponses).toBe(10);
    expect(result.promotersCount).toBe(6);
    expect(result.passivesCount).toBe(2);
    expect(result.detractorsCount).toBe(2);
    expect(result.promoterPercentage).toBe(60);
    expect(result.detractorPercentage).toBe(20);
    expect(result.enpsScore).toBe(40);
    expect(result.ratingTier).toBe("GOOD");
  });

  it("handles high promoter distribution and excellent rating tier", () => {
    const scores = [10, 10, 10, 9, 9, 9, 9, 8, 10, 10];
    // 9 Promoters (90%), 1 Passive (10%), 0 Detractors (0%) -> eNPS = +90
    const result = EnpsEngine.calculateEnps({ scores });

    expect(result.enpsScore).toBe(90);
    expect(result.ratingTier).toBe("EXCELLENT");
  });

  it("handles empty scores array without errors", () => {
    const result = EnpsEngine.calculateEnps({ scores: [] });
    expect(result.totalResponses).toBe(0);
    expect(result.enpsScore).toBe(0);
    expect(result.ratingTier).toBe("NEEDS_IMPROVEMENT");
  });
});
