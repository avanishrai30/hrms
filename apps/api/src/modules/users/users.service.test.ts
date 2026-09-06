import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { UsersService } from "./users.service.js";

function createService(prismaOverrides: Record<string, unknown> = {}) {
  const prisma = {
    tenantMembership: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn()
    },
    tenantMembershipRole: {
      count: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn()
    },
    role: { findMany: vi.fn() },
    user: { findFirst: vi.fn(), upsert: vi.fn() },
    employee: { findFirst: vi.fn() },
    employeeTimelineEvent: { create: vi.fn() },
    session: { updateMany: vi.fn() },
    permission: { findMany: vi.fn() },
    ...prismaOverrides
  };
  const auditService = { record: vi.fn() };
  return { service: new UsersService(prisma as never, auditService as never), prisma, auditService };
}

const membership = {
  id: "membership-1",
  tenantId: "tenant-1",
  userId: "user-1",
  employeeId: "employee-1",
  status: "ACTIVE",
  user: { id: "user-1", email: "owner@example.com" },
  employee: { id: "employee-1" },
  roles: [{ role: { id: "role-owner", code: "TENANT_OWNER", name: "Tenant Owner" } }]
};

describe("UsersService account security", () => {
  it("blocks users from changing their own tenant roles", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.tenantMembership.findFirst).mockResolvedValue(membership as never);

    await expect(
      service.assignRoles("tenant-1", "membership-1", { roles: ["EMPLOYEE"] }, "user-1", "membership-1")
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.tenantMembershipRole.deleteMany).not.toHaveBeenCalled();
  });

  it("blocks users from suspending or removing their own account", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.tenantMembership.findFirst).mockResolvedValue(membership as never);

    await expect(
      service.updateStatus("tenant-1", "membership-1", { status: "SUSPENDED" }, "user-1", "membership-1")
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.tenantMembership.update).not.toHaveBeenCalled();
  });

  it("blocks employee linkage when another tenant membership already owns the employee", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst).mockResolvedValue({ id: "employee-1" } as never);
    vi.mocked(prisma.tenantMembership.findFirst).mockResolvedValue({
      id: "membership-2",
      user: { email: "existing@example.com" }
    } as never);

    await expect(
      service.inviteUser(
        "tenant-1",
        { email: "new@example.com", roles: ["EMPLOYEE"], employeeId: "employee-1" },
        "admin-user",
        "admin-membership"
      )
    ).rejects.toThrow(BadRequestException);

    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });
});
