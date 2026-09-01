import { describe, expect, it } from "vitest";
import { PromotionReadinessEngine } from "../src/modules/performance/engines/promotion-readiness.engine.js";
import { SuccessionNineBoxEngine } from "../src/modules/performance/engines/succession-nine-box.engine.js";

describe("Promotion Readiness & Succession Planning Engine (Task 21)", () => {
  const promotionEngine = new PromotionReadinessEngine();
  const successionEngine = new SuccessionNineBoxEngine();

  it("evaluates candidate promotion readiness points accurately", () => {
    // 1. High Performer with strong tenure (Performance 4.8, Competency 4.5, Tenure 24 mos, Potential 4.5)
    // Points: (4.8/5)*40=38.4 + (4.5/5)*30=27.0 + (24/18 => 1.0)*15=15.0 + (4.5/5)*15=13.5 = 93.9
    const readyCandidate = promotionEngine.evaluatePromotionReadiness({
      performanceScore: 4.8,
      competencyScore: 4.5,
      tenureMonths: 24,
      potentialScore: 4.5,
      minTenureMonths: 18
    });

    expect(readyCandidate.readinessScore).toBeCloseTo(93.9, 1);
    expect(readyCandidate.readinessRating).toBe("READY_NOW");
    expect(readyCandidate.isEligibleForPromotion).toBe(true);
    expect(readyCandidate.suggestedSalaryBumpPct).toBe(18.0);
    expect(readyCandidate.gapAnalysis.length).toBe(0);

    // 2. Early tenure / development candidate (Performance 3.5, Competency 3.2, Tenure 6 mos, Potential 3.0)
    const developingCandidate = promotionEngine.evaluatePromotionReadiness({
      performanceScore: 3.5,
      competencyScore: 3.2,
      tenureMonths: 6,
      potentialScore: 3.0,
      minTenureMonths: 18
    });

    expect(developingCandidate.readinessScore).toBeLessThan(70);
    expect(developingCandidate.readinessRating).toBe("READY_IN_1_YEAR");
    expect(developingCandidate.isEligibleForPromotion).toBe(false);
    expect(developingCandidate.gapAnalysis.length).toBeGreaterThan(0);
  });

  it("correctly categorizes employees on the 9-Box Grid", () => {
    // High Perf (4.5), High Pot (4.5) -> Star
    const star = successionEngine.mapToNineBoxGrid({
      performanceScore: 4.5,
      potentialScore: 4.5
    });
    expect(star.position).toBe("STAR_HIGH_POTENTIAL");
    expect(star.category).toBe("TOP_TALENT");

    // High Perf (4.2), Med Pot (3.2) -> High Performer
    const highPerformer = successionEngine.mapToNineBoxGrid({
      performanceScore: 4.2,
      potentialScore: 3.2
    });
    expect(highPerformer.position).toBe("HIGH_PERFORMER_GROWTH");

    // Med Perf (3.2), Med Pot (3.0) -> Core Player
    const core = successionEngine.mapToNineBoxGrid({
      performanceScore: 3.2,
      potentialScore: 3.0
    });
    expect(core.position).toBe("CORE_CONTRIBUTOR");
    expect(core.category).toBe("CORE_TALENT");

    // Low Perf (2.0), Low Pot (2.0) -> Risk
    const risk = successionEngine.mapToNineBoxGrid({
      performanceScore: 2.0,
      potentialScore: 2.0
    });
    expect(risk.position).toBe("RISK_LOW_PERFORMER");
    expect(risk.category).toBe("ACTION_NEEDED");
  });
});
