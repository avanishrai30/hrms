import { describe, expect, it } from "vitest";
import { Appraisal360Engine } from "../src/modules/performance/engines/appraisal-360.engine.js";

describe("Appraisal 360 Engine (Task 21)", () => {
  const engine = new Appraisal360Engine();

  it("calculates weighted 360 multi-rater appraisal score accurately", () => {
    // Weights: Self 20%, Manager 40%, Peer 20%, Skip 10%, Cross 10%
    const raterScores = [
      { raterType: "SELF", score: 4.5 },
      { raterType: "MANAGER", score: 4.0 },
      { raterType: "PEER", score: 4.2 },
      { raterType: "PEER", score: 4.6 }, // peer avg = 4.4
      { raterType: "SKIP_MANAGER", score: 4.0 },
      { raterType: "CROSS_FUNCTIONAL", score: 4.5 }
    ];

    // Expected: 4.5*0.2 + 4.0*0.4 + 4.4*0.2 + 4.0*0.1 + 4.5*0.1 = 0.90 + 1.60 + 0.88 + 0.40 + 0.45 = 4.23
    const result = engine.calculate360AppraisalScore(raterScores);

    expect(result.finalScore).toBeCloseTo(4.23, 1);
    expect(result.ratingLabel).toBe("EXCEEDS_EXPECTATIONS");
    expect(result.scoreBreakdown.selfScore).toBe(4.5);
    expect(result.scoreBreakdown.managerScore).toBe(4.0);
    expect(result.scoreBreakdown.peerScore).toBe(4.4);
    expect(result.scoreBreakdown.skipLevelScore).toBe(4.0);
    expect(result.scoreBreakdown.crossFunctionalScore).toBe(4.5);
  });

  it("dynamically normalizes weights when optional raters are missing", () => {
    // Only Self (20%) and Manager (40%) present -> Total weight = 60% -> normalized 33.3% / 66.7%
    const raterScores = [
      { raterType: "SELF", score: 5.0 },
      { raterType: "MANAGER", score: 4.0 }
    ];

    // (5.0*0.2 + 4.0*0.4) / 0.6 = (1.0 + 1.6) / 0.6 = 2.6 / 0.6 = 4.33
    const result = engine.calculate360AppraisalScore(raterScores);

    expect(result.finalScore).toBeCloseTo(4.33, 1);
    expect(result.ratingLabel).toBe("EXCEEDS_EXPECTATIONS");
    expect(result.scoreBreakdown.peerScore).toBeNull();
  });

  it("determines correct performance rating labels", () => {
    expect(engine.determineRatingLabel(4.8)).toBe("OUTSTANDING");
    expect(engine.determineRatingLabel(4.0)).toBe("EXCEEDS_EXPECTATIONS");
    expect(engine.determineRatingLabel(3.2)).toBe("MEETS_EXPECTATIONS");
    expect(engine.determineRatingLabel(2.4)).toBe("NEEDS_IMPROVEMENT");
    expect(engine.determineRatingLabel(1.5)).toBe("UNSATISFACTORY");
  });
});
