import { describe, expect, it } from "vitest";
import { BellCurveCalibrationEngine } from "../src/modules/performance/engines/bell-curve-calibration.engine.js";

describe("Bell Curve Calibration Engine (Task 21)", () => {
  const engine = new BellCurveCalibrationEngine();

  it("calculates bell curve rating distribution and variance against standard quotas", () => {
    // 20 employees
    const reviews: Array<{ score: number; ratingLabel: "OUTSTANDING" | "EXCEEDS_EXPECTATIONS" | "MEETS_EXPECTATIONS" | "NEEDS_IMPROVEMENT" | "UNSATISFACTORY" }> = [
      { score: 4.8, ratingLabel: "OUTSTANDING" }, // 1 (5%)
      { score: 4.2, ratingLabel: "EXCEEDS_EXPECTATIONS" }, // 3 (15%)
      { score: 4.1, ratingLabel: "EXCEEDS_EXPECTATIONS" },
      { score: 4.0, ratingLabel: "EXCEEDS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" }, // 12 (60%)
      { score: 3.4, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.6, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.2, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.1, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.3, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.7, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.0, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.4, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.6, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 2.5, ratingLabel: "NEEDS_IMPROVEMENT" }, // 3 (15%)
      { score: 2.4, ratingLabel: "NEEDS_IMPROVEMENT" },
      { score: 2.6, ratingLabel: "NEEDS_IMPROVEMENT" },
      { score: 1.8, ratingLabel: "UNSATISFACTORY" } // 1 (5%)
    ];

    const analysis = engine.analyzeDistribution(reviews);

    expect(analysis.totalEmployees).toBe(20);
    expect(analysis.actualDistribution.percentages.OUTSTANDING).toBe(5);
    expect(analysis.actualDistribution.percentages.EXCEEDS_EXPECTATIONS).toBe(15);
    expect(analysis.actualDistribution.percentages.MEETS_EXPECTATIONS).toBe(60);
    expect(analysis.actualDistribution.percentages.NEEDS_IMPROVEMENT).toBe(15);
    expect(analysis.actualDistribution.percentages.UNSATISFACTORY).toBe(5);
    expect(analysis.isConforming).toBe(true);
    expect(analysis.meanScore).toBeGreaterThan(3.0);
  });

  it("detects top-tier inflation when too many employees receive Outstanding ratings", () => {
    const inflatedReviews: Array<{ score: number; ratingLabel: "OUTSTANDING" | "MEETS_EXPECTATIONS" }> = [
      { score: 4.9, ratingLabel: "OUTSTANDING" },
      { score: 4.8, ratingLabel: "OUTSTANDING" },
      { score: 4.7, ratingLabel: "OUTSTANDING" },
      { score: 4.6, ratingLabel: "OUTSTANDING" }, // 40% Outstanding (Target 5%)
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" },
      { score: 3.5, ratingLabel: "MEETS_EXPECTATIONS" }
    ];

    const analysis = engine.analyzeDistribution(
      inflatedReviews as Array<{ score: number; ratingLabel: "OUTSTANDING" | "EXCEEDS_EXPECTATIONS" | "MEETS_EXPECTATIONS" | "NEEDS_IMPROVEMENT" | "UNSATISFACTORY" }>
    );

    expect(analysis.actualDistribution.percentages.OUTSTANDING).toBe(40);
    expect(analysis.isConforming).toBe(false);
    expect(analysis.recommendations.some((r) => r.includes("Top Tier Inflation"))).toBe(true);
  });
});
