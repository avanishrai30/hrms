import { describe, expect, it } from "vitest";
import { ConfigService } from "@nestjs/config";
import { LocalBiometricProvider } from "./local-biometric.provider.js";
import { DeepFaceHttpBiometricProvider } from "./deepface-http.provider.js";
import { FaceRecognitionEngine } from "../face-recognition.engine.js";

describe("Biometric Provider Abstractions", () => {
  const config = new ConfigService({
    BIOMETRIC_SECRET_KEY: "test-secret-key-12345",
    FACE_SERVICE_URL: "http://127.0.0.1:9999" // simulated offline endpoint
  });

  const localProvider = new LocalBiometricProvider(config);
  const httpProvider = new DeepFaceHttpBiometricProvider(config, localProvider);

  const sampleImage = Buffer.alloc(2048, 120).toString("base64");

  describe("LocalBiometricProvider", () => {
    it("implements FaceDetectionProvider contract", async () => {
      const result = await localProvider.detect(sampleImage, { detectorBackend: "retinaface" });
      expect(result.detected).toBe(true);
      expect(result.detectorBackend).toBe("retinaface");
      expect(result.facialArea).toBeDefined();
    });

    it("implements FaceEmbeddingProvider contract", async () => {
      const result = await localProvider.generateEmbedding(sampleImage, { modelName: "Facenet512" });
      expect(result.embedding.length).toBe(128);
      expect(result.modelVersion).toBe("Facenet512");
    });

    it("implements LivenessProvider contract", async () => {
      const result = await localProvider.evaluateLiveness(sampleImage);
      expect(result.status).toBeDefined();
      expect(result.checksPerformed.length).toBeGreaterThan(0);
    });

    it("implements FaceVerificationProvider contract", async () => {
      const embedding = await localProvider.generateEmbedding(sampleImage);
      const encrypted = FaceRecognitionEngine.encryptEmbedding(embedding.embedding, "test-secret-key-12345");

      const matchResult = await localProvider.verify(sampleImage, encrypted, {
        modelName: "Facenet512",
        threshold: 0.80
      });

      expect(matchResult.matched).toBe(true);
      expect(matchResult.status).toBe("MATCHED");
      expect(matchResult.confidenceScore).toBeGreaterThanOrEqual(0.80);
      expect(matchResult.modelVersion).toBe("Facenet512");
    });
  });

  describe("DeepFaceHttpBiometricProvider resilience & fallback", () => {
    it("falls back gracefully to local provider when microservice is offline", async () => {
      const result = await httpProvider.detect(sampleImage, { detectorBackend: "opencv" });
      expect(result.detected).toBe(true);

      const liveness = await httpProvider.evaluateLiveness(sampleImage);
      expect(liveness.status).toBeDefined();

      const emb = await httpProvider.generateEmbedding(sampleImage, { modelName: "Facenet512" });
      expect(emb.embedding.length).toBe(128);
    });
  });
});
