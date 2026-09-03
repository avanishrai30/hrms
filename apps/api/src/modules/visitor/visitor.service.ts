import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import {
  type ContractorStatus,
  type GatePassStatus,
  type GatePassType,
  type VisitorStatus,
  Prisma
} from "@prisma/client";
import type {
  PreRegisterVisitorDto,
  CheckInVisitorDto,
  CheckOutVisitorDto,
  CreateGatePassDto,
  ApproveGatePassDto,
  CreateContractorDto,
  AddContractorWorkerPassDto
} from "./visitor.schemas.js";

@Injectable()
export class VisitorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private async recordAudit(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    userId?: string,
    membershipId?: string
  ) {
    return this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action,
      resourceType,
      resourceId,
      metadata: (metadata ?? {}) as unknown as Prisma.InputJsonValue
    });
  }

  private async resolveTenantEmployeeId(
    tenantId: string,
    employeeId: string,
    actorContext: { userId?: string; membershipId?: string },
    label = "Employee"
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      select: { id: true }
    });
    if (employee) return employee.id;

    if (actorContext.membershipId && actorContext.userId === employeeId) {
      const membership = await this.prisma.tenantMembership.findFirst({
        where: { id: actorContext.membershipId, tenantId },
        select: { employeeId: true }
      });
      if (membership?.employeeId) return membership.employeeId;
    }

    throw new NotFoundException(`${label} with ID "${employeeId}" not found`);
  }

  // -------------------------------------------------------------
  // 1. VISITOR MANAGEMENT
  // -------------------------------------------------------------

  async listVisitors(tenantId: string, status?: VisitorStatus) {
    return this.prisma.visitorVisit.findMany({
      where: {
        tenantId,
        ...(status && { status })
      },
      include: {
        visitor: true,
        host: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async preRegisterVisitor(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: PreRegisterVisitorDto
  ) {
    const hostId = await this.resolveTenantEmployeeId(tenantId, dto.hostId, actorContext, "Host employee");

    // Upsert visitor
    const visitor = await this.prisma.visitor.upsert({
      where: { tenantId_phone: { tenantId, phone: dto.phone } },
      update: {
        name: dto.name,
        email: dto.email,
        company: dto.company,
        idProofType: dto.idProofType,
        idProofNum: dto.idProofNum
      },
      create: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        company: dto.company,
        idProofType: dto.idProofType,
        idProofNum: dto.idProofNum
      }
    });

    const passCode = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${passCode}`;

    const visit = await this.prisma.visitorVisit.create({
      data: {
        tenantId,
        visitorId: visitor.id,
        hostId,
        purpose: dto.purpose,
        status: "PRE_REGISTERED" as VisitorStatus,
        passCode,
        qrCodeUrl,
        notes: dto.notes
      },
      include: {
        visitor: true,
        host: true
      }
    });

    await this.recordAudit(
      tenantId,
      "VISITOR_PRE_REGISTERED",
      "VisitorVisit",
      visit.id,
      { passCode, visitorName: dto.name, phone: dto.phone },
      actorContext.userId,
      actorContext.membershipId
    );

    return visit;
  }

  async checkInVisitor(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CheckInVisitorDto
  ) {
    let visit = null;

    if (dto.visitId) {
      visit = await this.prisma.visitorVisit.findFirst({
        where: { id: dto.visitId, tenantId },
        include: { visitor: true }
      });
      if (!visit) {
        throw new NotFoundException(`Visit with ID "${dto.visitId}" not found`);
      }
    } else if (dto.phone && dto.name && dto.hostId) {
      const hostId = await this.resolveTenantEmployeeId(tenantId, dto.hostId, actorContext, "Host employee");
      // Walk-in visitor
      const visitor = await this.prisma.visitor.upsert({
        where: { tenantId_phone: { tenantId, phone: dto.phone } },
        update: { name: dto.name, company: dto.company },
        create: {
          tenantId,
          name: dto.name,
          phone: dto.phone,
          company: dto.company
        }
      });

      const passCode = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${passCode}`;

      visit = await this.prisma.visitorVisit.create({
        data: {
          tenantId,
          visitorId: visitor.id,
          hostId,
          purpose: dto.purpose || "Meeting",
          status: "PRE_REGISTERED" as VisitorStatus,
          passCode,
          qrCodeUrl
        },
        include: { visitor: true }
      });
    } else {
      throw new BadRequestException("Either visitId or walk-in details (phone, name, hostId) required");
    }

    const updated = await this.prisma.visitorVisit.update({
      where: { id: visit.id },
      data: {
        status: "CHECKED_IN" as VisitorStatus,
        checkInTime: new Date(),
        badgeNumber: dto.badgeNumber || `B-${Math.floor(100 + Math.random() * 900)}`
      },
      include: {
        visitor: true,
        host: true
      }
    });

    await this.recordAudit(
      tenantId,
      "VISITOR_CHECKED_IN",
      "VisitorVisit",
      updated.id,
      { badgeNumber: updated.badgeNumber, visitorName: updated.visitor.name },
      actorContext.userId,
      actorContext.membershipId
    );

    return updated;
  }

  async checkOutVisitor(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CheckOutVisitorDto
  ) {
    const visit = await this.prisma.visitorVisit.findFirst({
      where: { id: dto.visitId, tenantId },
      include: { visitor: true }
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID "${dto.visitId}" not found`);
    }

    const updated = await this.prisma.visitorVisit.update({
      where: { id: dto.visitId },
      data: {
        status: "CHECKED_OUT" as VisitorStatus,
        checkOutTime: new Date()
      },
      include: {
        visitor: true,
        host: true
      }
    });

    await this.recordAudit(
      tenantId,
      "VISITOR_CHECKED_OUT",
      "VisitorVisit",
      dto.visitId,
      { visitorName: updated.visitor.name },
      actorContext.userId,
      actorContext.membershipId
    );

    return updated;
  }

  // -------------------------------------------------------------
  // 2. GATE PASS MANAGEMENT
  // -------------------------------------------------------------

  async listGatePasses(tenantId: string, status?: GatePassStatus, type?: GatePassType) {
    return this.prisma.gatePass.findMany({
      where: {
        tenantId,
        ...(status && { status }),
        ...(type && { type })
      },
      include: {
        requester: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createGatePass(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    requesterId: string,
    dto: CreateGatePassDto
  ) {
    const resolvedRequesterId = await this.resolveTenantEmployeeId(tenantId, requesterId, actorContext, "Requester employee");
    const count = await this.prisma.gatePass.count({ where: { tenantId } });
    const passNumber = `GP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

    const gatePass = await this.prisma.gatePass.create({
      data: {
        tenantId,
        passNumber,
        type: dto.type as GatePassType,
        requesterId: resolvedRequesterId,
        itemDescription: dto.itemDescription,
        quantity: dto.quantity,
        serialNumbers: dto.serialNumbers || [],
        destination: dto.destination,
        vehicleNumber: dto.vehicleNumber,
        driverName: dto.driverName,
        returnExpected: dto.returnExpected,
        expectedReturn: dto.expectedReturn ? new Date(dto.expectedReturn) : null,
        status: "PENDING_APPROVAL" as GatePassStatus,
        notes: dto.notes
      },
      include: { requester: true }
    });

    await this.recordAudit(
      tenantId,
      "GATE_PASS_CREATED",
      "GatePass",
      gatePass.id,
      { passNumber: gatePass.passNumber, type: gatePass.type },
      actorContext.userId,
      actorContext.membershipId
    );

    return gatePass;
  }

  async approveGatePass(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    passId: string,
    dto: ApproveGatePassDto
  ) {
    const pass = await this.prisma.gatePass.findFirst({
      where: { id: passId, tenantId }
    });

    if (!pass) {
      throw new NotFoundException(`Gate pass with ID "${passId}" not found`);
    }

    const data: Prisma.GatePassUpdateInput = {};

    if (!dto.approved) {
      data.status = "REJECTED" as GatePassStatus;
    } else if (dto.role === "MANAGER") {
      data.managerApproved = true;
      data.status = "APPROVED" as GatePassStatus;
    } else if (dto.role === "SECURITY") {
      data.securityCleared = true;
      data.exitTime = new Date();
      data.status = pass.returnExpected ? ("IN_TRANSIT" as GatePassStatus) : ("COMPLETED" as GatePassStatus);
    }

    const updated = await this.prisma.gatePass.update({
      where: { id: passId },
      data,
      include: { requester: true }
    });

    await this.recordAudit(
      tenantId,
      "GATE_PASS_APPROVED",
      "GatePass",
      passId,
      { role: dto.role, status: updated.status, approved: dto.approved },
      actorContext.userId,
      actorContext.membershipId
    );

    return updated;
  }

  // -------------------------------------------------------------
  // 3. CONTRACTOR MANAGEMENT
  // -------------------------------------------------------------

  async listContractors(tenantId: string, status?: ContractorStatus) {
    return this.prisma.contractor.findMany({
      where: {
        tenantId,
        ...(status && { status })
      },
      include: {
        accesses: {
          where: { isActive: true }
        }
      },
      orderBy: { companyName: "asc" }
    });
  }

  async createContractor(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CreateContractorDto
  ) {
    const existing = await this.prisma.contractor.findFirst({
      where: { tenantId, contractCode: dto.contractCode }
    });
    if (existing) {
      throw new BadRequestException(
        `Contractor with code "${dto.contractCode}" already exists`
      );
    }

    const contractor = await this.prisma.contractor.create({
      data: {
        tenantId,
        companyName: dto.companyName,
        contractCode: dto.contractCode,
        contactPerson: dto.contactPerson,
        phone: dto.phone,
        email: dto.email,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalWorkers: dto.totalWorkers,
        safetyDocUrl: dto.safetyDocUrl,
        notes: dto.notes
      }
    });

    await this.recordAudit(
      tenantId,
      "CONTRACTOR_CREATED",
      "Contractor",
      contractor.id,
      { companyName: contractor.companyName, contractCode: contractor.contractCode },
      actorContext.userId,
      actorContext.membershipId
    );

    return contractor;
  }

  async addContractorWorkerPass(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: AddContractorWorkerPassDto
  ) {
    const contractor = await this.prisma.contractor.findFirst({
      where: { id: dto.contractorId, tenantId }
    });
    if (!contractor) {
      throw new NotFoundException(`Contractor with ID "${dto.contractorId}" not found`);
    }

    const access = await this.prisma.contractorAccess.create({
      data: {
        tenantId,
        contractorId: dto.contractorId,
        workerName: dto.workerName,
        badgeNumber: dto.badgeNumber,
        allowedZones: dto.allowedZones || [],
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil)
      }
    });

    await this.recordAudit(
      tenantId,
      "CONTRACTOR_WORKER_PASS_ISSUED",
      "ContractorAccess",
      access.id,
      { contractorId: dto.contractorId, workerName: dto.workerName, badgeNumber: dto.badgeNumber },
      actorContext.userId,
      actorContext.membershipId
    );

    return access;
  }
}
