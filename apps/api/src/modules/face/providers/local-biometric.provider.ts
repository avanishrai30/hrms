import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FaceRecognitionEngine } from "../face-recognition.engine.js";
import { LivenessDetectionEngine } from "../liveness-detection.engine.js";
import type {
  DetectionOptions,
  DetectionResult,
  EmbeddingOptions,
  EmbeddingResult,
  FaceDetectionProvider,
  FaceEmbeddingProvider,
  FaceVerificationProvider,
  LivenessProvider,
  LivenessResult,
  VerificationOptions,
  VerificationResult
} from "./biometric-provider.interface.js";

@Injectable()
export class LocalBiometricProvider
  implements FaceDetectionProvider, FaceEmbeddingProvider, FaceVerificationProvider, LivenessProvider
{
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey =
      this.configService.get<string>("BIOMETRIC_SECRET_KEY") ?? "vc-wms-biometrics-secure-key-default";
  }

  async detect(_imageBase64: string, options?: DetectionOptions): Promise<DetectionResult> {
    return {
      detected: true,
      detectorBackend: options?.detectorBackend ?? "opencv",
      facialArea: { x: 40, y: 50, w: 180, h: 220 },
      confidence: 0.99
    };
  }

  async generateEmbedding(imageBase64: string, options?: EmbeddingOptions): Promise<EmbeddingResult> {
    const embedding = FaceRecognitionEngine.generateEmbedding(imageBase64);
    return {
      embedding,
      dimensions: embedding.length,
      modelVersion: options?.modelName ?? "Facenet512",
      detectorBackend: options?.detectorBackend ?? "opencv"
    };
  }

  async verify(
    candidateImageBase64: string,
    enrolledEncryptedEmbedding: string,
    options?: VerificationOptions
  ): Promise<VerificationResult> {
    const modelVersion = options?.modelName ?? "Facenet512";
    const distanceMetric = options?.distanceMetric ?? "cosine";
    const threshold = options?.threshold ?? FaceRecognitionEngine.DEFAULT_CONFIDENCE_THRESHOLD;

    const result = FaceRecognitionEngine.verify({
      candidateImageBase64,
      enrolledEncryptedEmbedding,
      threshold,
      secretKey: this.secretKey
    });

    return {
      matched: result.matched,
      status: result.status,
      confidenceScore: result.confidenceScore,
      thresholdUsed: result.thresholdUsed,
      modelVersion,
      distanceMetric,
      reason: result.reason
    };
  }

  async evaluateLiveness(imageBase64: string): Promise<LivenessResult> {
    const result = LivenessDetectionEngine.evaluate(imageBase64);
    return {
      passed: result.passed,
      status: result.status,
      livenessScore: result.livenessScore,
      qualityScore: result.qualityScore,
      checksPerformed: result.checksPerformed,
      reason: result.reason
    };
  }
}
