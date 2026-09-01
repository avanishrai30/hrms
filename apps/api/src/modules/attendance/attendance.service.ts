import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  AttendanceEventType,
  AttendanceStatus,
  CorrectionStatus,
  FaceVerificationStatus,
  LivenessVerificationStatus,
  LocationVerificationStatus,
  type Prisma
} from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { FaceService } from "../face/face.service.js";
import { LocationsService } from "../locations/locations.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  AttendanceRulesEngine,
  DEFAULT_ATTENDANCE_RULES,
  type RuleConfig,
  type ShiftDefinition
} from "./attendance-rules.engine.js";
import type {
  AttendanceFilterDto,
  AttendanceRuleDto,
  CheckInDto,
  CheckOutDto,
  CreateCorrectionDto,
  ManualAttendanceDto,
  ReviewCorrectionDto,
  UpdateAttendanceDto
} from "./attendance.schemas.js";

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly locationsService: LocationsService,
    private readonly faceService: FaceService
  ) {}

  /**
   * Helper to normalize a date to midnight UTC for daily grouping.
   */
  private getStartOfDay(date: Date = new Date()): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  }

  /**
   * Self Check-In
   */
  async checkIn(
    tenantId: string,
    employeeId: string,
    input: CheckInDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    await this.assertEmployee(tenantId, employeeId);
    const now = new Date();
    const today = this.getStartOfDay(now);

    const existing = await this.prisma.attendance.findUnique({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } }
    });

    if (existing && existing.checkInAt) {
      throw new BadRequestException("Employee has already checked in today.");
    }

    // PART E.5 — ATTENDANCE CONFLICT VALIDATION: Prevent Check-in on Approved Leave Days
    const approvedLeave = await this.prisma.leaveRequest.findFirst({
      where: {
        tenantId,
        employeeId,
        status: "APPROVED",
        startDate: { lte: today },
        endDate: { gte: today }
      },
      include: { leaveType: true }
    });

    if (approvedLeave && !approvedLeave.isHalfDay) {
      await this.prisma.attendanceException.create({
        data: {
          tenantId,
          employeeId,
          date: today,
          exceptionType: "APPROVED_LEAVE_CHECKIN_CONFLICT",
          severity: "HIGH",
          details: {
            reason: `Employee attempted check-in during approved ${approvedLeave.leaveType.name}.`,
            leaveRequestId: approvedLeave.id
          }
        }
      });
      throw new BadRequestException(
        `Attendance check-in blocked: You have an approved full-day leave (${approvedLeave.leaveType.name}) for today. Please cancel your leave request if you wish to check in.`
      );
    }

    const rules = await this.getRulesConfig(tenantId);
    if (!rules.allowSelfCheckIn && !actorUserId) {
      throw new BadRequestException("Self check-in is disabled by tenant policy.");
    }

    // Location & GPS Geofence Verification
    let locationId: string | undefined = undefined;
    let distanceMeters: number | undefined = undefined;
    let accuracyMeters: number | undefined = undefined;
    let locationVerificationStatus: LocationVerificationStatus | undefined = undefined;
    let locationVerificationReason: string | undefined = undefined;

    if (input.latitude !== undefined && input.longitude !== undefined) {
      const accuracy = input.accuracy ?? 0;
      const verification = await this.locationsService.verifyGps(
        tenantId,
        employeeId,
        {
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy
        },
        actorUserId
      );

      if (!verification.verified) {
        if (input.overrideReason) {
          locationVerificationStatus = LocationVerificationStatus.MANUAL_OVERRIDE;
          locationVerificationReason = `Manual override: ${input.overrideReason} (Original issue: ${verification.reason})`;
          locationId = verification.matchedLocationId ?? undefined;
        } else if (rules.requireGeofence) {
          await this.prisma.attendanceException.create({
            data: {
              tenantId,
              employeeId,
              date: today,
              exceptionType: "LOCATION_GEOFENCE_FAILED",
              severity: "HIGH",
              details: { reason: verification.reason, latitude: input.latitude, longitude: input.longitude, accuracy }
            }
          });
          throw new BadRequestException(`Geofence verification failed: ${verification.reason}`);
        } else {
          locationVerificationStatus = verification.status;
          locationVerificationReason = verification.reason;
          locationId = verification.matchedLocationId ?? undefined;
          distanceMeters = verification.distanceMeters ?? undefined;
          accuracyMeters = accuracy;
        }
      } else {
        locationId = verification.matchedLocationId ?? undefined;
        distanceMeters = verification.distanceMeters ?? undefined;
        accuracyMeters = accuracy;
        locationVerificationStatus = LocationVerificationStatus.VERIFIED;
        locationVerificationReason = verification.reason;
      }
    } else if (rules.requireGeofence) {
      if (input.overrideReason) {
        locationVerificationStatus = LocationVerificationStatus.MANUAL_OVERRIDE;
        locationVerificationReason = `Manual override without GPS: ${input.overrideReason}`;
      } else {
        throw new BadRequestException("GPS coordinates are required for attendance check-in by tenant policy.");
      }
    }

    // Biometric Face & Liveness Verification
    let faceVerificationStatus: FaceVerificationStatus | undefined = undefined;
    let livenessVerificationStatus: LivenessVerificationStatus | undefined = undefined;
    let biometricTrustScore: number | undefined = undefined;
    let biometricVerificationReason: string | undefined = undefined;

    if (input.faceImageBase64) {
      const faceResult = await this.faceService.verifyFace(
        tenantId,
        employeeId,
        { imageBase64: input.faceImageBase64 },
        actorUserId
      );

      if (!faceResult.matched) {
        if (input.overrideReason) {
          faceVerificationStatus = FaceVerificationStatus.BYPASSED;
          livenessVerificationStatus = LivenessVerificationStatus.PASSED;
          biometricTrustScore = faceResult.confidenceScore;
          biometricVerificationReason = `Manual override: ${input.overrideReason} (Face score: ${faceResult.confidenceScore})`;
        } else if (rules.requireFaceVerification) {
          await this.prisma.attendanceException.create({
            data: {
              tenantId,
              employeeId,
              date: today,
              exceptionType: "FACE_BIOMETRIC_FAILED",
              severity: "HIGH",
              details: { reason: faceResult.reason, status: faceResult.status, confidenceScore: faceResult.confidenceScore }
            }
          });
          throw new BadRequestException(`Face verification failed: ${faceResult.reason}`);
        } else {
          faceVerificationStatus = faceResult.status;
          livenessVerificationStatus = faceResult.livenessScore >= 0.7 ? LivenessVerificationStatus.PASSED : LivenessVerificationStatus.FAILED;
          biometricTrustScore = faceResult.confidenceScore;
          biometricVerificationReason = faceResult.reason;
        }
      } else {
        faceVerificationStatus = FaceVerificationStatus.MATCHED;
        livenessVerificationStatus = LivenessVerificationStatus.PASSED;
        biometricTrustScore = faceResult.confidenceScore;
        biometricVerificationReason = faceResult.reason;
      }
    } else if (rules.requireFaceVerification) {
      if (input.overrideReason) {
        faceVerificationStatus = FaceVerificationStatus.BYPASSED;
        biometricVerificationReason = `Manual override without face capture: ${input.overrideReason}`;
      } else {
        throw new BadRequestException("Face biometric verification is required for attendance check-in by tenant policy.");
      }
    }

    const shift = await this.resolveShiftForEmployee(tenantId, employeeId, today);
    let lateMinutes = 0;
    if (shift) {
      const { expectedStart } = AttendanceRulesEngine.getShiftBoundaries(today, shift);
      lateMinutes = AttendanceRulesEngine.calculateLateMinutes(now, expectedStart, rules.gracePeriodMinutes);
    }

    const status = lateMinutes >= rules.lateThresholdMinutes ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    const attendance = await this.prisma.$transaction(async (tx) => {
      const record = await tx.attendance.upsert({
        where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
        create: {
          tenantId,
          employeeId,
          shiftId: shift?.id,
          date: today,
          status,
          checkInAt: now,
          lateMinutes,
          locationId,
          distanceMeters,
          accuracyMeters,
          locationVerificationStatus,
          locationVerificationReason,
          faceVerificationStatus,
          livenessVerificationStatus,
          biometricTrustScore,
          biometricVerificationReason,
          notes: input.notes,
          metadata: (input.deviceMetadata ?? {}) as Prisma.InputJsonValue
        },
        update: {
          shiftId: shift?.id,
          status,
          checkInAt: now,
          lateMinutes,
          locationId,
          distanceMeters,
          accuracyMeters,
          locationVerificationStatus,
          locationVerificationReason,
          faceVerificationStatus,
          livenessVerificationStatus,
          biometricTrustScore,
          biometricVerificationReason,
          notes: input.notes ?? undefined,
          metadata: (input.deviceMetadata ?? {}) as Prisma.InputJsonValue
        }
      });

      await tx.attendanceEvent.create({
        data: {
          tenantId,
          attendanceId: record.id,
          employeeId,
          eventType: AttendanceEventType.CHECK_IN,
          timestamp: now,
          actorUserId,
          actorMembershipId,
          source: input.source,
          metadata: { lateMinutes, shiftId: shift?.id }
        }
      });

      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "attendance.check_in",
          entityType: "attendance",
          entityId: record.id,
          message: lateMinutes > 0 ? `Checked in (${lateMinutes}m late)` : "Checked in on time",
          metadata: { checkInAt: now.toISOString(), status, lateMinutes }
        }
      });

      if (lateMinutes >= rules.lateThresholdMinutes) {
        await tx.attendanceException.create({
          data: {
            tenantId,
            employeeId,
            attendanceId: record.id,
            date: today,
            exceptionType: "LATE_ARRIVAL",
            severity: lateMinutes > 60 ? "HIGH" : "MEDIUM",
            details: { lateMinutes, expectedStart: shift ? AttendanceRulesEngine.getShiftBoundaries(today, shift).expectedStart : undefined }
          }
        });
      }

      return record;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "attendance.check_in",
      resourceType: "attendance",
      resourceId: attendance.id,
      after: this.auditJson(attendance)
    });

    return attendance;
  }

  /**
   * Self Check-Out
   */
  async checkOut(
    tenantId: string,
    employeeId: string,
    input: CheckOutDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    await this.assertEmployee(tenantId, employeeId);
    const now = new Date();
    const today = this.getStartOfDay(now);

    const existing = await this.prisma.attendance.findUnique({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } }
    });

    if (!existing || !existing.checkInAt) {
      throw new BadRequestException("No check-in record found for today.");
    }

    if (existing.checkOutAt) {
      throw new BadRequestException("Employee has already checked out today.");
    }

    const rules = await this.getRulesConfig(tenantId);
    const shift = existing.shiftId
      ? await this.prisma.shift.findUnique({ where: { id: existing.shiftId } })
      : await this.resolveShiftForEmployee(tenantId, employeeId, today);

    const workedMinutes = AttendanceRulesEngine.calculateWorkedMinutes(existing.checkInAt, now);
    let earlyDepartureMinutes = 0;
    if (shift) {
      const { expectedEnd } = AttendanceRulesEngine.getShiftBoundaries(today, shift);
      earlyDepartureMinutes = AttendanceRulesEngine.calculateEarlyDepartureMinutes(now, expectedEnd);
    }

    const overtimeMinutes = AttendanceRulesEngine.calculateOvertimeMinutes(workedMinutes, rules.overtimeThresholdMinutes);
    const status = AttendanceRulesEngine.evaluateStatus({
      checkInAt: existing.checkInAt,
      checkOutAt: now,
      lateMinutes: existing.lateMinutes,
      workedMinutes,
      rules,
      isManual: existing.isManual
    });

    const attendance = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.attendance.update({
        where: { id: existing.id },
        data: {
          checkOutAt: now,
          workedMinutes,
          earlyDepartureMinutes,
          overtimeMinutes,
          status,
          notes: input.notes ? (existing.notes ? `${existing.notes} | ${input.notes}` : input.notes) : existing.notes
        }
      });

      await tx.attendanceEvent.create({
        data: {
          tenantId,
          attendanceId: updated.id,
          employeeId,
          eventType: AttendanceEventType.CHECK_OUT,
          timestamp: now,
          actorUserId,
          actorMembershipId,
          source: input.source,
          metadata: { workedMinutes, earlyDepartureMinutes, overtimeMinutes }
        }
      });

      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "attendance.check_out",
          entityType: "attendance",
          entityId: updated.id,
          message: `Checked out (${Math.floor(workedMinutes / 60)}h ${workedMinutes % 60}m worked)`,
          metadata: { checkOutAt: now.toISOString(), workedMinutes, overtimeMinutes, status }
        }
      });

      if (earlyDepartureMinutes >= 15) {
        await tx.attendanceException.create({
          data: {
            tenantId,
            employeeId,
            attendanceId: updated.id,
            date: today,
            exceptionType: "EARLY_DEPARTURE",
            severity: earlyDepartureMinutes > 60 ? "HIGH" : "MEDIUM",
            details: { earlyDepartureMinutes }
          }
        });
      }

      return updated;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "attendance.check_out",
      resourceType: "attendance",
      resourceId: attendance.id,
      before: this.auditJson(existing),
      after: this.auditJson(attendance)
    });

    return attendance;
  }

  /**
   * Manual Attendance creation by HR / Admin
   */
  async recordManualAttendance(
    tenantId: string,
    input: ManualAttendanceDto,
    actorUserId: string,
    actorMembershipId: string
  ) {
    await this.assertEmployee(tenantId, input.employeeId);
    const date = this.getStartOfDay(input.date);
    const rules = await this.getRulesConfig(tenantId);
    const shift = input.shiftId
      ? await this.prisma.shift.findFirst({ where: { id: input.shiftId, tenantId } })
      : await this.resolveShiftForEmployee(tenantId, input.employeeId, date);

    let workedMinutes = 0;
    let lateMinutes = 0;
    let earlyDepartureMinutes = 0;
    let overtimeMinutes = 0;

    if (input.checkInAt && input.checkOutAt) {
      workedMinutes = AttendanceRulesEngine.calculateWorkedMinutes(input.checkInAt, input.checkOutAt);
      overtimeMinutes = AttendanceRulesEngine.calculateOvertimeMinutes(workedMinutes, rules.overtimeThresholdMinutes);
    }
    if (input.checkInAt && shift) {
      const { expectedStart } = AttendanceRulesEngine.getShiftBoundaries(date, shift);
      lateMinutes = AttendanceRulesEngine.calculateLateMinutes(input.checkInAt, expectedStart, rules.gracePeriodMinutes);
    }
    if (input.checkOutAt && shift) {
      const { expectedEnd } = AttendanceRulesEngine.getShiftBoundaries(date, shift);
      earlyDepartureMinutes = AttendanceRulesEngine.calculateEarlyDepartureMinutes(input.checkOutAt, expectedEnd);
    }

    const before = await this.prisma.attendance.findUnique({
      where: { tenantId_employeeId_date: { tenantId, employeeId: input.employeeId, date } }
    });

    const attendance = await this.prisma.$transaction(async (tx) => {
      const record = await tx.attendance.upsert({
        where: { tenantId_employeeId_date: { tenantId, employeeId: input.employeeId, date } },
        create: {
          tenantId,
          employeeId: input.employeeId,
          shiftId: shift?.id,
          date,
          status: input.status,
          checkInAt: input.checkInAt,
          checkOutAt: input.checkOutAt,
          workedMinutes,
          lateMinutes,
          earlyDepartureMinutes,
          overtimeMinutes,
          notes: input.notes,
          isManual: true,
          metadata: { reason: input.reason, recordedBy: actorUserId }
        },
        update: {
          shiftId: shift?.id,
          status: input.status,
          checkInAt: input.checkInAt,
          checkOutAt: input.checkOutAt,
          workedMinutes,
          lateMinutes,
          earlyDepartureMinutes,
          overtimeMinutes,
          notes: input.notes,
          isManual: true,
          metadata: { reason: input.reason, recordedBy: actorUserId }
        }
      });

      await tx.attendanceEvent.create({
        data: {
          tenantId,
          attendanceId: record.id,
          employeeId: input.employeeId,
          eventType: AttendanceEventType.MANUAL_ADJUSTMENT,
          timestamp: new Date(),
          actorUserId,
          actorMembershipId,
          source: "MANUAL",
          metadata: { reason: input.reason, previousStatus: before?.status, newStatus: input.status }
        }
      });

      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId: input.employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "attendance.manual_recorded",
          entityType: "attendance",
          entityId: record.id,
          message: `Manual attendance recorded (${input.status})`,
          metadata: { reason: input.reason, date: date.toISOString(), status: input.status }
        }
      });

      return record;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "attendance.manual",
      resourceType: "attendance",
      resourceId: attendance.id,
      before: before ? this.auditJson(before) : undefined,
      after: this.auditJson(attendance),
      metadata: { reason: input.reason }
    });

    return attendance;
  }

  /**
   * Update / Adjust Attendance record
   */
  async updateAttendance(
    tenantId: string,
    id: string,
    input: UpdateAttendanceDto,
    actorUserId: string,
    actorMembershipId: string
  ) {
    const before = await this.prisma.attendance.findFirst({ where: { id, tenantId } });
    if (!before) {
      throw new NotFoundException("Attendance record was not found.");
    }

    const rules = await this.getRulesConfig(tenantId);
    const checkInAt = input.checkInAt !== undefined ? input.checkInAt : before.checkInAt;
    const checkOutAt = input.checkOutAt !== undefined ? input.checkOutAt : before.checkOutAt;
    const shiftId = input.shiftId !== undefined ? input.shiftId : before.shiftId;

    let workedMinutes = before.workedMinutes;
    let overtimeMinutes = before.overtimeMinutes;
    if (checkInAt && checkOutAt) {
      workedMinutes = AttendanceRulesEngine.calculateWorkedMinutes(checkInAt, checkOutAt);
      overtimeMinutes = AttendanceRulesEngine.calculateOvertimeMinutes(workedMinutes, rules.overtimeThresholdMinutes);
    }

    const attendance = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.attendance.update({
        where: { id },
        data: {
          status: input.status ?? before.status,
          shiftId,
          checkInAt,
          checkOutAt,
          workedMinutes,
          overtimeMinutes,
          notes: input.notes ?? before.notes,
          isManual: true
        }
      });

      await tx.attendanceEvent.create({
        data: {
          tenantId,
          attendanceId: updated.id,
          employeeId: updated.employeeId,
          eventType: AttendanceEventType.STATUS_CHANGE,
          timestamp: new Date(),
          actorUserId,
          actorMembershipId,
          source: "MANUAL",
          metadata: { reason: input.reason, previousStatus: before.status, newStatus: updated.status }
        }
      });

      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId: updated.employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "attendance.adjusted",
          entityType: "attendance",
          entityId: updated.id,
          message: `Attendance adjusted: ${input.reason}`,
          metadata: { reason: input.reason, status: updated.status }
        }
      });

      return updated;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "attendance.updated",
      resourceType: "attendance",
      resourceId: attendance.id,
      before: this.auditJson(before),
      after: this.auditJson(attendance),
      metadata: { reason: input.reason }
    });

    return attendance;
  }

  /**
   * Get Today's attendance state for employee
   */
  async getTodayAttendance(tenantId: string, employeeId: string) {
    await this.assertEmployee(tenantId, employeeId);
    const today = this.getStartOfDay();
    const record = await this.prisma.attendance.findUnique({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
      include: { shift: true }
    });

    const shift = await this.resolveShiftForEmployee(tenantId, employeeId, today);
    const rules = await this.getRulesConfig(tenantId);

    const canCheckIn = !record || !record.checkInAt;
    const canCheckOut = record && record.checkInAt && !record.checkOutAt;

    return {
      date: today.toISOString(),
      record,
      shift,
      canCheckIn: Boolean(canCheckIn),
      canCheckOut: Boolean(canCheckOut),
      rules
    };
  }

  /**
   * Get employee attendance history
   */
  async getEmployeeHistory(tenantId: string, employeeId: string, filters: AttendanceFilterDto) {
    await this.assertEmployee(tenantId, employeeId);
    const where: Prisma.AttendanceWhereInput = {
      tenantId,
      employeeId,
      ...(filters.startDate && filters.endDate ? { date: { gte: filters.startDate, lte: filters.endDate } } : {}),
      ...(filters.status ? { status: filters.status } : {})
    };

    const [records, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: { shift: true },
        orderBy: { date: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.attendance.count({ where })
    ]);

    return { records, total, page: filters.page, limit: filters.limit };
  }

  /**
   * Get attendance events timeline
   */
  async getAttendanceTimeline(tenantId: string, employeeId: string) {
    await this.assertEmployee(tenantId, employeeId);
    return this.prisma.attendanceEvent.findMany({
      where: { tenantId, employeeId },
      include: { actor: { select: { id: true, email: true } } },
      orderBy: { timestamp: "desc" },
      take: 50
    });
  }

  /**
   * Search / List Attendance across tenant
   */
  async listAttendance(tenantId: string, filters: AttendanceFilterDto) {
    const where: Prisma.AttendanceWhereInput = {
      tenantId,
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.shiftId ? { shiftId: filters.shiftId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.isManual !== undefined ? { isManual: filters.isManual } : {}),
      ...(filters.startDate && filters.endDate ? { date: { gte: filters.startDate, lte: filters.endDate } } : {}),
      ...(filters.departmentId ? { employee: { departmentId: filters.departmentId } } : {})
    };

    const [records, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              department: { select: { name: true } },
              designation: { select: { name: true } }
            }
          },
          shift: true
        },
        orderBy: { date: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.attendance.count({ where })
    ]);

    return { records, total, page: filters.page, limit: filters.limit };
  }

  /**
   * Request Attendance Correction
   */
  async requestCorrection(
    tenantId: string,
    employeeId: string,
    input: CreateCorrectionDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    await this.assertEmployee(tenantId, employeeId);

    const correction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.attendanceCorrection.create({
        data: {
          tenantId,
          employeeId,
          attendanceId: input.attendanceId,
          reason: input.reason,
          requestedChange: input.requestedChange as Prisma.InputJsonValue,
          attachmentsMetadata: input.attachmentsMetadata as Prisma.InputJsonValue,
          status: CorrectionStatus.PENDING,
          requestedByUserId: actorUserId
        }
      });

      await tx.attendanceEvent.create({
        data: {
          tenantId,
          attendanceId: input.attendanceId,
          employeeId,
          eventType: AttendanceEventType.CORRECTION_REQUEST,
          timestamp: new Date(),
          actorUserId,
          actorMembershipId,
          source: "WEB",
          metadata: { correctionId: created.id, reason: input.reason }
        }
      });

      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "attendance.correction_requested",
          entityType: "attendance_correction",
          entityId: created.id,
          message: `Attendance correction requested: ${input.reason}`,
          metadata: { correctionId: created.id }
        }
      });

      return created;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "attendance.correction.requested",
      resourceType: "attendance_correction",
      resourceId: correction.id,
      after: this.auditJson(correction)
    });

    return correction;
  }

  /**
   * Review Attendance Correction (Approve or Reject)
   */
  async reviewCorrection(
    tenantId: string,
    correctionId: string,
    input: ReviewCorrectionDto,
    actorUserId: string,
    actorMembershipId: string
  ) {
    const correction = await this.prisma.attendanceCorrection.findFirst({
      where: { id: correctionId, tenantId },
      include: { employee: true }
    });

    if (!correction) {
      throw new NotFoundException("Correction request was not found.");
    }

    if (correction.status !== CorrectionStatus.PENDING) {
      throw new BadRequestException("Correction request is already processed.");
    }

    const reviewed = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.attendanceCorrection.update({
        where: { id: correctionId },
        data: {
          status: input.status as CorrectionStatus,
          reviewNote: input.reviewNote,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });

      // If approved, apply the requested change to Attendance record
      if (input.status === "APPROVED") {
        const change = correction.requestedChange as {
          date?: string;
          checkInAt?: string;
          checkOutAt?: string;
          status?: AttendanceStatus;
          notes?: string;
        };

        const targetDate = change.date ? this.getStartOfDay(new Date(change.date)) : this.getStartOfDay();
        const checkInAt = change.checkInAt ? new Date(change.checkInAt) : undefined;
        const checkOutAt = change.checkOutAt ? new Date(change.checkOutAt) : undefined;

        let workedMinutes = 0;
        if (checkInAt && checkOutAt) {
          workedMinutes = AttendanceRulesEngine.calculateWorkedMinutes(checkInAt, checkOutAt);
        }

        await tx.attendance.upsert({
          where: {
            tenantId_employeeId_date: {
              tenantId,
              employeeId: correction.employeeId,
              date: targetDate
            }
          },
          create: {
            tenantId,
            employeeId: correction.employeeId,
            date: targetDate,
            status: change.status ?? AttendanceStatus.PRESENT,
            checkInAt,
            checkOutAt,
            workedMinutes,
            notes: change.notes ? `Correction applied: ${change.notes}` : "Correction approved",
            isManual: true
          },
          update: {
            status: change.status ?? undefined,
            checkInAt: checkInAt ?? undefined,
            checkOutAt: checkOutAt ?? undefined,
            workedMinutes: workedMinutes || undefined,
            notes: change.notes ? `Correction applied: ${change.notes}` : "Correction approved",
            isManual: true
          }
        });
      }

      await tx.attendanceEvent.create({
        data: {
          tenantId,
          attendanceId: correction.attendanceId,
          employeeId: correction.employeeId,
          eventType: input.status === "APPROVED" ? AttendanceEventType.CORRECTION_APPROVAL : AttendanceEventType.CORRECTION_REJECTION,
          timestamp: new Date(),
          actorUserId,
          actorMembershipId,
          source: "MANUAL",
          metadata: { correctionId: updated.id, status: input.status, reviewNote: input.reviewNote }
        }
      });

      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId: correction.employeeId,
          actorUserId,
          actorMembershipId,
          eventType: input.status === "APPROVED" ? "attendance.correction_approved" : "attendance.correction_rejected",
          entityType: "attendance_correction",
          entityId: updated.id,
          message: `Correction request ${input.status.toLowerCase()}: ${input.reviewNote}`,
          metadata: { correctionId: updated.id, status: input.status }
        }
      });

      return updated;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "attendance.correction.reviewed",
      resourceType: "attendance_correction",
      resourceId: reviewed.id,
      before: this.auditJson(correction),
      after: this.auditJson(reviewed),
      metadata: { status: input.status, reviewNote: input.reviewNote }
    });

    return reviewed;
  }

  /**
   * List Corrections
   */
  async listCorrections(tenantId: string, status?: CorrectionStatus, employeeId?: string) {
    return this.prisma.attendanceCorrection.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
        ...(employeeId ? { employeeId } : {})
      },
      include: {
        employee: { select: { id: true, employeeCode: true, fullName: true } },
        requestedBy: { select: { id: true, email: true } },
        reviewedBy: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Employee Attendance Dashboard
   */
  async getEmployeeDashboard(tenantId: string, employeeId: string) {
    await this.assertEmployee(tenantId, employeeId);
    const today = this.getStartOfDay();
    const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 0, 0, 0, 0));

    const [todayRecord, shift, monthRecords, recentEvents] = await Promise.all([
      this.prisma.attendance.findUnique({
        where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
        include: { shift: true }
      }),
      this.resolveShiftForEmployee(tenantId, employeeId, today),
      this.prisma.attendance.findMany({
        where: { tenantId, employeeId, date: { gte: startOfMonth } }
      }),
      this.prisma.attendanceEvent.findMany({
        where: { tenantId, employeeId },
        orderBy: { timestamp: "desc" },
        take: 5
      })
    ]);

    const presentCount = monthRecords.filter((r) => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
    const lateCount = monthRecords.filter((r) => r.status === AttendanceStatus.LATE).length;
    const halfDayCount = monthRecords.filter((r) => r.status === AttendanceStatus.HALF_DAY).length;
    const totalWorkedMinutes = monthRecords.reduce((acc, r) => acc + r.workedMinutes, 0);

    return {
      today: {
        date: today.toISOString(),
        record: todayRecord,
        shift,
        workedHours: todayRecord ? (todayRecord.workedMinutes / 60).toFixed(1) : "0.0",
        status: todayRecord?.status ?? "NOT_MARKED"
      },
      monthSummary: {
        presentCount,
        lateCount,
        halfDayCount,
        totalWorkedHours: (totalWorkedMinutes / 60).toFixed(1)
      },
      recentEvents
    };
  }

  /**
   * HR Attendance Dashboard
   */
  async getHrDashboard(tenantId: string) {
    const today = this.getStartOfDay();

    const [totalEmployees, todayAttendances, pendingCorrections, recentEvents] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.attendance.findMany({
        where: { tenantId, date: today },
        include: { employee: { select: { id: true, fullName: true, department: { select: { name: true } } } } }
      }),
      this.prisma.attendanceCorrection.count({ where: { tenantId, status: CorrectionStatus.PENDING } }),
      this.prisma.attendanceEvent.findMany({
        where: { tenantId },
        include: { employee: { select: { fullName: true } } },
        orderBy: { timestamp: "desc" },
        take: 10
      })
    ]);

    const presentCount = todayAttendances.filter((a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
    const lateCount = todayAttendances.filter((a) => a.status === AttendanceStatus.LATE).length;
    const halfDayCount = todayAttendances.filter((a) => a.status === AttendanceStatus.HALF_DAY).length;
    const absentCount = Math.max(0, totalEmployees - todayAttendances.length);

    return {
      summary: {
        totalEmployees,
        presentCount,
        absentCount,
        lateCount,
        halfDayCount,
        pendingCorrections
      },
      recentEvents
    };
  }

  /**
   * Manager Attendance Dashboard (Team Scope)
   */
  async getManagerDashboard(tenantId: string, managerEmployeeId: string) {
    const today = this.getStartOfDay();
    const teamMembers = await this.prisma.employee.findMany({
      where: { tenantId, managerEmployeeId, status: "ACTIVE" },
      select: { id: true, fullName: true, department: { select: { name: true } } }
    });

    const teamIds = teamMembers.map((m) => m.id);

    const [teamAttendances, pendingCorrections] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { tenantId, employeeId: { in: teamIds }, date: today },
        include: { employee: { select: { id: true, fullName: true } } }
      }),
      this.prisma.attendanceCorrection.findMany({
        where: { tenantId, employeeId: { in: teamIds }, status: CorrectionStatus.PENDING },
        include: { employee: { select: { fullName: true } } }
      })
    ]);

    const presentCount = teamAttendances.filter((a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
    const lateCount = teamAttendances.filter((a) => a.status === AttendanceStatus.LATE).length;
    const absentCount = Math.max(0, teamMembers.length - teamAttendances.length);

    return {
      teamSummary: {
        totalTeam: teamMembers.length,
        presentCount,
        absentCount,
        lateCount,
        pendingCorrections: pendingCorrections.length
      },
      lateMembers: teamAttendances.filter((a) => a.status === AttendanceStatus.LATE),
      pendingCorrections
    };
  }

  /**
   * Get / Update Attendance Rules
   */
  async getRulesConfig(tenantId: string): Promise<RuleConfig & { allowSelfCheckIn: boolean; requireGeofence: boolean; requireFaceVerification: boolean }> {
    const rules = await this.prisma.attendanceRule.findUnique({ where: { tenantId } });
    if (!rules) {
      return {
        ...DEFAULT_ATTENDANCE_RULES,
        allowSelfCheckIn: true,
        requireGeofence: false,
        requireFaceVerification: false
      };
    }
    return {
      lateThresholdMinutes: rules.lateThresholdMinutes,
      halfDayThresholdMinutes: rules.halfDayThresholdMinutes,
      minimumWorkDurationMinutes: rules.minimumWorkDurationMinutes,
      maximumWorkDurationMinutes: rules.maximumWorkDurationMinutes,
      gracePeriodMinutes: rules.gracePeriodMinutes,
      overtimeThresholdMinutes: rules.overtimeThresholdMinutes,
      allowSelfCheckIn: rules.allowSelfCheckIn,
      requireGeofence: rules.requireGeofence,
      requireFaceVerification: rules.requireFaceVerification
    };
  }

  async updateRules(tenantId: string, input: AttendanceRuleDto, actorUserId?: string, actorMembershipId?: string) {
    const before = await this.prisma.attendanceRule.findUnique({ where: { tenantId } });
    const rules = await this.prisma.attendanceRule.upsert({
      where: { tenantId },
      create: { tenantId, ...input },
      update: input
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "attendance.rules.updated",
      resourceType: "attendance_rule",
      resourceId: rules.id,
      before: before ? this.auditJson(before) : undefined,
      after: this.auditJson(rules)
    });

    return rules;
  }

  private async assertEmployee(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      select: { id: true, fullName: true, status: true }
    });
    if (!employee) {
      throw new NotFoundException("Employee was not found.");
    }
    return employee;
  }

  private async resolveShiftForEmployee(tenantId: string, employeeId: string, date: Date): Promise<ShiftDefinition | null> {
    const assignment = await this.prisma.shiftAssignment.findFirst({
      where: {
        tenantId,
        employeeId,
        startsOn: { lte: date },
        OR: [{ endsOn: null }, { endsOn: { gte: date } }]
      },
      include: { shift: true },
      orderBy: { startsOn: "desc" }
    });

    if (assignment?.shift) {
      return assignment.shift;
    }

    // Fallback: first active shift in tenant or null
    return this.prisma.shift.findFirst({ where: { tenantId } });
  }

  private auditJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
