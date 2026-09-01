import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import type { CreateVendorDto, CreateContractDto, CreateComplianceDto } from "./vendors.schemas.js";
import { VendorContractEngine } from "./engines/vendor-contract.engine.js";

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async listVendors(tenantId: string) {
    return this.prisma.vendor.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        contracts: true,
        complianceRecords: true
      },
      orderBy: { name: "asc" }
    });
  }

  async getVendorById(tenantId: string, id: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { tenantId, id, deletedAt: null },
      include: {
        contracts: true,
        complianceRecords: true,
        invoices: true,
        payments: true
      }
    });
    if (!vendor) throw new NotFoundException("Vendor not found");
    return vendor;
  }

  async createVendor(
    tenantId: string,
    actor: { userId: string; membershipId?: string },
    dto: CreateVendorDto
  ) {
    const vendor = await this.prisma.vendor.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        gstin: dto.gstin,
        pan: dto.pan,
        addressJson: (dto.address ?? null) as unknown as object
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actor.userId,
      actorMembershipId: actor.membershipId,
      action: "vendor.created",
      resourceType: "Vendor",
      resourceId: vendor.id,
      metadata: { code: vendor.code, name: vendor.name }
    });

    return vendor;
  }

  async listContracts(tenantId: string, vendorId?: string) {
    return this.prisma.vendorContract.findMany({
      where: {
        tenantId,
        ...(vendorId ? { vendorId } : {})
      },
      include: { vendor: true },
      orderBy: { endDate: "asc" }
    });
  }

  async createContract(
    tenantId: string,
    actor: { userId: string; membershipId?: string },
    dto: CreateContractDto
  ) {
    const contract = await this.prisma.vendorContract.create({
      data: {
        tenantId,
        vendorId: dto.vendorId,
        contractNumber: dto.contractNumber,
        title: dto.title,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        valueInInr: dto.valueInInr,
        termsAndNotes: dto.termsAndNotes,
        slaRating: dto.slaRating
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actor.userId,
      actorMembershipId: actor.membershipId,
      action: "vendor_contract.created",
      resourceType: "VendorContract",
      resourceId: contract.id,
      metadata: { contractNumber: contract.contractNumber, vendorId: contract.vendorId }
    });

    return contract;
  }

  async listCompliance(tenantId: string, vendorId?: string) {
    return this.prisma.vendorCompliance.findMany({
      where: {
        tenantId,
        ...(vendorId ? { vendorId } : {})
      },
      include: { vendor: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async createCompliance(
    tenantId: string,
    actor: { userId: string; membershipId?: string },
    dto: CreateComplianceDto
  ) {
    const record = await this.prisma.vendorCompliance.create({
      data: {
        tenantId,
        vendorId: dto.vendorId,
        complianceType: dto.complianceType,
        documentNumber: dto.documentNumber,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        isVerified: dto.isVerified,
        status: dto.status,
        notes: dto.notes
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actor.userId,
      actorMembershipId: actor.membershipId,
      action: "vendor_compliance.created",
      resourceType: "VendorCompliance",
      resourceId: record.id,
      metadata: { complianceType: record.complianceType, vendorId: record.vendorId }
    });

    return record;
  }

  async getVendorAnalytics(tenantId: string) {
    const [vendors, contracts, compliances] = await Promise.all([
      this.prisma.vendor.findMany({
        where: { tenantId, deletedAt: null },
        include: { contracts: true, complianceRecords: true }
      }),
      this.prisma.vendorContract.findMany({
        where: { tenantId },
        include: { vendor: true }
      }),
      this.prisma.vendorCompliance.findMany({
        where: { tenantId }
      })
    ]);

    const totalVendors = vendors.length;
    const activeVendors = vendors.filter((v) => v.isActive).length;
    const totalContractValueInr = contracts.reduce((sum, c) => sum + c.valueInInr, 0);

    const scorecards = vendors.map((v) =>
      VendorContractEngine.evaluateVendor({
        vendorId: v.id,
        vendorName: v.name,
        contracts: v.contracts,
        compliances: v.complianceRecords
      })
    );

    const expiringAlerts = VendorContractEngine.getExpiringContractAlerts(contracts, 60);

    const compliantCount = compliances.filter((c) => c.status === "COMPLIANT" && c.isVerified).length;
    const overallComplianceRate = compliances.length > 0
      ? Math.round((compliantCount / compliances.length) * 100)
      : 100;

    return {
      totalVendors,
      activeVendors,
      totalContractValueInr,
      overallComplianceRate,
      scorecards,
      expiringAlerts
    };
  }
}
