import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";

export interface AuditInput {
  tenantId: string;
  actorUserId?: string;
  actorMembershipId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditInput) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        actorMembershipId: input.actorMembershipId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        before: input.before,
        after: input.after,
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      }
    });
  }

  async listForTenant(tenantId: string, take = 100) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take
    });
  }
}

