import { z } from "zod";

export const CreateBiometricDeviceSchema = z.object({
  deviceName: z.string().min(2).max(100),
  deviceType: z.string().default("BIOMETRIC_TERMINAL"),
  vendor: z.enum(["ESSL", "ZKTECO", "MATRIX", "SUPREMA", "GENERIC_REST"]).default("ESSL"),
  serialNumber: z.string().min(2).max(100),
  siteLocationId: z.string().uuid().optional(),
  ipAddress: z.string().ip().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  syncMode: z.enum(["PUSH", "PULL", "REALTIME"]).default("PUSH"),
  metadata: z.record(z.unknown()).default({})
});

export const UpdateBiometricDeviceSchema = CreateBiometricDeviceSchema.partial().extend({
  status: z.enum(["ONLINE", "OFFLINE", "ERROR", "MAINTENANCE"]).optional()
});

export const SyncBiometricPunchSchema = z.object({
  deviceId: z.string().uuid(),
  biometricUserId: z.string().min(1),
  employeeId: z.string().uuid().optional(),
  punchTime: z.string().datetime().optional(),
  punchType: z.enum(["CHECK_IN", "CHECK_OUT", "BREAK_IN", "BREAK_OUT"]).default("CHECK_IN"),
  verificationMode: z.enum(["FINGERPRINT", "FACE", "CARD", "PIN"]).default("FINGERPRINT"),
  rawPayload: z.record(z.unknown()).default({})
});

export const CreateShiftSwapRequestSchema = z.object({
  targetEmployeeId: z.string().uuid(),
  sourceShiftId: z.string().uuid(),
  targetShiftId: z.string().uuid(),
  swapDate: z.string().datetime(),
  reason: z.string().min(3).max(500)
});

export const ReviewShiftSwapSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional()
});

export const CreateOvertimeRequestSchema = z.object({
  attendanceId: z.string().uuid().optional(),
  overtimeDate: z.string().datetime(),
  overtimeType: z.enum(["DAILY_OT", "WEEKLY_OFF_OT", "HOLIDAY_OT", "NIGHT_SHIFT_OT"]).default("DAILY_OT"),
  requestedMinutes: z.number().int().min(15).max(720),
  hourlyRate: z.number().min(0).default(0),
  reason: z.string().min(3).max(500)
});

export const ReviewOvertimeRequestSchema = z.object({
  action: z.enum(["MANAGER_APPROVE", "HR_APPROVE", "REJECT"]),
  approvedMinutes: z.number().int().min(0).max(720).optional(),
  rejectionReason: z.string().optional()
});

export const CreateAttendanceAnomalySchema = z.object({
  employeeId: z.string().uuid(),
  attendanceId: z.string().uuid().optional(),
  anomalyDate: z.string().datetime(),
  anomalyType: z.enum([
    "MISSING_PUNCH",
    "DOUBLE_PUNCH",
    "EXCESSIVE_LATE",
    "EARLY_EXIT",
    "GEOFENCE_BREACH",
    "SPOOF_ATTEMPT",
    "UNUSUAL_HOURS"
  ]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  explanation: z.string().min(3).max(500),
  recommendedAction: z.string().optional()
});

export const ResolveAttendanceAnomalySchema = z.object({
  resolutionNotes: z.string().min(3).max(500)
});

export const CreateContractorAttendanceSchema = z.object({
  vendorName: z.string().min(2).max(100),
  contractorName: z.string().min(2).max(100),
  contractorCode: z.string().min(2).max(50),
  siteLocationId: z.string().uuid().optional(),
  gatePassId: z.string().uuid().optional(),
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  totalHours: z.number().min(0).default(0),
  hourlyRate: z.number().min(0).default(0),
  totalCost: z.number().min(0).default(0),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY"]).default("PRESENT")
});

export const CreateWorkforceScheduleSchema = z.object({
  scheduleName: z.string().min(2).max(150),
  departmentId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetHeadcount: z.number().int().min(1),
  scheduledHeadcount: z.number().int().min(0).default(0),
  scheduleData: z.record(z.unknown()).default({})
});

export const GeoFencePunchValidationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).default(10),
  isMockLocation: z.boolean().default(false),
  siteLocationId: z.string().uuid()
});

export const FaceAttendanceVerificationSchema = z.object({
  employeeId: z.string().uuid(),
  capturedEmbedding: z.array(z.number()),
  blinkDetected: z.boolean().default(true),
  motionVerified: z.boolean().default(true),
  antiSpoofScore: z.number().min(0).max(1).default(0.95)
});
