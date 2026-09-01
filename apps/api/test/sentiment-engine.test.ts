import { describe, expect, it } from "vitest";
import { SentimentEngine } from "../src/modules/engagement/engines/sentiment.engine.js";

describe("SentimentEngine", () => {
  it("classifies positive sentiment accurately", () => {
    const text = "Great teamwork, highly supportive leadership, inspiring and collaborative culture!";
    const result = SentimentEngine.analyzeText(text);

    expect(result.score).toBeGreaterThan(0.5);
    expect(result.label).toBe("VERY_POSITIVE");
    expect(result.mood).toBe("VERY_HAPPY");
    expect(result.detectedKeywords.length).toBeGreaterThanOrEqual(3);
  });

  it("classifies negative sentiment and stress keywords accurately", () => {
    const text = "Completely exhausted, toxic micromanagement and feeling burned out and overworked.";
    const result = SentimentEngine.analyzeText(text);

    expect(result.score).toBeLessThan(-0.5);
    expect(result.label).toBe("VERY_NEGATIVE");
    expect(result.mood).toBe("STRESSED");
  });

  it("handles neutral or empty feedback", () => {
    const result = SentimentEngine.analyzeText("");
    expect(result.score).toBe(0.0);
    expect(result.label).toBe("NEUTRAL");
    expect(result.mood).toBe("NEUTRAL");
  });
});
