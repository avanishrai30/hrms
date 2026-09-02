import { describe, expect, it, vi } from "vitest";
import { OnboardingIntegrationService } from "../src/modules/recruitment/engines/onboarding-integration.service.js";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../src/modules/prisma/prisma.service.js";
import type { AuditService } from "../src/modules/audit/audit.service.js";

describe("Recruitment Candidate Onboarding & Idempotency Integration Service (Task 04.1)", () => {
  const mockAuditService = {
    record: vi.fn().mockResolvedValue(undefined)
  };

  it("throws NotFoundException when candidate does not exist or belongs to another tenant", async () => {
    const mockPrisma = {
      candidate: {
        findFirst: vi.fn().mockResolvedValue(null)
      }
    };

    const service = new OnboardingIntegrationService(
      mockPrisma as unknown as PrismaService,
      mockAuditService as unknown as AuditService
    );

    await expect(
      service.onboardHiredCandidate("tenant-A", "candidate-belonging-to-tenant-B", {})
    ).rejects.toThrow(NotFoundException);

    expect(mockPrisma.candidate.findFirst).toHaveBeenCalledWith({
      where: { id: "candidate-belonging-to-tenant-B", tenantId: "tenant-A" },
      include: expect.any(Object)
    });
  });

  it("throws BadRequestException if candidate is already onboarded (Idempotency Protection)", async () => {
    const mockPrisma = {
      candidate: {
        findFirst: vi.fn().mockResolvedValue({
          id: "cand-1",
          tenantId: "tenant-A",
          hiredEmployeeId: "emp-existing-123",
          fullName: "Ananya Sharma",
          email: "ananya@example.com"
        })
      }
    };

    const service = new OnboardingIntegrationService(
      mockPrisma as unknown as PrismaService,
      mockAuditService as unknown as AuditService
    );

    await expect(
      service.onboardHiredCandidate("tenant-A", "cand-1", {})
    ).rejects.toThrow(new BadRequestException("Candidate is already onboarded as an employee."));
  });

  it("throws BadRequestException if candidate has no associated job requisition", async () => {
    const mockPrisma = {
      candidate: {
        findFirst: vi.fn().mockResolvedValue({
          id: "cand-2",
          tenantId: "tenant-A",
          hiredEmployeeId: null,
          fullName: "Vikram Sen",
          email: "vikram@example.com",
          applications: [],
          offers: []
        })
      }
    };

    const service = new OnboardingIntegrationService(
      mockPrisma as unknown as PrismaService,
      mockAuditService as unknown as AuditService
    );

    await expect(
      service.onboardHiredCandidate("tenant-A", "cand-2", {})
    ).rejects.toThrow(new BadRequestException("Candidate has no associated job requisition."));
  });

  it("successfully creates employee and marks candidate HIRED inside transaction on accepted offer", async () => {
    const mockCandidate = {
      id: "cand-3",
      tenantId: "tenant-A",
      hiredEmployeeId: null,
      fullName: "Karan Johar",
      email: "karan@example.com",
      mobile: "+919876543210",
      currentLocation: "Bengaluru",
      summary: "Experienced software engineer",
      offers: [
        {
          id: "offer-1",
          offerCode: "OFF-2026-001",
          status: "ACCEPTED",
          baseSalary: "1200000",
          totalCtc: "1500000",
          joiningDate: new Date("2026-10-01")
        }
      ],
      applications: [
        {
          id: "app-1",
          requisition: {
            id: "req-1",
            departmentId: "dept-1",
            designationId: "desig-1",
            employmentType: "FULL_TIME"
          }
        }
      ]
    };

    const mockCreatedEmployee = {
      id: "emp-new-999",
      tenantId: "tenant-A",
      employeeCode: "EMP-9999",
      fullName: "Karan Johar",
      email: "karan@example.com",
      joiningDate: new Date("2026-10-01")
    };

    const mockTx = {
      employee: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(mockCreatedEmployee)
      },
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "user-1", email: "karan@example.com" })
      },
      role: {
        findFirst: vi.fn().mockResolvedValue({ id: "role-emp", code: "EMPLOYEE" })
      },
      tenantMembership: {
        create: vi.fn().mockResolvedValue({ id: "mem-1" })
      },
      tenantMembershipRole: {
        create: vi.fn().mockResolvedValue({})
      },
      employeeProfile: {
        create: vi.fn().mockResolvedValue({})
      },
      leaveType: {
        findMany: vi.fn().mockResolvedValue([{ id: "lt-1" }])
      },
      leaveBalance: {
        create: vi.fn().mockResolvedValue({})
      },
      employeeCompensation: {
        create: vi.fn().mockResolvedValue({})
      },
      candidate: {
        update: vi.fn().mockResolvedValue({})
      },
      candidateActivity: {
        create: vi.fn().mockResolvedValue({})
      }
    };

    const mockPrisma = {
      candidate: {
        findFirst: vi.fn().mockResolvedValue(mockCandidate)
      },
      $transaction: vi.fn().mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback(mockTx))
    };

    const service = new OnboardingIntegrationService(
      mockPrisma as unknown as PrismaService,
      mockAuditService as unknown as AuditService
    );

    const result = await service.onboardHiredCandidate("tenant-A", "cand-3", {
      employeeCode: "EMP-9999"
    });

    expect(result.success).toBe(true);
    expect(result.employeeId).toBe("emp-new-999");
    expect(result.employeeCode).toBe("EMP-9999");

    // Verify candidate was marked HIRED and linked to employee
    expect(mockTx.candidate.update).toHaveBeenCalledWith({
      where: { id: "cand-3" },
      data: {
        status: "HIRED",
        hiredEmployeeId: "emp-new-999"
      }
    });

    // Verify compensation was recorded with INR currency
    expect(mockTx.employeeCompensation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        employeeId: "emp-new-999",
        monthlyCtc: 1200000,
        annualCtc: 1500000,
        currency: "INR"
      })
    });
  });
});
