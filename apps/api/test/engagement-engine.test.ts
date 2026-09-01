import { describe, expect, it } from "vitest";
import { EngagementEngine } from "../src/modules/engagement/engines/engagement.engine.js";

describe("EngagementEngine", () => {
  it("computes overall engagement index and participation rate accurately", () => {
    const result = EngagementEngine.calculateEngagementIndex({
      totalEmployeesInvited: 200,
      totalEmployeesResponded: 160,
      questionStats: [
        { questionId: "q1", category: "LEADERSHIP", totalResponses: 160, averageRating: 4.5 },
        { questionId: "q2", category: "GROWTH", totalResponses: 160, averageRating: 4.0 },
        { questionId: "q3", category: "CULTURE", totalResponses: 160, averageRating: 4.8 }
      ]
    });

    expect(result.participationRate).toBe(80);
    // (90 + 80 + 96) / 3 = 266 / 3 = 88.7
    expect(result.overallEngagementScore).toBe(88.7);
    expect(result.categoryScores["CULTURE"]).toBe(96);
    expect(result.categoryScores["GROWTH"]).toBe(80);
    expect(result.topDriverCategory).toBe("CULTURE");
    expect(result.lowestDriverCategory).toBe("GROWTH");
  });

  it("handles zero responses gracefully without divide by zero errors", () => {
    const result = EngagementEngine.calculateEngagementIndex({
      totalEmployeesInvited: 100,
      totalEmployeesResponded: 0,
      questionStats: []
    });

    expect(result.participationRate).toBe(0);
    expect(result.overallEngagementScore).toBe(0);
    expect(result.topDriverCategory).toBe("N/A");
  });
});
