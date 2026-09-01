import { z } from "zod";

export const attendanceStatusSchema = z.enum([
  "PRESENT",
  "ABSENT",
  "HALF_DAY",
  "LATE",
  "HOLIDAY",
  "WEEK_OFF",
  "WORK_FROM_HOME",
  "ON_LEAVE",
  "PENDING_REVIEW"
]);

export const attendanceEventTypeSchema = z.enum([
  "CHECK_IN",
  "CHECK_OUT",
  "MANUAL_ADJUSTMENT",
  "STATUS_CHANGE",
  "CORRECTION_REQUEST",
  "CORRECTION_APPROVAL",
  "CORRECTION_REJECTION"
]);

export const correctionStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);

const jsonRecordSchema = z.record(z.unknown());

export const checkInSchema = z.object({
  notes: z.string().optional(),
  source: z.string().default("WEB"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().nonnegative().optional(),
  faceImageBase64: z.string().optional(),
  overrideReason: z.string().optional(),
  deviceMetadata: jsonRecordSchema.optional()
});

export const checkOutSchema = z.object({
  notes: z.string().optional(),
  source: z.string().default("WEB"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().nonnegative().optional(),
  faceImageBase64: z.string().optional(),
  overrideReason: z.string().optional(),
  deviceMetadata: jsonRecordSchema.optional()
});

export const manualAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.coerce.date(),
  status: attendanceStatusSchema.default("PRESENT"),
  shiftId: z.string().uuid().optional(),
  checkInAt: z.coerce.date().optional(),
  checkOutAt: z.coerce.date().optional(),
  reason: z.string().min(8),
  notes: z.string().optional()
});

export const updateAttendanceSchema = z.object({
  status: attendanceStatusSchema.optional(),
  shiftId: z.string().uuid().optional(),
  checkInAt: z.coerce.date().optional(),
  checkOutAt: z.coerce.date().optional(),
  reason: z.string().min(8),
  notes: z.string().optional()
});

export const createCorrectionSchema = z.object({
  attendanceId: z.string().uuid().optional(),
  reason: z.string().min(8),
  requestedChange: z.object({
    date: z.string().min(10),
    checkInAt: z.string().optional(),
    checkOutAt: z.string().optional(),
    status: attendanceStatusSchema.optional(),
    notes: z.string().optional()
  }),
  attachmentsMetadata: z.array(z.record(z.unknown())).default([])
});

export const reviewCorrectionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().min(4)
});

export const attendanceFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  employeeId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
  status: attendanceStatusSchema.optional(),
  isManual: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export const attendanceRuleSchema = z.object({
  lateThresholdMinutes: z.number().int().nonnegative().optional(),
  halfDayThresholdMinutes: z.number().int().nonnegative().optional(),
  minimumWorkDurationMinutes: z.number().int().nonnegative().optional(),
  maximumWorkDurationMinutes: z.number().int().nonnegative().optional(),
  gracePeriodMinutes: z.number().int().nonnegative().optional(),
  overtimeThresholdMinutes: z.number().int().nonnegative().optional(),
  allowSelfCheckIn: z.boolean().optional(),
  requireGeofence: z.boolean().optional(),
  requireFaceVerification: z.boolean().optional()
});

export type CheckInDto = z.infer<typeof checkInSchema>;
export type CheckOutDto = z.infer<typeof checkOutSchema>;
export type ManualAttendanceDto = z.infer<typeof manualAttendanceSchema>;
export type UpdateAttendanceDto = z.infer<typeof updateAttendanceSchema>;
export type CreateCorrectionDto = z.infer<typeof createCorrectionSchema>;
export type ReviewCorrectionDto = z.infer<typeof reviewCorrectionSchema>;
export type AttendanceFilterDto = z.infer<typeof attendanceFilterSchema>;
export type AttendanceRuleDto = z.infer<typeof attendanceRuleSchema>;
