import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { VisitorService } from "./visitor.service.js";

function createService(prismaOverrides: Record<string, unknown> = {}) {
  const prisma = {
    employee: { findFirst: vi.fn() },
    gatePass: { count: vi.fn(), create: vi.fn() },
    tenantMembership: { findFirst: vi.fn() },
    visitor: { upsert: vi.fn() },
    visitorVisit: { create: vi.fn() },
    ...prismaOverrides
  };
  const auditService = { record: vi.fn() };
  return { service: new VisitorService(prisma as never, auditService as never), prisma, auditService };
}

describe("VisitorService tenant isolation", () => {
  it("rejects visitor pre-registration for hosts outside the active tenant", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue(null as never);

    await expect(
      service.preRegisterVisitor(
        "tenant-a",
        { userId: "user-1", membershipId: "membership-1" },
        {
          name: "Visitor",
          phone: "+15555550100",
          hostId: "employee-from-tenant-b",
          purpose: "Meeting"
        }
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.visitorVisit.create).not.toHaveBeenCalled();
  });

  it("resolves gate pass requester through same-tenant membership when only user context is present", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.tenantMembership.findFirst).mockResolvedValue({ employeeId: "employee-1" } as never);
    vi.mocked(prisma.gatePass.count).mockResolvedValue(0 as never);
    vi.mocked(prisma.gatePass.create).mockResolvedValue({
      id: "pass-1",
      passNumber: "GP-2099-00001",
      type: "MATERIAL_OUTWARD"
    } as never);

    await service.createGatePass(
      "tenant-a",
      { userId: "user-1", membershipId: "membership-1" },
      "user-1",
      {
        type: "MATERIAL_OUTWARD",
        itemDescription: "Equipment",
        quantity: 1,
        serialNumbers: [],
        destination: "Service center",
        returnExpected: false
      }
    );

    expect(prisma.gatePass.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: "tenant-a", requesterId: "employee-1" }),
      include: { requester: true }
    });
  });
});
