import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { type ApprovalStatus, Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  ApprovalLevel,
  ApprovalQueryInput,
  CreateApprovalTemplateInput,
  SubmitApprovalRequestInput
} from "./approval.schemas.js";

@Injectable()
export class ApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createTemplate(
    tenantId: string,
    input: CreateApprovalTemplateInput,
    actorId?: string
  ) {
    const existing = await this.prisma.approvalTemplate.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: input.code
        }
      }
    });

    if (existing) {
      throw new BadRequestException(
        `Approval template with code '${input.code}' already exists.`
      );
    }

    const template = await this.prisma.approvalTemplate.create({
      data: {
        tenantId,
        code: input.code,
        name: input.name,
        entityType: input.entityType,
        levels: input.levels as unknown as Prisma.InputJsonValue,
        approverStrategy: input.approverStrategy ?? "SEQUENTIAL",
        isActive: input.isActive ?? true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actorId,
      action: "approval_template.created",
      resourceType: "approval_template",
      resourceId: template.id,
      after: template as unknown as Prisma.InputJsonValue
    });

    return template;
  }

  async listTemplates(tenantId: string, entityType?: string) {
    return this.prisma.approvalTemplate.findMany({
      where: {
        tenantId,
        ...(entityType ? { entityType } : {})
      },
      orderBy: { code: "asc" }
    });
  }

  async getTemplate(tenantId: string, id: string) {
    const template = await this.prisma.approvalTemplate.findFirst({
      where: { tenantId, id }
    });

    if (!template) {
      throw new NotFoundException("Approval template not found.");
    }

    return template;
  }

  async submitRequest(
    tenantId: string,
    input: SubmitApprovalRequestInput,
    requesterId: string
  ) {
    const template = await this.prisma.approvalTemplate.findFirst({
      where: {
        tenantId,
        ...(input.approvalTemplateId ? { id: input.approvalTemplateId } : {}),
        ...(input.templateCode ? { code: input.templateCode } : {}),
        isActive: true
      }
    });

    if (!template) {
      throw new NotFoundException("Approval template not found or inactive.");
    }

    const levels = (template.levels as unknown as ApprovalLevel[]) ?? [];
    const totalLevels = levels.length > 0 ? levels.length : 1;

    const request = await this.prisma.approvalRequest.create({
      data: {
        tenantId,
        approvalTemplateId: template.id,
        entityType: input.entityType,
        entityId: input.entityId,
        requesterId,
        currentLevel: 1,
        totalLevels,
        status: "PENDING",
        data: (input.data ?? {}) as Prisma.InputJsonValue
      },
      include: {
        approvalTemplate: true,
        requester: {
          select: { id: true, email: true }
        },
        actions: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: requesterId,
      action: "approval_request.submitted",
      resourceType: "approval_request",
      resourceId: request.id,
      after: request as unknown as Prisma.InputJsonValue
    });

    return request;
  }

  async approve(
    tenantId: string,
    requestId: string,
    approverUserId: string,
    comment?: string
  ) {
    const request = await this.prisma.approvalRequest.findFirst({
      where: { tenantId, id: requestId },
      include: {
        approvalTemplate: true,
        actions: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!request) {
      throw new NotFoundException("Approval request not found.");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestException(
        `Approval request is already ${request.status.toLowerCase()}.`
      );
    }

    const strategy = request.approvalTemplate.approverStrategy;
    let nextStatus: ApprovalStatus = "PENDING";
    let nextLevel = request.currentLevel;

    if (strategy === "PARALLEL") {
      const priorApprovalsCount = request.actions.filter(
        (a) => a.action === "APPROVED"
      ).length;
      if (priorApprovalsCount + 1 >= request.totalLevels) {
        nextStatus = "APPROVED";
      } else {
        nextStatus = "PENDING";
      }
    } else {
      // SEQUENTIAL or HIERARCHICAL
      if (request.currentLevel >= request.totalLevels) {
        nextStatus = "APPROVED";
      } else {
        nextLevel = request.currentLevel + 1;
        nextStatus = "PENDING";
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.approvalAction.create({
        data: {
          tenantId,
          approvalRequestId: request.id,
          level: request.currentLevel,
          approverUserId,
          action: "APPROVED",
          comment: comment ?? null
        }
      });

      return tx.approvalRequest.update({
        where: { id: request.id },
        data: {
          status: nextStatus,
          currentLevel: nextLevel
        },
        include: {
          approvalTemplate: true,
          requester: {
            select: { id: true, email: true }
          },
          actions: {
            orderBy: { createdAt: "asc" }
          }
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId: approverUserId,
      action: "approval_request.approved",
      resourceType: "approval_request",
      resourceId: request.id,
      after: {
        requestId: request.id,
        level: request.currentLevel,
        status: nextStatus,
        nextLevel
      } as unknown as Prisma.InputJsonValue
    });

    return updated;
  }

  async reject(
    tenantId: string,
    requestId: string,
    approverUserId: string,
    comment?: string
  ) {
    const request = await this.prisma.approvalRequest.findFirst({
      where: { tenantId, id: requestId }
    });

    if (!request) {
      throw new NotFoundException("Approval request not found.");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestException(
        `Approval request is already ${request.status.toLowerCase()}.`
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.approvalAction.create({
        data: {
          tenantId,
          approvalRequestId: request.id,
          level: request.currentLevel,
          approverUserId,
          action: "REJECTED",
          comment: comment ?? null
        }
      });

      return tx.approvalRequest.update({
        where: { id: request.id },
        data: {
          status: "REJECTED"
        },
        include: {
          approvalTemplate: true,
          requester: {
            select: { id: true, email: true }
          },
          actions: {
            orderBy: { createdAt: "asc" }
          }
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId: approverUserId,
      action: "approval_request.rejected",
      resourceType: "approval_request",
      resourceId: request.id,
      after: {
        requestId: request.id,
        level: request.currentLevel,
        status: "REJECTED",
        comment
      } as unknown as Prisma.InputJsonValue
    });

    return updated;
  }

  async delegate(
    tenantId: string,
    requestId: string,
    approverUserId: string,
    delegateToUserId: string,
    comment?: string
  ) {
    const request = await this.prisma.approvalRequest.findFirst({
      where: { tenantId, id: requestId }
    });

    if (!request) {
      throw new NotFoundException("Approval request not found.");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestException(
        `Approval request is already ${request.status.toLowerCase()}.`
      );
    }

    await this.prisma.approvalAction.create({
      data: {
        tenantId,
        approvalRequestId: request.id,
        level: request.currentLevel,
        approverUserId,
        action: "DELEGATED",
        delegatedToUserId: delegateToUserId,
        comment: comment ?? null
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: approverUserId,
      action: "approval_request.delegated",
      resourceType: "approval_request",
      resourceId: request.id,
      after: {
        requestId: request.id,
        level: request.currentLevel,
        delegatedToUserId: delegateToUserId,
        comment
      } as unknown as Prisma.InputJsonValue
    });

    return this.getRequest(tenantId, request.id);
  }

  async listRequests(tenantId: string, query: ApprovalQueryInput) {
    const { entityType, entityId, status, limit, offset } = query;

    return this.prisma.approvalRequest.findMany({
      where: {
        tenantId,
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
        ...(status ? { status } : {})
      },
      include: {
        approvalTemplate: true,
        requester: {
          select: { id: true, email: true }
        },
        actions: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
  }

  async getRequest(tenantId: string, id: string) {
    const request = await this.prisma.approvalRequest.findFirst({
      where: { tenantId, id },
      include: {
        approvalTemplate: true,
        requester: {
          select: { id: true, email: true }
        },
        actions: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!request) {
      throw new NotFoundException("Approval request not found.");
    }

    return request;
  }

  async getMyPendingApprovals(tenantId: string, userId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { tenantId, userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    const userRoles = membership?.roles.map((r) => r.role.code) ?? [];

    const pendingRequests = await this.prisma.approvalRequest.findMany({
      where: {
        tenantId,
        status: "PENDING"
      },
      include: {
        approvalTemplate: true,
        requester: {
          select: { id: true, email: true }
        },
        actions: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return pendingRequests.filter((req) => {
      const levels = (req.approvalTemplate.levels as unknown as ApprovalLevel[]) ?? [];
      const currentLevelConfig = levels.find((l) => l.level === req.currentLevel);

      const isDirectApprover = currentLevelConfig?.approverUserId === userId;
      const isRoleApprover =
        !!currentLevelConfig?.approverRole &&
        userRoles.includes(currentLevelConfig.approverRole);
      const isDelegatedApprover = req.actions.some(
        (a) =>
          a.action === "DELEGATED" &&
          a.level === req.currentLevel &&
          a.delegatedToUserId === userId
      );

      const isAuthorizedApprover =
        isDirectApprover || isRoleApprover || isDelegatedApprover;

      if (!isAuthorizedApprover) {
        return false;
      }

      // Check if this specific user has already approved/rejected at current level
      const alreadyActedAtLevel = req.actions.some(
        (a) =>
          a.approverUserId === userId &&
          a.level === req.currentLevel &&
          (a.action === "APPROVED" || a.action === "REJECTED")
      );

      return !alreadyActedAtLevel;
    });
  }
}
