import { describe, expect, it } from "vitest";
import { FaceRecognitionEngine } from "../src/modules/workforce-operations/engines/face-recognition.engine.js";

describe("TASK 29 — Face Recognition & Liveness Anti-Spoof Engine", () => {
  const vectorA = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  const vectorB = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]; // identical
  const vectorC = [-0.1, -0.2, -0.3, 0.4, 0.5, -0.6, 0.1, 0.2]; // different

  it("should calculate cosine similarity 1.0 for identical embeddings", () => {
    const sim = FaceRecognitionEngine.calculateCosineSimilarity(vectorA, vectorB);
    expect(sim).toBe(1.0);
  });

  it("should verify live genuine face match", () => {
    const result = FaceRecognitionEngine.evaluateFaceVerification({
      enrolledEmbedding: vectorA,
      capturedEmbedding: vectorB,
      blinkDetected: true,
      motionVerified: true,
      antiSpoofScore: 0.95
    });

    expect(result.isMatch).toBe(true);
    expect(result.isLive).toBe(true);
    expect(result.status).toBe("VERIFIED");
    expect(result.fraudAlerts.length).toBe(0);
  });

  it("should detect photo spoof when antiSpoofScore is below threshold", () => {
    const result = FaceRecognitionEngine.evaluateFaceVerification({
      enrolledEmbedding: vectorA,
      capturedEmbedding: vectorB,
      blinkDetected: false,
      motionVerified: false,
      antiSpoofScore: 0.45 // low anti spoof
    });

    expect(result.isLive).toBe(false);
    expect(result.status).toBe("SPOOF_DETECTED");
    expect(result.fraudAlerts.length).toBeGreaterThan(0);
  });

  it("should detect face mismatch when embedding similarity is low", () => {
    const result = FaceRecognitionEngine.evaluateFaceVerification({
      enrolledEmbedding: vectorA,
      capturedEmbedding: vectorC,
      blinkDetected: true,
      motionVerified: true,
      antiSpoofScore: 0.95
    });

    expect(result.isMatch).toBe(false);
    expect(result.status).toBe("FACE_MISMATCH");
  });
});
