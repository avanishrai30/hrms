import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { AuditService } from "../../audit/audit.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type {
  CreateEmployeeRequestDto,
  RequestFilterDto,
  ResolveEmployeeRequestDto
} from "../ess.schemas.js";

@Injectable()
export class EmployeeRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async listRequests(tenantId: string, employeeId?: string, filter?: RequestFilterDto) {
    const where: Prisma.EmployeeRequestWhereInput = {
      tenantId,
      ...(employeeId ? { employeeId } : {})
    };

    if (filter?.requestType) {
      where.requestType = filter.requestType;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    const requests = await this.prisma.employeeRequest.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        resolvedBy: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: filter?.limit ?? 50,
      skip: filter?.offset ?? 0
    });

    return requests.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      employeeId: r.employeeId,
      employeeName: r.employee.fullName,
      employeeCode: r.employee.employeeCode,
      requestType: r.requestType,
      status: r.status,
      payload: (r.payloadJson as Record<string, unknown>) ?? {},
      reason: r.reason,
      comments: r.comments,
      workflowInstanceId: r.workflowInstanceId,
      submittedAt: r.submittedAt.toISOString(),
      resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
      resolvedById: r.resolvedById,
      resolvedByName: r.resolvedBy?.email ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    }));
  }

  async submitRequest(
    tenantId: string,
    targetEmployeeId: string,
    dto: CreateEmployeeRequestDto,
    actorUserId?: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: targetEmployeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException("Employee record not found.");
    }

    const request = await this.prisma.employeeRequest.create({
      data: {
        tenantId,
        employeeId: targetEmployeeId,
        requestType: dto.requestType,
        status: "PENDING",
        payloadJson: (dto.payload ?? {}) as Prisma.InputJsonValue,
        reason: dto.reason,
        comments: dto.comments,
        submittedAt: new Date()
      },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } }
      }
    });

    if (actorUserId) {
      await this.auditService.record({
        tenantId,
        actorUserId,
        action: "requests.created",
        resourceType: "employee_request",
        resourceId: request.id,
        after: {
          employeeId: targetEmployeeId,
          requestType: dto.requestType,
          reason: dto.reason
        }
      });
    }

    return {
      id: request.id,
      tenantId: request.tenantId,
      employeeId: request.employeeId,
      employeeName: request.employee.fullName,
      employeeCode: request.employee.employeeCode,
      requestType: request.requestType,
      status: request.status,
      payload: (request.payloadJson as Record<string, unknown>) ?? {},
      reason: request.reason,
      comments: request.comments,
      workflowInstanceId: request.workflowInstanceId,
      submittedAt: request.submittedAt.toISOString(),
      resolvedAt: null,
      resolvedById: null,
      resolvedByName: null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString()
    };
  }

  async getRequest(tenantId: string, requestId: string) {
    const r = await this.prisma.employeeRequest.findFirst({
      where: { id: requestId, tenantId },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        resolvedBy: { select: { id: true, email: true } }
      }
    });
    if (!r) {
      throw new NotFoundException("Employee request not found.");
    }

    return {
      id: r.id,
      tenantId: r.tenantId,
      employeeId: r.employeeId,
      employeeName: r.employee.fullName,
      employeeCode: r.employee.employeeCode,
      requestType: r.requestType,
      status: r.status,
      payload: (r.payloadJson as Record<string, unknown>) ?? {},
      reason: r.reason,
      comments: r.comments,
      workflowInstanceId: r.workflowInstanceId,
      submittedAt: r.submittedAt.toISOString(),
      resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
      resolvedById: r.resolvedById,
      resolvedByName: r.resolvedBy?.email ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    };
  }

  async approveRequest(
    tenantId: string,
    requestId: string,
    approverUserId: string,
    dto: ResolveEmployeeRequestDto
  ) {
    const existing = await this.prisma.employeeRequest.findFirst({
      where: { id: requestId, tenantId },
      include: { employee: true }
    });
    if (!existing) {
      throw new NotFoundException("Employee request not found.");
    }
    if (existing.status !== "PENDING") {
      throw new BadRequestException(`Cannot approve request that is already ${existing.status}.`);
    }

    const payload = (existing.payloadJson as Record<string, unknown>) ?? {};

    // Auto-sync approved changes to Employee / EmployeeProfile
    await this.applyApprovedRequestChanges(tenantId, existing.employeeId, existing.requestType, payload);

    const updated = await this.prisma.employeeRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        resolvedAt: new Date(),
        resolvedById: approverUserId,
        comments: dto.comments ?? existing.comments
      },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        resolvedBy: { select: { id: true, email: true } }
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: approverUserId,
      action: "requests.approved",
      resourceType: "employee_request",
      resourceId: updated.id,
      before: { status: "PENDING" },
      after: { status: "APPROVED", comments: dto.comments }
    });

    return updated;
  }

  async rejectRequest(
    tenantId: string,
    requestId: string,
    approverUserId: string,
    dto: ResolveEmployeeRequestDto
  ) {
    const existing = await this.prisma.employeeRequest.findFirst({
      where: { id: requestId, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Employee request not found.");
    }
    if (existing.status !== "PENDING") {
      throw new BadRequestException(`Cannot reject request that is already ${existing.status}.`);
    }

    const updated = await this.prisma.employeeRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        resolvedAt: new Date(),
        resolvedById: approverUserId,
        comments: dto.comments ?? existing.comments
      },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        resolvedBy: { select: { id: true, email: true } }
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: approverUserId,
      action: "requests.rejected",
      resourceType: "employee_request",
      resourceId: updated.id,
      before: { status: "PENDING" },
      after: { status: "REJECTED", comments: dto.comments }
    });

    return updated;
  }

  async cancelRequest(tenantId: string, requestId: string, employeeId: string) {
    const existing = await this.prisma.employeeRequest.findFirst({
      where: { id: requestId, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Employee request not found.");
    }
    if (existing.employeeId !== employeeId) {
      throw new BadRequestException("You can only cancel your own pending requests.");
    }
    if (existing.status !== "PENDING") {
      throw new BadRequestException(`Cannot cancel request with status ${existing.status}.`);
    }

    const updated = await this.prisma.employeeRequest.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED",
        resolvedAt: new Date()
      }
    });

    return updated;
  }

  private async applyApprovedRequestChanges(
    tenantId: string,
    employeeId: string,
    requestType: string,
    payload: Record<string, unknown>
  ) {
    if (requestType === "ADDRESS_CHANGE") {
      const currentAddress = payload.currentAddress ?? payload.address;
      const permanentAddress = payload.permanentAddress;

      await this.prisma.employee.update({
        where: { id: employeeId },
        data: {
          ...(currentAddress ? { currentAddress: currentAddress as Prisma.InputJsonValue } : {}),
          ...(permanentAddress ? { permanentAddress: permanentAddress as Prisma.InputJsonValue } : {})
        }
      });

      await this.prisma.employeeProfile.upsert({
        where: { employeeId },
        update: {
          addressJson: (currentAddress ?? permanentAddress) as Prisma.InputJsonValue
        },
        create: {
          tenantId,
          employeeId,
          addressJson: (currentAddress ?? permanentAddress) as Prisma.InputJsonValue
        }
      });
    } else if (requestType === "BANK_CHANGE") {
      const bankDetails = payload.bankDetails ?? payload;
      await this.prisma.employee.update({
        where: { id: employeeId },
        data: {
          bankDetails: bankDetails as Prisma.InputJsonValue
        }
      });
    } else if (requestType === "PERSONAL_INFO_CORRECTION") {
      const phone = payload.phone as string | undefined;
      const personalEmail = payload.personalEmail as string | undefined;
      const preferredName = payload.preferredName as string | undefined;
      const emergencyContact = payload.emergencyContact;

      await this.prisma.employee.update({
        where: { id: employeeId },
        data: {
          ...(phone ? { phone } : {}),
          ...(personalEmail ? { personalEmail } : {}),
          ...(preferredName ? { preferredName } : {}),
          ...(emergencyContact ? { emergencyContact: emergencyContact as Prisma.InputJsonValue } : {})
        }
      });

      await this.prisma.employeeProfile.upsert({
        where: { employeeId },
        update: {
          ...(emergencyContact ? { emergencyContactJson: emergencyContact as Prisma.InputJsonValue } : {}),
          ...(payload.bio ? { bio: String(payload.bio) } : {})
        },
        create: {
          tenantId,
          employeeId,
          ...(emergencyContact ? { emergencyContactJson: emergencyContact as Prisma.InputJsonValue } : {}),
          ...(payload.bio ? { bio: String(payload.bio) } : {})
        }
      });
    } else if (requestType === "SHIFT_CHANGE" && payload.shiftId) {
      await this.prisma.shiftAssignment.create({
        data: {
          tenantId,
          employeeId,
          shiftId: String(payload.shiftId),
          startsOn: payload.effectiveFrom ? new Date(String(payload.effectiveFrom)) : new Date()
        }
      });
    }
  }
}
