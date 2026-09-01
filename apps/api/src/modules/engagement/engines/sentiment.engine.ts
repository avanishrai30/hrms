/**
 * TASK 31 — NATURAL LANGUAGE SENTIMENT & MOOD ANALYSIS ENGINE
 * Evaluates sentiment polarity (-1.0 to +1.0) and classifies emotional tone from employee feedback and pulse notes.
 */

export interface SentimentAnalysisResult {
  score: number; // -1.0 (very negative) to +1.0 (very positive)
  label: "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY_NEGATIVE";
  mood: "VERY_HAPPY" | "HAPPY" | "NEUTRAL" | "UNHAPPY" | "STRESSED";
  detectedKeywords: string[];
}

export class SentimentEngine {
  private static readonly POSITIVE_WORDS = [
    "great", "excellent", "supportive", "awesome", "inspiring", "happy", "love", "fantastic",
    "collaborative", "helpful", "rewarding", "appreciated", "growth", "empowering", "balanced",
    "encouraging", "productive", "healthy", "energized", "enjoy"
  ];

  private static readonly NEGATIVE_WORDS = [
    "burnout", "exhausted", "toxic", "stress", "stressed", "overworked", "terrible", "frustrated",
    "unfair", "micromanagement", "delayed", "chaos", "unhappy", "overwhelmed", "ignored", "leaving",
    "disappointed", "hopeless", "unsupported", "hostile"
  ];

  /**
   * Analyze raw text feedback and calculate sentiment polarity score.
   */
  static analyzeText(text: string): SentimentAnalysisResult {
    if (!text || text.trim().length === 0) {
      return {
        score: 0.0,
        label: "NEUTRAL",
        mood: "NEUTRAL",
        detectedKeywords: []
      };
    }

    const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    let positiveHits = 0;
    let negativeHits = 0;
    const detectedKeywords: string[] = [];

    for (const token of tokens) {
      if (this.POSITIVE_WORDS.includes(token)) {
        positiveHits++;
        detectedKeywords.push(`+${token}`);
      } else if (this.NEGATIVE_WORDS.includes(token)) {
        negativeHits++;
        detectedKeywords.push(`-${token}`);
      }
    }

    const totalHits = positiveHits + negativeHits;
    let score = 0.0;

    if (totalHits > 0) {
      score = (positiveHits - negativeHits) / totalHits;
      score = Math.round(score * 100) / 100;
    }

    let label: "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY_NEGATIVE" = "NEUTRAL";
    let mood: "VERY_HAPPY" | "HAPPY" | "NEUTRAL" | "UNHAPPY" | "STRESSED" = "NEUTRAL";

    if (score >= 0.5) {
      label = "VERY_POSITIVE";
      mood = "VERY_HAPPY";
    } else if (score > 0.1) {
      label = "POSITIVE";
      mood = "HAPPY";
    } else if (score <= -0.5) {
      label = "VERY_NEGATIVE";
      mood = "STRESSED";
    } else if (score < -0.1) {
      label = "NEGATIVE";
      mood = "UNHAPPY";
    }

    return {
      score,
      label,
      mood,
      detectedKeywords
    };
  }
}
