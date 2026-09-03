import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LocationVerificationStatus, type Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  LocationTarget,
  LocationVerificationEngine,
  type VerificationResult
} from "./location-verification.engine.js";
import type {
  CreateAssignmentDto,
  CreateLocationDto,
  LocationFilterDto,
  LocationOverrideDto,
  UpdateLocationDto,
  VerifyGpsDto
} from "./locations.schemas.js";

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Create a new location within tenant
   */
  async createLocation(
    tenantId: string,
    input: CreateLocationDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.location.findUnique({
      where: { tenantId_code: { tenantId, code: input.code } }
    });
    if (existing) {
      throw new BadRequestException(`Location with code '${input.code}' already exists.`);
    }

    const location = await this.prisma.location.create({
      data: {
        tenantId,
        name: input.name,
        code: input.code,
        description: input.description,
        type: input.type,
        latitude: input.latitude,
        longitude: input.longitude,
        radiusMeters: input.radiusMeters,
        maxAccuracyMeters: input.maxAccuracyMeters,
        isActive: input.isActive
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "location.created",
      resourceType: "location",
      resourceId: location.id,
      after: this.auditJson(location)
    });

    return location;
  }

  /**
   * List locations in tenant with filtering and assignment counts
   */
  async listLocations(tenantId: string, filters: LocationFilterDto) {
    const where: Prisma.LocationWhereInput = {
      tenantId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { code: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        include: {
          _count: {
            select: { assignments: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.location.count({ where })
    ]);

    return { locations, total, page: filters.page, limit: filters.limit };
  }

  /**
   * Get single location details
   */
  async getLocation(tenantId: string, id: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, tenantId },
      include: {
        assignments: {
          include: {
            employee: { select: { id: true, employeeCode: true, fullName: true } },
            department: { select: { id: true, name: true, code: true } }
          }
        },
        _count: {
          select: { verifications: true, attendances: true }
        }
      }
    });

    if (!location) {
      throw new NotFoundException("Location not found.");
    }

    return location;
  }

  /**
   * Update location parameters
   */
  async updateLocation(
    tenantId: string,
    id: string,
    input: UpdateLocationDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.prisma.location.findFirst({ where: { id, tenantId } });
    if (!before) {
      throw new NotFoundException("Location not found.");
    }

    const updated = await this.prisma.location.update({
      where: { id },
      data: input
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "location.updated",
      resourceType: "location",
      resourceId: updated.id,
      before: this.auditJson(before),
      after: this.auditJson(updated)
    });

    return updated;
  }

  /**
   * Delete / Deactivate location
   */
  async deleteLocation(
    tenantId: string,
    id: string,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.prisma.location.findFirst({ where: { id, tenantId } });
    if (!before) {
      throw new NotFoundException("Location not found.");
    }

    const deleted = await this.prisma.location.update({
      where: { id },
      data: { isActive: false }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "location.deactivated",
      resourceType: "location",
      resourceId: deleted.id,
      before: this.auditJson(before),
      after: this.auditJson(deleted)
    });

    return deleted;
  }

  /**
   * Create location assignment (employee or department level)
   */
  async createAssignment(
    tenantId: string,
    input: CreateAssignmentDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const location = await this.prisma.location.findFirst({ where: { id: input.locationId, tenantId } });
    if (!location) {
      throw new NotFoundException("Location not found.");
    }

    if (input.employeeId) {
      const employee = await this.prisma.employee.findFirst({ where: { id: input.employeeId, tenantId } });
      if (!employee) throw new NotFoundException("Employee not found.");
    }

    if (input.departmentId) {
      const dept = await this.prisma.department.findFirst({ where: { id: input.departmentId, tenantId } });
      if (!dept) throw new NotFoundException("Department not found.");
    }

    const assignment = await this.prisma.locationAssignment.create({
      data: {
        tenantId,
        locationId: input.locationId,
        employeeId: input.employeeId,
        departmentId: input.departmentId,
        startsOn: input.startsOn,
        endsOn: input.endsOn,
        isPriority: input.isPriority
      },
      include: {
        location: true,
        employee: { select: { id: true, employeeCode: true, fullName: true } },
        department: { select: { id: true, name: true, code: true } }
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "location.assigned",
      resourceType: "location_assignment",
      resourceId: assignment.id,
      after: this.auditJson(assignment)
    });

    return assignment;
  }

  /**
   * List assignments for a location
   */
  async listAssignments(tenantId: string, locationId: string) {
    return this.prisma.locationAssignment.findMany({
      where: { tenantId, locationId },
      include: {
        employee: { select: { id: true, employeeCode: true, fullName: true } },
        department: { select: { id: true, name: true, code: true } }
      },
      orderBy: { startsOn: "desc" }
    });
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(
    tenantId: string,
    assignmentId: string,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const assignment = await this.prisma.locationAssignment.findFirst({ where: { id: assignmentId, tenantId } });
    if (!assignment) {
      throw new NotFoundException("Assignment not found.");
    }

    await this.prisma.locationAssignment.delete({ where: { id: assignmentId } });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "location.assignment.removed",
      resourceType: "location_assignment",
      resourceId: assignmentId,
      before: this.auditJson(assignment)
    });

    return { success: true };
  }

  /**
   * Resolve active target locations for an employee
   */
  async getAssignedLocations(tenantId: string, employeeId: string, now = new Date()): Promise<LocationTarget[]> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      select: { id: true, departmentId: true }
    });

    if (!employee) return [];

    // Query active assignments (employee or department level)
    const assignments = await this.prisma.locationAssignment.findMany({
      where: {
        tenantId,
        startsOn: { lte: now },
        OR: [{ endsOn: null }, { endsOn: { gte: now } }],
        AND: [
          {
            OR: [
              { employeeId: employee.id },
              ...(employee.departmentId ? [{ departmentId: employee.departmentId }] : [])
            ]
          }
        ]
      },
      include: { location: true },
      orderBy: [{ isPriority: "desc" }, { createdAt: "desc" }]
    });

    return assignments.map((a) => ({
      id: a.location.id,
      name: a.location.name,
      code: a.location.code,
      latitude: a.location.latitude,
      longitude: a.location.longitude,
      radiusMeters: a.location.radiusMeters,
      maxAccuracyMeters: a.location.maxAccuracyMeters,
      isActive: a.location.isActive,
      isPriority: a.isPriority
    }));
  }

  /**
   * Verify GPS coordinates for an employee against assigned locations
   */
  async verifyGps(
    tenantId: string,
    employeeId: string,
    input: VerifyGpsDto,
    _actorUserId?: string
  ): Promise<VerificationResult> {
    const targetLocations = await this.getAssignedLocations(tenantId, employeeId);
    const result = LocationVerificationEngine.verify({
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy,
      locations: targetLocations
    });

    // Record verification attempt log
    await this.prisma.locationVerification.create({
      data: {
        tenantId,
        employeeId,
        locationId: result.matchedLocationId,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracyMeters: input.accuracy,
        distanceMeters: result.distanceMeters,
        status: result.status,
        reason: result.reason
      }
    });

    return result;
  }

  /**
   * Manual override of location verification
   */
  async recordManualOverride(
    tenantId: string,
    input: LocationOverrideDto,
    actorUserId: string,
    actorMembershipId: string
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { id: input.employeeId, tenantId } });
    if (!employee) throw new NotFoundException("Employee not found.");

    const location = await this.prisma.location.findFirst({ where: { id: input.locationId, tenantId } });
    if (!location) throw new NotFoundException("Location not found.");

    const verification = await this.prisma.$transaction(async (tx) => {
      const created = await tx.locationVerification.create({
        data: {
          tenantId,
          employeeId: input.employeeId,
          attendanceId: input.attendanceId,
          locationId: input.locationId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyMeters: 0,
          distanceMeters: 0,
          status: LocationVerificationStatus.MANUAL_OVERRIDE,
          reason: `Manual override: ${input.reason}`,
          isManualOverride: true,
          overrideReason: input.reason,
          overrideByUserId: actorUserId
        }
      });

      if (input.attendanceId) {
        await tx.attendance.update({
          where: { id: input.attendanceId },
          data: {
            locationId: location.id,
            locationVerificationStatus: LocationVerificationStatus.MANUAL_OVERRIDE,
            locationVerificationReason: `Manual override: ${input.reason}`
          }
        });
      }

      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId: input.employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "location.manual_override",
          entityType: "location_verification",
          entityId: created.id,
          message: `Location geofence manually overridden: ${input.reason}`,
          metadata: { locationId: location.id, locationName: location.name, reason: input.reason }
        }
      });

      return created;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "location.override",
      resourceType: "location_verification",
      resourceId: verification.id,
      after: this.auditJson(verification),
      metadata: { reason: input.reason }
    });

    return verification;
  }

  /**
   * List location verifications / audit logs
   */
  async listVerifications(
    tenantId: string,
    filters: { status?: LocationVerificationStatus; locationId?: string; employeeId?: string; page?: number; limit?: number }
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;

    const where: Prisma.LocationVerificationWhereInput = {
      tenantId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {})
    };

    const [verifications, total] = await Promise.all([
      this.prisma.locationVerification.findMany({
        where,
        include: {
          employee: { select: { fullName: true, employeeCode: true } },
          location: { select: { name: true, code: true } },
          overrideBy: { select: { email: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.locationVerification.count({ where })
    ]);

    return { verifications, total, page, limit };
  }

  private auditJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
