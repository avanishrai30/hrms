import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PayrollRunStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import type { AuditService } from "../src/modules/audit/audit.service.js";
import type { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { PayrollService } from "../src/modules/payroll/payroll.service.js";

function makeService(overrides: Record<string, unknown> = {}) {
  const prisma = {
    tenantSettings: { findUnique: vi.fn().mockResolvedValue({ currency: "USD" }) },
    payrollRun: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue({ id: "run-1", tenantId: "tenant-A", status: PayrollRunStatus.GENERATED }),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({ id: "run-1", status: PayrollRunStatus.APPROVED }),
      delete: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0)
    },
    employee: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: "employee-1" }),
      count: vi.fn().mockResolvedValue(0)
    },
    attendance: { findMany: vi.fn().mockResolvedValue([]) },
    leaveRequest: { findMany: vi.fn().mockResolvedValue([]) },
    holiday: { findMany: vi.fn().mockResolvedValue([]) },
    payrollApproval: { create: vi.fn() },
    payrollTaxDeclaration: {
      findFirst: vi.fn().mockResolvedValue({ id: "declaration-1", tenantId: "tenant-A" }),
      update: vi.fn().mockResolvedValue({ id: "declaration-1" })
    },
    payrollTaxProof: {
      findFirst: vi.fn().mockResolvedValue({ id: "proof-1", tenantId: "tenant-A" }),
      create: vi.fn().mockResolvedValue({ id: "proof-1" }),
      update: vi.fn().mockResolvedValue({ id: "proof-1" })
    },
    payrollSettlement: {
      findFirst: vi.fn().mockResolvedValue({ id: "settlement-1", tenantId: "tenant-A" }),
      update: vi.fn().mockResolvedValue({ id: "settlement-1" }),
      create: vi.fn().mockResolvedValue({ id: "settlement-1" }),
      findMany: vi.fn().mockResolvedValue([])
    },
    compensationRevision: {
      findFirst: vi.fn().mockResolvedValue({ id: "revision-1", tenantId: "tenant-A" }),
      update: vi.fn().mockResolvedValue({ id: "revision-1" }),
      create: vi.fn().mockResolvedValue({ id: "revision-1" }),
      findMany: vi.fn().mockResolvedValue([])
    },
    $transaction: vi.fn().mockImplementation((callback: (tx: unknown) => Promise<unknown>) => callback(prisma)),
    ...overrides
  };
  const auditService = { record: vi.fn().mockResolvedValue(undefined) };
  const service = new PayrollService(
    prisma as unknown as PrismaService,
    auditService as unknown as AuditService
  );

  return { service, prisma, auditService };
}

describe("Payroll service hardening", () => {
  it("requires tenant currency before generating payroll", async () => {
    const { service, prisma } = makeService({
      tenantSettings: { findUnique: vi.fn().mockResolvedValue(null) }
    });

    await expect(
      service.generatePayrollRun("tenant-A", { month: 4, year: 2026 }, "user-1")
    ).rejects.toThrow(new BadRequestException("Tenant currency must be configured before payroll generation."));

    expect(prisma.payrollRun.create).not.toHaveBeenCalled();
  });

  it("rejects active employees without effective compensation instead of silently skipping them", async () => {
    const { service, prisma } = makeService();
    prisma.employee.findMany.mockResolvedValue([
      {
        id: "employee-1",
        employeeCode: "EMP-001",
        compensations: [],
        department: {},
        designation: {}
      }
    ]);

    await expect(
      service.generatePayrollRun("tenant-A", { month: 4, year: 2026 }, "user-1")
    ).rejects.toMatchObject({
      response: {
        message: "Payroll cannot be generated until every active employee has effective compensation.",
        employeeCodes: ["EMP-001"]
      }
    });
  });

  it("rejects compensation currency that does not match tenant payroll currency", async () => {
    const { service, prisma } = makeService();
    prisma.employee.findMany.mockResolvedValue([
      {
        id: "employee-1",
        employeeCode: "EMP-001",
        compensations: [{ currency: "INR" }],
        department: {},
        designation: {}
      }
    ]);

    await expect(
      service.generatePayrollRun("tenant-A", { month: 4, year: 2026 }, "user-1")
    ).rejects.toMatchObject({
      response: {
        message: "Payroll run currency must match all employee compensation records.",
        currency: "USD",
        employeeCode: "EMP-001",
        employeeCurrency: "INR"
      }
    });
  });

  it("rejects approval unless the run is generated", async () => {
    const { service, prisma } = makeService();
    prisma.payrollRun.findFirst.mockResolvedValue({ id: "run-1", tenantId: "tenant-A", status: PayrollRunStatus.APPROVED });

    await expect(service.approvePayrollRun("tenant-A", "run-1", {}, "user-1", "HR_ADMIN")).rejects.toThrow(
      new BadRequestException("Only GENERATED payroll runs can be approved.")
    );

    expect(prisma.payrollApproval.create).not.toHaveBeenCalled();
  });

  it("rejects approved-run cancellation through the generation path", async () => {
    const { service, prisma } = makeService();
    prisma.payrollRun.findFirst.mockResolvedValue({ id: "run-1", tenantId: "tenant-A", status: PayrollRunStatus.APPROVED });

    await expect(service.cancelPayrollRun("tenant-A", "run-1", "user-1")).rejects.toThrow(
      new BadRequestException("Approved payroll runs must be locked or reviewed through payroll approvals.")
    );
  });

  it("rejects wrong-tenant tax declaration verification", async () => {
    const { service, prisma } = makeService();
    prisma.payrollTaxDeclaration.findFirst.mockResolvedValue(null);

    await expect(
      service.verifyTaxDeclaration("tenant-A", "declaration-B", { status: "VERIFIED" }, "user-1")
    ).rejects.toThrow(new NotFoundException("Payroll tax declaration not found."));

    expect(prisma.payrollTaxDeclaration.update).not.toHaveBeenCalled();
  });

  it("audits tenant-owned tax proof uploads with the actor context", async () => {
    const { service, auditService } = makeService();

    await service.uploadTaxProof(
      "tenant-A",
      {
        declarationId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        section: "80C",
        claimedAmount: 1000,
        documentUrl: "https://storage.example.com/proof.pdf"
      },
      "user-1",
      "membership-1"
    );

    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-A",
        actorUserId: "user-1",
        actorMembershipId: "membership-1",
        action: "TAX_PROOF_UPLOADED",
        resourceType: "PayrollTaxProof",
        resourceId: "proof-1"
      })
    );
  });
});
