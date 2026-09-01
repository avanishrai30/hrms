import { z } from "zod";

export const suspiciousActivityTypeSchema = z.enum([
  "RAPID_TRAVEL",
  "MULTI_DEVICE",
  "BRUTE_FORCE",
  "LOCATION_SPOOF",
  "UNUSUAL_HOURS",
  "FAILED_BIOMETRIC"
]);
export const SuspiciousActivityTypeSchema = suspiciousActivityTypeSchema;

export const severityLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const SeverityLevelSchema = severityLevelSchema;

export const resolveSuspiciousActivitySchema = z.object({
  resolutionNote: z.string().optional()
});
export const ResolveSuspiciousActivitySchema = resolveSuspiciousActivitySchema;

export const securityAlertQuerySchema = z.object({
  severity: severityLevelSchema.optional(),
  activityType: suspiciousActivityTypeSchema.optional(),
  isResolved: z
    .preprocess((val) => {
      if (typeof val === "string") {
        if (val.toLowerCase() === "true" || val === "1") return true;
        if (val.toLowerCase() === "false" || val === "0") return false;
      }
      return val;
    }, z.boolean())
    .optional(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
export const SecurityAlertQuerySchema = securityAlertQuerySchema;

export const recordSuspiciousActivitySchema = z.object({
  userId: z.string().uuid(),
  activityType: suspiciousActivityTypeSchema,
  severity: severityLevelSchema.default("LOW"),
  details: z.record(z.unknown()).default({})
});
export const RecordSuspiciousActivitySchema = recordSuspiciousActivitySchema;

export type ResolveSuspiciousActivityDto = z.infer<typeof resolveSuspiciousActivitySchema>;
export type SecurityAlertQueryDto = z.infer<typeof securityAlertQuerySchema>;
export type RecordSuspiciousActivityDto = z.infer<typeof recordSuspiciousActivitySchema>;
