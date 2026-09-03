import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { FacilitiesService } from "./facilities.service.js";

function createService(prismaOverrides: Record<string, unknown> = {}) {
  const prisma = {
    employee: { findFirst: vi.fn() },
    facility: { findFirst: vi.fn() },
    facilityBooking: { create: vi.fn(), findFirst: vi.fn() },
    tenantMembership: { findFirst: vi.fn() },
    vehicle: { findFirst: vi.fn() },
    vehicleBooking: { create: vi.fn() },
    ...prismaOverrides
  };
  const auditService = { record: vi.fn() };
  return { service: new FacilitiesService(prisma as never, auditService as never), prisma, auditService };
}

describe("FacilitiesService tenant isolation", () => {
  it("rejects facility bookings for employees outside the active tenant", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue(null as never);

    await expect(
      service.bookFacility(
        "tenant-a",
        { userId: "user-1", membershipId: "membership-1" },
        "employee-from-tenant-b",
        {
          facilityId: "11111111-1111-4111-8111-111111111111",
          title: "Planning",
          startTime: "2099-01-01T10:00:00.000Z",
          endTime: "2099-01-01T11:00:00.000Z",
          attendees: 2
        }
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.facilityBooking.create).not.toHaveBeenCalled();
  });

  it("resolves session user fallback through same-tenant membership before booking a vehicle", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.tenantMembership.findFirst).mockResolvedValue({ employeeId: "employee-1" } as never);
    vi.mocked(prisma.vehicle.findFirst).mockResolvedValue({ id: "vehicle-1" } as never);
    vi.mocked(prisma.vehicleBooking.create).mockResolvedValue({ id: "booking-1" } as never);

    await service.bookVehicle(
      "tenant-a",
      { userId: "user-1", membershipId: "membership-1" },
      "user-1",
      {
        vehicleId: "11111111-1111-4111-8111-111111111111",
        purpose: "Site visit",
        destination: "Client site",
        startTime: "2099-01-01T10:00:00.000Z",
        endTime: "2099-01-01T11:00:00.000Z",
        passengers: 1
      }
    );

    expect(prisma.vehicleBooking.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: "tenant-a", employeeId: "employee-1" })
    });
  });
});
