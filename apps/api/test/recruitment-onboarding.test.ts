import { BadRequestException, NotFoundException } from "@nestjs/common";
import { EmploymentStatus, SalaryType } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import type { AuditService } from "../src/modules/audit/audit.service.js";
import type { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { OnboardingIntegrationService } from "../src/modules/recruitment/engines/onboarding-integration.service.js";

const tenantId = "tenant-A";
const candidateId = "candidate-1";
const joiningDate = new Date("2026-10-01T00:00:00.000Z");

function makeCandidate(overrides: Record<string, unknown> = {}) {
  const application = {
    id: "application-1",
    tenantId,
    candidateId,
    requisitionId: "requisition-1",
    requisition: {
      id: "requisition-1",
      tenantId,
      departmentId: "department-1",
      designationId: "designation-1",
      employmentType: "FULL_TIME"
    },
    offers: [
      {
        id: "offer-1",
        tenantId,
        applicationId: "application-1",
        candidateId,
        requisitionId: "requisition-1",
        offerCode: "OFF-001",
        status: "ACCEPTED",
        joiningDate
      }
    ]
  };

  return {
    id: candidateId,
    tenantId,
    hiredEmployeeId: null,
    fullName: "Test Candidate",
    email: "candidate@example.com",
    mobile: "+919876543210",
    currentLocation: "Bengaluru",
    summary: "Candidate summary",
    applications: [application],
    ...overrides
  };
}

function makeHarness(candidate: unknown = makeCandidate()) {
  const employee = {
    id: "employee-1",
    employeeCode: "EMP-1001",
    fullName: "Test Candidate",
    email: "candidate@example.com",
    joiningDate
  };
  const tx = {
    candidate: {
      findFirst: vi.fn().mockResolvedValue(candidate),
      update: vi.fn().mockResolvedValue({})
    },
    employee: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(employee)
    },
    role: {
      findFirst: vi.fn().mockResolvedValue({ id: "role-employee", code: "EMPLOYEE" })
    },
    user: {
      create: vi.fn().mockResolvedValue({ id: "user-1", email: "candidate@example.com", status: "INVITED" }),
      findUnique: vi.fn().mockResolvedValue({ email: "hr.admin@example.com" })
    },
    tenantMembership: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "membership-1" }),
      update: vi.fn().mockResolvedValue({ id: "membership-1" })
    },
    tenantMembershipRole: {
      upsert: vi.fn().mockResolvedValue({})
    },
    employeeProfile: {
      create: vi.fn().mockResolvedValue({})
    },
    candidateActivity: {
      create: vi.fn().mockResolvedValue({})
    },
    leaveType: {
      findMany: vi.fn()
    },
    leaveBalance: {
      create: vi.fn()
    },
    employeeCompensation: {
      create: vi.fn()
    }
  };
  const prisma = {
    $transaction: vi.fn().mockImplementation((callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx))
  };
  const auditService = {
    record: vi.fn().mockResolvedValue(undefined)
  };

  const service = new OnboardingIntegrationService(
    prisma as unknown as PrismaService,
    auditService as unknown as AuditService
  );

  return { service, prisma, tx, auditService };
}

const validOptions = {
  employeeCode: "EMP-1001",
  salaryType: SalaryType.MONTHLY
};

describe("Recruitment candidate onboarding safety", () => {
  it("rejects a candidate from another tenant", async () => {
    const { service, tx } = makeHarness(null);

    await expect(service.onboardHiredCandidate(tenantId, "tenant-b-candidate", validOptions)).rejects.toThrow(
      NotFoundException
    );

    expect(tx.candidate.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "tenant-b-candidate", tenantId } })
    );
  });

  it("rejects an already converted candidate inside the transaction", async () => {
    const { service, tx } = makeHarness(makeCandidate({ hiredEmployeeId: "employee-existing" }));

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      new BadRequestException("Candidate is already onboarded as an employee.")
    );

    expect(tx.employee.create).not.toHaveBeenCalled();
  });

  it("rejects a candidate with a requisition but no accepted offer", async () => {
    const candidate = makeCandidate({
      applications: [{ ...makeCandidate().applications[0], offers: [] }]
    });
    const { service, tx } = makeHarness(candidate);

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      new BadRequestException("Candidate cannot be onboarded without an accepted offer.")
    );

    expect(tx.employee.create).not.toHaveBeenCalled();
  });

  it("rejects accepted offers that belong to a different candidate", async () => {
    const application = makeCandidate().applications[0];
    const candidate = makeCandidate({
      applications: [
        {
          ...application,
          offers: [{ ...application.offers[0], candidateId: "other-candidate" }]
        }
      ]
    });
    const { service, tx } = makeHarness(candidate);

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      "Candidate cannot be onboarded without an accepted offer."
    );

    expect(tx.employee.create).not.toHaveBeenCalled();
  });

  it("rejects accepted offers that belong to a different tenant", async () => {
    const application = makeCandidate().applications[0];
    const candidate = makeCandidate({
      applications: [
        {
          ...application,
          offers: [{ ...application.offers[0], tenantId: "tenant-B" }]
        }
      ]
    });
    const { service, tx } = makeHarness(candidate);

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      "Candidate cannot be onboarded without an accepted offer."
    );

    expect(tx.employee.create).not.toHaveBeenCalled();
  });

  it("requires an explicit employee code and does not call Date.now for fallback generation", async () => {
    const dateNow = vi.spyOn(Date, "now");
    const { service, tx } = makeHarness();

    await expect(service.onboardHiredCandidate(tenantId, candidateId, { salaryType: SalaryType.MONTHLY })).rejects.toThrow(
      new BadRequestException("Employee code is required for candidate onboarding.")
    );

    expect(dateNow).not.toHaveBeenCalled();
    expect(tx.employee.create).not.toHaveBeenCalled();
    dateNow.mockRestore();
  });

  it("requires a valid joining date instead of falling back to today", async () => {
    const application = makeCandidate().applications[0];
    const candidate = makeCandidate({
      applications: [
        {
          ...application,
          offers: [{ ...application.offers[0], joiningDate: new Date("invalid") }]
        }
      ]
    });
    const { service, tx } = makeHarness(candidate);

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      new BadRequestException("Candidate onboarding requires a valid joining date.")
    );

    expect(tx.employee.create).not.toHaveBeenCalled();
  });

  it("requires employment type from the requisition and never defaults to FULL_TIME", async () => {
    const application = makeCandidate().applications[0];
    const candidate = makeCandidate({
      applications: [
        {
          ...application,
          requisition: { ...application.requisition, employmentType: undefined }
        }
      ]
    });
    const { service, tx } = makeHarness(candidate);

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      new BadRequestException("Job requisition employment type is required before onboarding.")
    );

    expect(tx.employee.create).not.toHaveBeenCalled();
  });

  it("requires salary type from explicit input and never defaults to MONTHLY", async () => {
    const { service, tx } = makeHarness();

    await expect(service.onboardHiredCandidate(tenantId, candidateId, { employeeCode: "EMP-1001" })).rejects.toThrow(
      new BadRequestException("Salary type is required for candidate onboarding.")
    );

    expect(tx.employee.create).not.toHaveBeenCalled();
  });

  it("creates a draft employee and invited tenant access without leave or compensation side effects", async () => {
    const { service, tx, auditService } = makeHarness();

    const result = await service.onboardHiredCandidate(
      tenantId,
      candidateId,
      validOptions,
      "actor-user-1",
      "actor-membership-1"
    );

    expect(result).toMatchObject({
      success: true,
      candidateId,
      employeeId: "employee-1",
      employeeCode: "EMP-1001"
    });
    expect(tx.employee.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId,
        employeeCode: "EMP-1001",
        salaryType: SalaryType.MONTHLY,
        status: EmploymentStatus.DRAFT,
        joiningDate
      })
    });
    expect(tx.employee.create.mock.calls[0][0].data).not.toHaveProperty("activatedAt");
    expect(tx.user.create).toHaveBeenCalledWith({
      data: {
        email: "candidate@example.com",
        phone: "+919876543210",
        status: "INVITED"
      }
    });
    expect(tx.tenantMembership.create).toHaveBeenCalledWith({
      data: {
        tenantId,
        userId: "user-1",
        employeeId: "employee-1",
        status: "INVITED"
      }
    });
    expect(tx.leaveType.findMany).not.toHaveBeenCalled();
    expect(tx.leaveBalance.create).not.toHaveBeenCalled();
    expect(tx.employeeCompensation.create).not.toHaveBeenCalled();
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        actorUserId: "actor-user-1",
        actorMembershipId: "actor-membership-1",
        action: "candidate.onboarded",
        resourceType: "candidate",
        resourceId: candidateId
      })
    );
  });

  it("uses the accepted offer joining date unless an explicit valid date is supplied", async () => {
    const { service, tx } = makeHarness();
    const explicitDate = "2026-11-15T00:00:00.000Z";

    await service.onboardHiredCandidate(tenantId, candidateId, {
      ...validOptions,
      joiningDate: explicitDate
    });

    expect(tx.employee.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ joiningDate: new Date(explicitDate) })
    });
  });

  it("rejects compensation template input instead of creating ambiguous compensation records", async () => {
    const { service, tx } = makeHarness();

    await expect(
      service.onboardHiredCandidate(tenantId, candidateId, {
        ...validOptions,
        salaryTemplateId: "11111111-1111-4111-8111-111111111111"
      })
    ).rejects.toThrow("Compensation setup must be completed through the compensation workflow.");

    expect(tx.employeeCompensation.create).not.toHaveBeenCalled();
  });

  it("never assigns an arbitrary tenant role when EMPLOYEE is missing", async () => {
    const { service, tx } = makeHarness();
    tx.role.findFirst.mockResolvedValue(null);

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      new BadRequestException("Tenant EMPLOYEE role is required before candidate onboarding.")
    );

    expect(tx.role.findFirst).toHaveBeenCalledTimes(1);
    expect(tx.role.findFirst).toHaveBeenCalledWith({ where: { tenantId, code: "EMPLOYEE" } });
    expect(tx.tenantMembershipRole.upsert).not.toHaveBeenCalled();
  });

  it("links user identity only through current-tenant membership lookup", async () => {
    const { service, tx } = makeHarness();
    tx.tenantMembership.findFirst.mockResolvedValue({
      id: "membership-existing",
      tenantId,
      userId: "user-existing",
      employeeId: null,
      user: { id: "user-existing", email: "candidate@example.com" }
    });
    tx.tenantMembership.update.mockResolvedValue({ id: "membership-existing" });

    await service.onboardHiredCandidate(tenantId, candidateId, validOptions);

    expect(tx.tenantMembership.findFirst).toHaveBeenCalledWith({
      where: { tenantId, user: { email: "candidate@example.com" } },
      include: { user: true }
    });
    expect(tx.user.create).not.toHaveBeenCalled();
    expect(tx.tenantMembership.update).toHaveBeenCalledWith({
      where: { id: "membership-existing" },
      data: { employeeId: "employee-1" }
    });
  });

  it("rejects tenant membership collisions that are already linked to another employee", async () => {
    const { service, tx } = makeHarness();
    tx.tenantMembership.findFirst.mockResolvedValue({
      id: "membership-existing",
      tenantId,
      userId: "user-existing",
      employeeId: "employee-other",
      user: { id: "user-existing", email: "candidate@example.com" }
    });

    await expect(service.onboardHiredCandidate(tenantId, candidateId, validOptions)).rejects.toThrow(
      new BadRequestException("Tenant user membership is already linked to another employee.")
    );
  });

  it("keeps the conversion atomic and depends on tenant-scoped unique constraints for duplicate attempts", async () => {
    const { service, prisma, tx } = makeHarness();

    await service.onboardHiredCandidate(tenantId, candidateId, validOptions);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.employee.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId,
        OR: [{ employeeCode: "EMP-1001" }, { email: "candidate@example.com" }]
      }
    });
    expect(tx.tenantMembershipRole.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_membershipId_roleId: {
            tenantId,
            membershipId: "membership-1",
            roleId: "role-employee"
          }
        }
      })
    );
  });

  it("links candidate to the created employee and records actor-aware timeline metadata", async () => {
    const { service, tx } = makeHarness();

    await service.onboardHiredCandidate(tenantId, candidateId, validOptions, "actor-user-1");

    expect(tx.candidate.update).toHaveBeenCalledWith({
      where: { id: candidateId },
      data: { status: "HIRED", hiredEmployeeId: "employee-1" }
    });
    expect(tx.candidateActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId,
        candidateId,
        actorName: "hr.admin@example.com",
        activityType: "CANDIDATE_ONBOARDED",
        title: "Candidate Converted to Employee Draft",
        metadataJson: expect.objectContaining({
          employeeId: "employee-1",
          employeeCode: "EMP-1001",
          offerId: "offer-1",
          applicationId: "application-1",
          requisitionId: "requisition-1"
        })
      })
    });
  });
});
