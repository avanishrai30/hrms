import { describe, expect, it, vi } from "vitest";
import { LocationVerificationStatus } from "@prisma/client";
import { LocationsService } from "./locations.service.js";

function createService(prismaOverrides: Record<string, unknown> = {}) {
  const prisma = {
    employee: { findFirst: vi.fn() },
    locationAssignment: { findMany: vi.fn() },
    location: { findMany: vi.fn() },
    locationVerification: { create: vi.fn() },
    ...prismaOverrides
  };
  const auditService = { record: vi.fn() };
  return { service: new LocationsService(prisma as never, auditService as never), prisma, auditService };
}

describe("LocationsService tenant eligibility", () => {
  it("does not fall back to every active location when an employee has no assignment", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue({ id: "employee-1", departmentId: null } as never);
    vi.mocked(prisma.locationAssignment.findMany).mockResolvedValue([] as never);

    const locations = await service.getAssignedLocations("tenant-1", "employee-1");

    expect(locations).toEqual([]);
    expect(prisma.location.findMany).not.toHaveBeenCalled();
  });

  it("records failed GPS verification when no assigned location exists", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue({ id: "employee-1", departmentId: null } as never);
    vi.mocked(prisma.locationAssignment.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.locationVerification.create).mockResolvedValue({ id: "verification-1" } as never);

    const result = await service.verifyGps("tenant-1", "employee-1", {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 12
    });

    expect(result.verified).toBe(false);
    expect(result.status).toBe(LocationVerificationStatus.NO_ASSIGNED_LOCATION);
    expect(prisma.locationVerification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: "tenant-1",
        employeeId: "employee-1",
        locationId: null,
        status: LocationVerificationStatus.NO_ASSIGNED_LOCATION
      })
    });
  });
});
