import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { HelpdeskService } from "./helpdesk.service.js";

function createService(prismaOverrides: Record<string, unknown> = {}) {
  const prisma = {
    asset: { findFirst: vi.fn() },
    employee: { findFirst: vi.fn() },
    tenantMembership: { findFirst: vi.fn() },
    ticket: { count: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    ticketComment: { create: vi.fn() },
    ...prismaOverrides
  };
  const auditService = { record: vi.fn() };
  return { service: new HelpdeskService(prisma as never, auditService as never), prisma, auditService };
}

describe("HelpdeskService tenant isolation", () => {
  it("rejects tickets assigned to employees outside the active tenant", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.employee.findFirst)
      .mockResolvedValueOnce({ id: "employee-1" } as never)
      .mockResolvedValueOnce(null as never);

    await expect(
      service.createTicket(
        "tenant-a",
        { userId: "user-1", membershipId: "membership-1" },
        "employee-1",
        {
          title: "Badge issue",
          description: "Access badge is not opening the door.",
          category: "FACILITIES",
          priority: "MEDIUM",
          source: "PORTAL",
          assigneeId: "employee-from-tenant-b",
          tags: []
        }
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.ticket.create).not.toHaveBeenCalled();
  });

  it("rejects comments from authors outside the active tenant", async () => {
    const { service, prisma } = createService();
    vi.mocked(prisma.ticket.findFirst).mockResolvedValue({
      id: "ticket-1",
      firstRespondedAt: null,
      resolutionDueAt: new Date()
    } as never);
    vi.mocked(prisma.employee.findFirst).mockResolvedValue(null as never);

    await expect(
      service.addComment(
        "tenant-a",
        { userId: "user-1", membershipId: "membership-1" },
        "employee-from-tenant-b",
        "ticket-1",
        { message: "Checking this now.", isInternal: false }
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.ticketComment.create).not.toHaveBeenCalled();
  });
});
