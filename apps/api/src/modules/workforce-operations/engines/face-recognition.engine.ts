/**
 * TASK 29 — FACE RECOGNITION & LIVENESS FRAUD ENGINE
 * Evaluates facial similarity cosine distance, blink/motion liveness, and anti-photo/screen spoof flags.
 */

export interface FaceMatchInput {
  enrolledEmbedding: number[];
  capturedEmbedding: number[];
  similarityThreshold?: number; // default 0.75
  blinkDetected: boolean;
  motionVerified: boolean;
  antiSpoofScore: number; // 0.0 - 1.0 (>= 0.8 is genuine live face)
}

export interface FaceVerificationOutput {
  isMatch: boolean;
  similarityScore: number; // 0.0 - 1.0
  isLive: boolean;
  antiSpoofScore: number;
  fraudAlerts: string[];
  status: "VERIFIED" | "SPOOF_DETECTED" | "FACE_MISMATCH" | "LIVENESS_FAILED";
}

export class FaceRecognitionEngine {
  /**
   * Calculate cosine similarity between two 128D/512D face embeddings.
   */
  static calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0.0;
    }

    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;

    for (let i = 0; i < vecA.length; i++) {
      const a = vecA[i] ?? 0;
      const b = vecB[i] ?? 0;
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0.0;
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1.0, Math.round(similarity * 1000) / 1000));
  }

  /**
   * Evaluate face attendance verification with multi-tier liveness & anti-spoof checks.
   */
  static evaluateFaceVerification(input: FaceMatchInput): FaceVerificationOutput {
    const similarityScore = this.calculateCosineSimilarity(
      input.enrolledEmbedding,
      input.capturedEmbedding
    );
    const threshold = input.similarityThreshold ?? 0.75;
    const isMatch = similarityScore >= threshold;

    const fraudAlerts: string[] = [];

    if (input.antiSpoofScore < 0.70) {
      fraudAlerts.push("Potential photo or digital screen replay spoof detected.");
    }

    if (!input.blinkDetected && !input.motionVerified) {
      fraudAlerts.push("Liveness test failed: No natural facial micro-motion or blink observed.");
    }

    const isLive = input.antiSpoofScore >= 0.70 && (input.blinkDetected || input.motionVerified);

    let status: "VERIFIED" | "SPOOF_DETECTED" | "FACE_MISMATCH" | "LIVENESS_FAILED" = "VERIFIED";

    if (!isLive) {
      status = input.antiSpoofScore < 0.70 ? "SPOOF_DETECTED" : "LIVENESS_FAILED";
    } else if (!isMatch) {
      status = "FACE_MISMATCH";
      fraudAlerts.push(`Facial embedding similarity (${similarityScore}) below match threshold (${threshold}).`);
    }

    return {
      isMatch,
      similarityScore,
      isLive,
      antiSpoofScore: input.antiSpoofScore,
      fraudAlerts,
      status
    };
  }
}
