import { describe, expect, it } from "vitest";
import { FaceVerificationStatus } from "@prisma/client";
import { FaceRecognitionEngine } from "./face-recognition.engine.js";

describe("FaceRecognitionEngine", () => {
  const secretKey = "test-biometric-secret-key";

  const createSampleBase64 = (seed = 1): string => {
    const buffer = Buffer.alloc(2048);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = ((i * 31 * seed) + (i % 23)) % 256;
    }
    return buffer.toString("base64");
  };

  describe("generateEmbedding", () => {
    it("generates 128-dimensional unit normalized vector", () => {
      const img = createSampleBase64(1);
      const vector = FaceRecognitionEngine.generateEmbedding(img);

      expect(vector.length).toBe(128);

      // Verify L2 norm is ~1.0
      const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeCloseTo(1.0, 3);
    });

    it("is deterministic for identical input image data", () => {
      const img = createSampleBase64(42);
      const v1 = FaceRecognitionEngine.generateEmbedding(img);
      const v2 = FaceRecognitionEngine.generateEmbedding(img);

      expect(v1).toEqual(v2);
    });
  });

  describe("encryption & decryption", () => {
    it("encrypts embedding and decrypts back to original vector", () => {
      const img = createSampleBase64(7);
      const originalVector = FaceRecognitionEngine.generateEmbedding(img);

      const encrypted = FaceRecognitionEngine.encryptEmbedding(originalVector, secretKey);
      expect(encrypted).toContain(":");
      expect(encrypted).not.toContain(JSON.stringify(originalVector));

      const decrypted = FaceRecognitionEngine.decryptEmbedding(encrypted, secretKey);
      expect(decrypted.length).toBe(128);

      for (let i = 0; i < 128; i++) {
        expect(decrypted[i]).toBeCloseTo(originalVector[i] ?? 0, 5);
      }
    });

    it("fails decryption when secret key is incorrect", () => {
      const originalVector = FaceRecognitionEngine.generateEmbedding(createSampleBase64(3));
      const encrypted = FaceRecognitionEngine.encryptEmbedding(originalVector, secretKey);

      expect(() =>
        FaceRecognitionEngine.decryptEmbedding(encrypted, "wrong-key")
      ).toThrow();
    });
  });

  describe("calculateCosineSimilarity", () => {
    it("returns 1.0 for identical vectors", () => {
      const v1 = FaceRecognitionEngine.generateEmbedding(createSampleBase64(1));
      const sim = FaceRecognitionEngine.calculateCosineSimilarity(v1, v1);
      expect(sim).toBeCloseTo(1.0, 3);
    });

    it("returns lower similarity for completely different vectors", () => {
      const v1 = FaceRecognitionEngine.generateEmbedding(createSampleBase64(1));
      const v2 = FaceRecognitionEngine.generateEmbedding(createSampleBase64(999));
      const sim = FaceRecognitionEngine.calculateCosineSimilarity(v1, v2);
      expect(sim).toBeLessThan(0.95);
    });
  });

  describe("verify", () => {
    it("returns MATCHED when candidate image matches enrolled embedding above threshold", () => {
      const img = createSampleBase64(10);
      const vector = FaceRecognitionEngine.generateEmbedding(img);
      const encrypted = FaceRecognitionEngine.encryptEmbedding(vector, secretKey);

      const result = FaceRecognitionEngine.verify({
        candidateImageBase64: img,
        enrolledEncryptedEmbedding: encrypted,
        threshold: 0.80,
        secretKey
      });

      expect(result.matched).toBe(true);
      expect(result.status).toBe(FaceVerificationStatus.MATCHED);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0.80);
      expect(result.reason).toContain("Face matched successfully");
    });

    it("returns MISMATCH or LOW_CONFIDENCE when image does not match", () => {
      const imgEnrolled = createSampleBase64(10);
      const imgCandidate = createSampleBase64(9999);

      const vector = FaceRecognitionEngine.generateEmbedding(imgEnrolled);
      const encrypted = FaceRecognitionEngine.encryptEmbedding(vector, secretKey);

      const result = FaceRecognitionEngine.verify({
        candidateImageBase64: imgCandidate,
        enrolledEncryptedEmbedding: encrypted,
        threshold: 0.95,
        secretKey
      });

      expect(result.matched).toBe(false);
      expect(result.status).toBe(FaceVerificationStatus.LOW_CONFIDENCE);
      expect(result.reason).toContain("below acceptable threshold");
    });
  });
});
