import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { WorkforceOperationsService } from "./workforce-operations.service.js";

function createService(prismaOverrides: Record<string, unknown> = {}) {
  const prismaBase = {
    attendance: { findFirst: vi.fn() },
    biometricDevice: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    biometricPunch: { create: vi.fn() },
    department: { findFirst: vi.fn() },
    employee: { findFirst: vi.fn() },
    gatePass: { findFirst: vi.fn() },
    location: { findFirst: vi.fn() },
    shift: { findFirst: vi.fn() },
    shiftSwapRequest: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    shiftAssignment: { create: vi.fn(), updateMany: vi.fn() },
    employeeTimelineEvent: { create: vi.fn() },
    workforceSchedule: { create: vi.fn() }
  };
  const prisma = {
    ...prismaBase,
    ...prismaOverrides
  } as typeof prismaBase & { $transaction: ReturnType<typeof vi.fn> };
  prisma.$transaction = vi.fn(async (callback: (tx: typeof prismaBase) => unknown) => {
    return callback(prisma);
  });
  const audit = { record: vi.fn() };
  return { service: new WorkforceOperationsService(prisma as never, audit as never), prisma, audit };
}

describe("WorkforceOperationsService tenant isolation", () => {
  it("rejects biometric devices attached to another tenant location", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.biometricDevice.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.location.findFirst).mockResolvedValue(null as never);

    await expect(
      service.createBiometricDevice(
        "tenant-a",
        {
          deviceName: "Reception Terminal",
          deviceType: "BIOMETRIC_TERMINAL",
          vendor: "ESSL",
          serialNumber: "DEV-001",
          siteLocationId: "11111111-1111-4111-8111-111111111111",
          syncMode: "PUSH",
          metadata: {}
        },
        "user-1",
        "membership-1"
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.biometricDevice.create).not.toHaveBeenCalled();
  });

  it("rejects biometric punch employee IDs outside the active tenant", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.biometricDevice.findFirst).mockResolvedValue({ id: "device-1" } as never);
    vi.mocked(prisma.employee.findFirst).mockResolvedValue(null as never);

    await expect(
      service.recordBiometricPunch("tenant-a", {
        deviceId: "11111111-1111-4111-8111-111111111111",
        biometricUserId: "bio-1",
        employeeId: "22222222-2222-4222-8222-222222222222",
        punchType: "CHECK_IN",
        verificationMode: "FINGERPRINT",
        rawPayload: {}
      })
    ).rejects.toThrow(NotFoundException);
    expect(prisma.biometricPunch.create).not.toHaveBeenCalled();
  });

  it("rejects shift swap requests with cross-tenant participants or shifts", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst)
      .mockResolvedValueOnce({ id: "requester-1" } as never)
      .mockResolvedValueOnce(null as never);
    vi.mocked(prisma.shift.findFirst).mockResolvedValue({ id: "shift-1" } as never);

    await expect(
      service.createShiftSwapRequest(
        "tenant-a",
        "requester-1",
        {
          targetEmployeeId: "22222222-2222-4222-8222-222222222222",
          sourceShiftId: "33333333-3333-4333-8333-333333333333",
          targetShiftId: "44444444-4444-4444-8444-444444444444",
          swapDate: "2099-01-01T00:00:00.000Z",
          reason: "Coverage handoff"
        },
        "user-1",
        "membership-1"
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.shiftSwapRequest.create).not.toHaveBeenCalled();
  });

  it("assigns employee shifts with tenant checks and audit", async () => {
    const assignment = {
      id: "assignment-1",
      employeeId: "employee-1",
      shiftId: "shift-1",
      shift: { id: "shift-1", name: "Morning Shift" },
      employee: { id: "employee-1", fullName: "Asha Nair", employeeCode: "EMP-001" }
    };
    const { service, prisma, audit } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue({ id: "employee-1" } as never);
    vi.mocked(prisma.shift.findFirst).mockResolvedValue({ id: "shift-1" } as never);
    vi.mocked(prisma.shiftAssignment.create).mockResolvedValue(assignment as never);

    await expect(
      service.assignEmployeeShift(
        "tenant-a",
        {
          employeeId: "11111111-1111-4111-8111-111111111111",
          shiftId: "22222222-2222-4222-8222-222222222222",
          startsOn: "2099-01-01",
          reason: "Initial roster assignment"
        },
        "user-1",
        "membership-1"
      )
    ).resolves.toMatchObject({ id: "assignment-1" });

    expect(prisma.shiftAssignment.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tenantId: "tenant-a" }) }));
    expect(prisma.employeeTimelineEvent.create).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "WORKFORCE_SHIFT_ASSIGNED", tenantId: "tenant-a" }));
  });

  it("rejects contractor attendance linked to another tenant gate pass", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.location.findFirst).mockResolvedValue({ id: "location-1" } as never);
    vi.mocked(prisma.gatePass.findFirst).mockResolvedValue(null as never);

    await expect(
      service.recordContractorAttendance(
        "tenant-a",
        {
          vendorName: "Vendor",
          contractorName: "Contractor",
          contractorCode: "CON-001",
          siteLocationId: "11111111-1111-4111-8111-111111111111",
          gatePassId: "22222222-2222-4222-8222-222222222222",
          totalHours: 0,
          hourlyRate: 0,
          totalCost: 0,
          status: "PRESENT"
        },
        "user-1",
        "membership-1"
      )
    ).rejects.toThrow(NotFoundException);
  });

  it("rejects workforce schedules for departments outside the active tenant", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.department.findFirst).mockResolvedValue(null as never);

    await expect(
      service.createWorkforceSchedule(
        "tenant-a",
        {
          scheduleName: "Production Coverage",
          departmentId: "11111111-1111-4111-8111-111111111111",
          startDate: "2099-01-01T00:00:00.000Z",
          endDate: "2099-01-31T00:00:00.000Z",
          targetHeadcount: 10,
          scheduledHeadcount: 8,
          scheduleData: {}
        },
        "user-1",
        "membership-1"
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.workforceSchedule.create).not.toHaveBeenCalled();
  });
});
