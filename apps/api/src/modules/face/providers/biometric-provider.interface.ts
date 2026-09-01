import { type FaceVerificationStatus, type LivenessVerificationStatus } from "@prisma/client";

export const FACE_DETECTION_PROVIDER = Symbol("FACE_DETECTION_PROVIDER");
export const FACE_EMBEDDING_PROVIDER = Symbol("FACE_EMBEDDING_PROVIDER");
export const FACE_VERIFICATION_PROVIDER = Symbol("FACE_VERIFICATION_PROVIDER");
export const LIVENESS_PROVIDER = Symbol("LIVENESS_PROVIDER");

export interface DetectionOptions {
  detectorBackend?: string; // e.g. "opencv", "retinaface", "mtcnn", "ssd"
}

export interface DetectionResult {
  detected: boolean;
  detectorBackend: string;
  facialArea: { x: number; y: number; w: number; h: number };
  confidence: number;
}

export interface EmbeddingOptions {
  modelName?: string; // e.g. "Facenet512", "ArcFace", "VGG-Face", "resnet-face-v1"
  detectorBackend?: string;
}

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  modelVersion: string;
  detectorBackend: string;
}

export interface VerificationOptions {
  modelName?: string;
  distanceMetric?: "cosine" | "euclidean" | "euclidean_l2";
  threshold?: number;
}

export interface VerificationResult {
  matched: boolean;
  status: FaceVerificationStatus;
  confidenceScore: number;
  thresholdUsed: number;
  distance?: number;
  modelVersion: string;
  distanceMetric: string;
  reason: string;
}

export interface LivenessResult {
  passed: boolean;
  status: LivenessVerificationStatus;
  livenessScore: number;
  qualityScore: number;
  checksPerformed: string[];
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface FaceDetectionProvider {
  detect(imageBase64: string, options?: DetectionOptions): Promise<DetectionResult>;
}

export interface FaceEmbeddingProvider {
  generateEmbedding(imageBase64: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
}

export interface FaceVerificationProvider {
  verify(
    candidateImageBase64: string,
    enrolledEncryptedEmbedding: string,
    options?: VerificationOptions
  ): Promise<VerificationResult>;
}

export interface LivenessProvider {
  evaluateLiveness(imageBase64: string): Promise<LivenessResult>;
}
