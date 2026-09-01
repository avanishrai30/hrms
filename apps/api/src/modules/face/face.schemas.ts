import { z } from "zod";

export const faceProfileStatusSchema = z.enum([
  "PENDING_APPROVAL",
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED"
]);

export const faceEnrollmentStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUPERSEDED"
]);

export const faceVerificationStatusSchema = z.enum([
  "MATCHED",
  "MISMATCH",
  "LOW_CONFIDENCE",
  "NO_ACTIVE_PROFILE",
  "SPOOF_DETECTED",
  "QUALITY_FAILED",
  "BYPASSED"
]);

export const livenessVerificationStatusSchema = z.enum([
  "PASSED",
  "FAILED",
  "SUSPICIOUS",
  "RETAKE_REQUIRED",
  "CAMERA_ERROR",
  "TIMEOUT"
]);

export const enrollFaceSchema = z.object({
  employeeId: z.string().uuid().optional(),
  imageBase64: z.string().min(20, "Image base64 payload is required"),
  reason: z.string().optional()
});

export const reviewEnrollmentSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().min(4, "Review note must be at least 4 characters")
});

export const verifyFaceSchema = z.object({
  employeeId: z.string().uuid().optional(),
  imageBase64: z.string().min(20, "Image base64 payload is required"),
  attendanceId: z.string().uuid().optional()
});

export const faceProfileFilterSchema = z.object({
  status: faceProfileStatusSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export const biometricAuditFilterSchema = z.object({
  status: faceVerificationStatusSchema.optional(),
  employeeId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export type EnrollFaceDto = z.infer<typeof enrollFaceSchema>;
export type ReviewEnrollmentDto = z.infer<typeof reviewEnrollmentSchema>;
export type VerifyFaceDto = z.infer<typeof verifyFaceSchema>;
export type FaceProfileFilterDto = z.infer<typeof faceProfileFilterSchema>;
export type BiometricAuditFilterDto = z.infer<typeof biometricAuditFilterSchema>;
