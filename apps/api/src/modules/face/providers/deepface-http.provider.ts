import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FaceRecognitionEngine } from "../face-recognition.engine.js";
import { LocalBiometricProvider } from "./local-biometric.provider.js";
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
export class DeepFaceHttpBiometricProvider
  implements FaceDetectionProvider, FaceEmbeddingProvider, FaceVerificationProvider, LivenessProvider
{
  private readonly logger = new Logger(DeepFaceHttpBiometricProvider.name);
  private readonly serviceUrl: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly localFallback: LocalBiometricProvider
  ) {
    this.serviceUrl = this.configService.get<string>("FACE_SERVICE_URL") ?? "http://localhost:8000";
    this.secretKey =
      this.configService.get<string>("BIOMETRIC_SECRET_KEY") ?? "vc-wms-biometrics-secure-key-default";
  }

  async detect(imageBase64: string, options?: DetectionOptions): Promise<DetectionResult> {
    try {
      const res = await fetch(`${this.serviceUrl}/api/v1/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64,
          detector_backend: options?.detectorBackend ?? "opencv"
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (res.ok) {
        const data = (await res.json()) as {
          detected: boolean;
          detector_backend: string;
          facial_area: { x: number; y: number; w: number; h: number };
          confidence: number;
        };
        return {
          detected: data.detected,
          detectorBackend: data.detector_backend,
          facialArea: data.facial_area,
          confidence: data.confidence
        };
      }
    } catch (err: unknown) {
      this.logger.debug(`DeepFace service unavailable, using local fallback: ${err instanceof Error ? err.message : ""}`);
    }

    return this.localFallback.detect(imageBase64, options);
  }

  async generateEmbedding(imageBase64: string, options?: EmbeddingOptions): Promise<EmbeddingResult> {
    const modelVersion = options?.modelName ?? "Facenet512";
    const detectorBackend = options?.detectorBackend ?? "opencv";

    try {
      const res = await fetch(`${this.serviceUrl}/api/v1/represent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64,
          model_name: modelVersion,
          detector_backend: detectorBackend
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (res.ok) {
        const data = (await res.json()) as {
          embedding: number[];
          dimensions: number;
          model_version: string;
          detector_backend: string;
        };
        return {
          embedding: data.embedding,
          dimensions: data.dimensions,
          modelVersion: data.model_version,
          detectorBackend: data.detector_backend
        };
      }
    } catch (err: unknown) {
      this.logger.debug(`DeepFace service unavailable, using local fallback: ${err instanceof Error ? err.message : ""}`);
    }

    return this.localFallback.generateEmbedding(imageBase64, options);
  }

  async verify(
    candidateImageBase64: string,
    enrolledEncryptedEmbedding: string,
    options?: VerificationOptions
  ): Promise<VerificationResult> {
    const modelVersion = options?.modelName ?? "Facenet512";
    const distanceMetric = options?.distanceMetric ?? "cosine";
    const threshold = options?.threshold ?? 0.80;

    let enrolledVector: number[];
    try {
      enrolledVector = FaceRecognitionEngine.decryptEmbedding(enrolledEncryptedEmbedding, this.secretKey);
    } catch {
      return this.localFallback.verify(candidateImageBase64, enrolledEncryptedEmbedding, options);
    }

    try {
      // 1. Extract candidate embedding
      const candEmb = await this.generateEmbedding(candidateImageBase64, { modelName: modelVersion });

      // 2. Call FastAPI verify
      const res = await fetch(`${this.serviceUrl}/api/v1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_embedding: candEmb.embedding,
          enrolled_embedding: enrolledVector,
          model_name: modelVersion,
          distance_metric: distanceMetric,
          custom_threshold: threshold
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (res.ok) {
        const data = (await res.json()) as {
          verified: boolean;
          distance: number;
          threshold: number;
          confidence_score: number;
          model_name: string;
          distance_metric: string;
        };

        const status = data.verified
          ? ("MATCHED" as const)
          : data.confidence_score >= 0.5
          ? ("LOW_CONFIDENCE" as const)
          : ("MISMATCH" as const);

        return {
          matched: data.verified,
          status,
          confidenceScore: data.confidence_score,
          thresholdUsed: data.threshold,
          distance: data.distance,
          modelVersion: data.model_name,
          distanceMetric: data.distance_metric,
          reason: data.verified
            ? `DeepFace matched face (${Math.round(data.confidence_score * 100)}% score, threshold: ${Math.round(data.threshold * 100)}%).`
            : `DeepFace match score (${Math.round(data.confidence_score * 100)}%) is below acceptable threshold (${Math.round(data.threshold * 100)}%).`
        };
      }
    } catch (err: unknown) {
      this.logger.debug(`DeepFace verify unavailable, using local fallback: ${err instanceof Error ? err.message : ""}`);
    }

    return this.localFallback.verify(candidateImageBase64, enrolledEncryptedEmbedding, options);
  }

  async evaluateLiveness(imageBase64: string): Promise<LivenessResult> {
    try {
      const res = await fetch(`${this.serviceUrl}/api/v1/liveness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (res.ok) {
        const data = (await res.json()) as {
          passed: boolean;
          status: string;
          liveness_score: number;
          quality_score: number;
          checks_performed: string[];
          reason: string;
          metadata?: Record<string, unknown>;
        };

        return {
          passed: data.passed,
          status: data.status as LivenessResult["status"],
          livenessScore: data.liveness_score,
          qualityScore: data.quality_score,
          checksPerformed: data.checks_performed,
          reason: data.reason,
          metadata: data.metadata
        };
      }
    } catch (err: unknown) {
      this.logger.debug(`DeepFace liveness service unavailable, using local fallback: ${err instanceof Error ? err.message : ""}`);
    }

    return this.localFallback.evaluateLiveness(imageBase64);
  }
}
