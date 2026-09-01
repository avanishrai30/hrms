import { describe, expect, it } from "vitest";
import { SuccessionEngine } from "../src/modules/workforce/engines/succession.engine.js";
import { BenchStrengthEngine } from "../src/modules/workforce/engines/bench-strength.engine.js";

describe("TASK 28 — Succession & Bench Strength Engines", () => {
  describe("SuccessionEngine.calculateSuccessorReadiness", () => {
    it("should calculate READY_NOW band for top performer with certifications", () => {
      const result = SuccessionEngine.calculateSuccessorReadiness({
        performanceRating: 4.8,
        potentialRating: 4.5,
        competencyScorePercent: 95,
        certificationsCompletedRatio: 1.0,
        managerAssessmentRating: 4.5
      });

      expect(result.readinessScorePercent).toBeGreaterThanOrEqual(85);
      expect(result.readinessBand).toBe("READY_NOW");
      expect(result.breakdown.performanceScore).toBeGreaterThan(90);
    });

    it("should assign READY_1_YEAR for solid candidate with developing competencies", () => {
      const result = SuccessionEngine.calculateSuccessorReadiness({
        performanceRating: 4.0,
        potentialRating: 3.8,
        competencyScorePercent: 75,
        certificationsCompletedRatio: 0.8,
        managerAssessmentRating: 3.5
      });

      expect(result.readinessScorePercent).toBeGreaterThanOrEqual(70);
      expect(result.readinessScorePercent).toBeLessThan(85);
      expect(result.readinessBand).toBe("READY_1_YEAR");
    });

    it("should assign FUTURE_TALENT for early career or low readiness candidates", () => {
      const result = SuccessionEngine.calculateSuccessorReadiness({
        performanceRating: 3.0,
        potentialRating: 3.0,
        competencyScorePercent: 50,
        certificationsCompletedRatio: 0.2,
        managerAssessmentRating: 2.5
      });

      expect(result.readinessScorePercent).toBeLessThan(55);
      expect(result.readinessBand).toBe("FUTURE_TALENT");
    });
  });

  describe("BenchStrengthEngine.evaluatePositionBench", () => {
    it("should evaluate GREEN bench for position with 2+ Ready-Now successors", () => {
      const result = BenchStrengthEngine.evaluatePositionBench({
        positionId: "pos-1",
        positionTitle: "VP Supply Chain",
        isCritical: true,
        successors: [
          { successorId: "s1", readinessBand: "READY_NOW", readinessScore: 92, flightRisk: "LOW" },
          { successorId: "s2", readinessBand: "READY_NOW", readinessScore: 88, flightRisk: "LOW" }
        ]
      });

      expect(result.ragStatus).toBe("GREEN");
      expect(result.vacancyRisk).toBe("LOW");
      expect(result.readyNowCount).toBe(2);
    });

    it("should evaluate RED bench for critical position with zero successors", () => {
      const result = BenchStrengthEngine.evaluatePositionBench({
        positionId: "pos-2",
        positionTitle: "Chief Financial Officer",
        isCritical: true,
        successors: []
      });

      expect(result.ragStatus).toBe("RED");
      expect(result.vacancyRisk).toBe("CRITICAL");
      expect(result.recommendations).toContain(
        "CRITICAL SUCCESSION GAP: Zero identified successors for this critical role."
      );
    });
  });
});
