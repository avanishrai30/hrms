import { describe, expect, it } from "vitest";
import { LivenessVerificationStatus } from "@prisma/client";
import { LivenessDetectionEngine } from "./liveness-detection.engine.js";

describe("LivenessDetectionEngine", () => {
  // Helper to generate dummy sample base64 data
  const createSampleBase64 = (length = 2000, variance = true): string => {
    const buffer = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = variance ? (i * 37 + (i % 17) * 23) % 256 : 128;
    }
    return buffer.toString("base64");
  };

  it("fails with CAMERA_ERROR when image payload is empty", () => {
    const result = LivenessDetectionEngine.evaluate("");
    expect(result.passed).toBe(false);
    expect(result.status).toBe(LivenessVerificationStatus.CAMERA_ERROR);
    expect(result.reason).toContain("No image payload");
  });

  it("fails with RETAKE_REQUIRED when image resolution is too small", () => {
    const tinyBase64 = Buffer.alloc(100).toString("base64");
    const result = LivenessDetectionEngine.evaluate(tinyBase64);
    expect(result.passed).toBe(false);
    expect(result.status).toBe(LivenessVerificationStatus.RETAKE_REQUIRED);
    expect(result.reason).toContain("resolution too low");
  });

  it("detects flat surface or synthetic spoof (SUSPICIOUS) when variance is near zero", () => {
    const flatBase64 = createSampleBase64(3000, false); // perfectly uniform bytes
    const result = LivenessDetectionEngine.evaluate(flatBase64);
    expect(result.passed).toBe(false);
    expect(result.status).toBe(LivenessVerificationStatus.SUSPICIOUS);
    expect(result.reason).toContain("Flat surface or digital screen reflection suspected");
  });

  it("confirms liveness (PASSED) for valid high-variance image payload", () => {
    const validBase64 = createSampleBase64(4000, true);
    const result = LivenessDetectionEngine.evaluate(validBase64);
    expect(result.passed).toBe(true);
    expect(result.status).toBe(LivenessVerificationStatus.PASSED);
    expect(result.livenessScore).toBeGreaterThanOrEqual(0.70);
    expect(result.qualityScore).toBeGreaterThanOrEqual(0.60);
    expect(result.checksPerformed.length).toBe(5);
  });
});
