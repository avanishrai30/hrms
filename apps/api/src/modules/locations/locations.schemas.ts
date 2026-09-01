import { z } from "zod";

export const locationTypeSchema = z.enum([
  "FACTORY",
  "OFFICE",
  "WAREHOUSE",
  "RETAIL_OUTLET",
  "DISTRIBUTION_CENTER",
  "CUSTOM"
]);

export const locationVerificationStatusSchema = z.enum([
  "VERIFIED",
  "OUTSIDE_RADIUS",
  "ACCURACY_TOO_LOW",
  "NO_ASSIGNED_LOCATION",
  "LOCATION_DISABLED",
  "ASSIGNMENT_EXPIRED",
  "MANUAL_OVERRIDE",
  "BYPASS_ALLOWED"
]);

export const createLocationSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric with optional dashes or underscores"),
  description: z.string().optional(),
  type: locationTypeSchema.default("OFFICE"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().positive().default(100),
  maxAccuracyMeters: z.number().int().positive().default(100),
  isActive: z.boolean().default(true)
});

export const updateLocationSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  type: locationTypeSchema.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().int().positive().optional(),
  maxAccuracyMeters: z.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

export const createAssignmentSchema = z.object({
  locationId: z.string().uuid(),
  employeeId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  startsOn: z.coerce.date().default(() => new Date()),
  endsOn: z.coerce.date().optional(),
  isPriority: z.boolean().default(false)
}).refine((data) => data.employeeId || data.departmentId, {
  message: "Either employeeId or departmentId must be provided"
});

export const verifyGpsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative(),
  employeeId: z.string().uuid().optional()
});

export const locationOverrideSchema = z.object({
  attendanceId: z.string().uuid().optional(),
  employeeId: z.string().uuid(),
  locationId: z.string().uuid(),
  reason: z.string().min(8)
});

export const locationFilterSchema = z.object({
  type: locationTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export type CreateLocationDto = z.infer<typeof createLocationSchema>;
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;
export type CreateAssignmentDto = z.infer<typeof createAssignmentSchema>;
export type VerifyGpsDto = z.infer<typeof verifyGpsSchema>;
export type LocationOverrideDto = z.infer<typeof locationOverrideSchema>;
export type LocationFilterDto = z.infer<typeof locationFilterSchema>;
