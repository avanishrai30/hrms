/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnnouncementService } from "../src/modules/ess/services/announcement.service.js";

describe("Announcement Service (Task 18)", () => {
  let annService: AnnouncementService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockNotif: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const employeeId = "22222222-2222-2222-2222-222222222222";
  const authorUserId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockPrisma = {
      tenantMembership: {
        findMany: vi.fn().mockResolvedValue([{ userId: authorUserId }])
      },
      announcement: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "ann-1",
            ...data,
            author: { email: "hr@test.com" },
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "ann-1",
            tenantId,
            title: "Annual Town Hall 2026",
            content: "Join us for company-wide update.",
            priority: "HIGH",
            isPinned: true,
            publishedAt: new Date(),
            expiresAt: null,
            attachments: [],
            createdBy: authorUserId,
            author: { email: "hr@test.com" },
            acknowledgements: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: "ann-1",
          tenantId,
          title: "Annual Town Hall 2026",
          content: "Join us for company-wide update.",
          priority: "HIGH",
          isPinned: true,
          publishedAt: new Date(),
          expiresAt: null,
          attachments: [],
          createdBy: authorUserId,
          author: { email: "hr@test.com" },
          acknowledgements: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        delete: vi.fn().mockResolvedValue({ id: "ann-1" })
      },
      acknowledgement: {
        upsert: vi.fn().mockResolvedValue({
          id: "ack-1",
          tenantId,
          announcementId: "ann-1",
          employeeId,
          acknowledgedAt: new Date()
        })
      }
    };

    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    mockNotif = {
      send: vi.fn().mockResolvedValue({ success: true })
    };

    annService = new AnnouncementService(mockPrisma, mockAudit, mockNotif);
  });

  it("creates a priority announcement and dispatches notifications across channels", async () => {
    const dto = {
      title: "New Health Insurance Policy 2026",
      content: "Please review and acknowledge the updated medical benefits.",
      priority: "HIGH" as const,
      isPinned: true,
      notifyChannels: ["IN_APP", "PUSH"] as Array<"IN_APP" | "PUSH">
    };

    const res = await annService.createAnnouncement(tenantId, dto, authorUserId);

    expect(res).toBeDefined();
    expect(res.title).toBe("New Health Insurance Policy 2026");
    expect(mockPrisma.announcement.create).toHaveBeenCalled();
    expect(mockNotif.send).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "announcements.created",
        resourceType: "announcement"
      })
    );
  });

  it("records employee acknowledgement of company communication", async () => {
    const ack = await annService.acknowledgeAnnouncement(tenantId, "ann-1", employeeId);

    expect(ack.success).toBe(true);
    expect(mockPrisma.acknowledgement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_announcementId_employeeId: {
            tenantId,
            announcementId: "ann-1",
            employeeId
          }
        }
      })
    );
  });
});
