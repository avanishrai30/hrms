import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { type Prisma, type SeverityLevel, type SuspiciousActivityType } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  RecordSuspiciousActivityDto,
  SecurityAlertQueryDto
} from "./security.schemas.js";

@Injectable()
export class SecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async listAlerts(tenantId: string, query: SecurityAlertQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const isResolvedFilter = query.unresolvedOnly ? false : query.isResolved;
    const where: Prisma.SuspiciousActivityWhereInput = {
      tenantId,
      ...(query.severity ? { severity: query.severity } : {}),
      ...(query.activityType ? { activityType: query.activityType } : {}),
      ...(isResolvedFilter !== undefined ? { isResolved: isResolvedFilter } : {}),
      ...(query.userId ? { userId: query.userId } : {})
    };

    const [items, total] = await Promise.all([
      this.prisma.suspiciousActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      }),
      this.prisma.suspiciousActivity.count({ where })
    ]);

    return {
      items,
      alerts: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async resolveAlert(
    tenantId: string,
    alertId: string,
    resolvedById: string,
    resolutionNote?: string,
    actorMembershipId?: string
  ) {
    const alert = await this.prisma.suspiciousActivity.findFirst({
      where: { id: alertId, tenantId }
    });

    if (!alert) {
      throw new NotFoundException("Security alert not found");
    }

    const currentDetails = (alert.details as Record<string, unknown>) ?? {};
    const updatedDetails = resolutionNote
      ? { ...currentDetails, resolutionNote, resolvedByUserId: resolvedById }
      : currentDetails;

    const updated = await this.prisma.suspiciousActivity.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedById,
        resolvedAt: new Date(),
        details: updatedDetails as Prisma.InputJsonValue
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: resolvedById,
      actorMembershipId,
      action: "security.alert_resolved",
      resourceType: "SuspiciousActivity",
      resourceId: alertId,
      before: { isResolved: alert.isResolved, resolvedById: alert.resolvedById },
      after: { isResolved: updated.isResolved, resolvedById: updated.resolvedById },
      metadata: { resolutionNote }
    });

    return updated;
  }

  async recordSuspiciousActivity(
    tenantId: string,
    input: RecordSuspiciousActivityDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    // Validate user exists in tenant
    const membership = await this.prisma.tenantMembership.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: input.userId
        }
      }
    });

    if (!membership) {
      throw new BadRequestException("User does not belong to this tenant");
    }

    const record = await this.prisma.suspiciousActivity.create({
      data: {
        tenantId,
        userId: input.userId,
        activityType: input.activityType,
        severity: input.severity,
        details: input.details as Prisma.InputJsonValue,
        isResolved: false
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actorUserId ?? input.userId,
      actorMembershipId,
      action: "security.suspicious_activity_recorded",
      resourceType: "SuspiciousActivity",
      resourceId: record.id,
      after: {
        activityType: record.activityType,
        severity: record.severity,
        userId: record.userId
      }
    });

    return record;
  }

  async getSecurityMetrics(tenantId: string) {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalAlerts,
      openAlerts,
      resolvedAlerts,
      last24hAlerts,
      severityGroups,
      typeGroups
    ] = await Promise.all([
      this.prisma.suspiciousActivity.count({ where: { tenantId } }),
      this.prisma.suspiciousActivity.count({ where: { tenantId, isResolved: false } }),
      this.prisma.suspiciousActivity.count({ where: { tenantId, isResolved: true } }),
      this.prisma.suspiciousActivity.count({
        where: { tenantId, createdAt: { gte: last24Hours } }
      }),
      this.prisma.suspiciousActivity.groupBy({
        by: ["severity"],
        where: { tenantId },
        _count: { _all: true }
      }),
      this.prisma.suspiciousActivity.groupBy({
        by: ["activityType"],
        where: { tenantId },
        _count: { _all: true }
      })
    ]);

    const bySeverity: Record<SeverityLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };
    for (const group of severityGroups) {
      bySeverity[group.severity] = group._count._all;
    }

    const byActivityType: Record<SuspiciousActivityType, number> = {
      RAPID_TRAVEL: 0,
      MULTI_DEVICE: 0,
      BRUTE_FORCE: 0,
      LOCATION_SPOOF: 0,
      UNUSUAL_HOURS: 0,
      FAILED_BIOMETRIC: 0
    };
    for (const group of typeGroups) {
      byActivityType[group.activityType] = group._count._all;
    }

    return {
      summary: {
        totalAlerts,
        openAlerts,
        resolvedAlerts,
        last24hAlerts
      },
      bySeverity,
      byActivityType
    };
  }
}
