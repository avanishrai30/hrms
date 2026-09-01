/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationService } from "../src/modules/notifications/notification.service.js";

describe("ESS Push Notifications & Alerts (Task 18)", () => {
  let notifService: NotificationService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockPush: any;
  let mockEmail: any;
  let mockSms: any;
  let mockWhatsapp: any;
  let mockInApp: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => {
    mockPrisma = {
      notification: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "notif-1",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        )
      },
      notificationPreference: {
        findUnique: vi.fn().mockResolvedValue({
          userId,
          tenantId,
          channel: "PUSH",
          isEnabled: true
        })
      },
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: userId,
          email: "user@test.com",
          phone: "+919876543210"
        })
      },
      tenantBranding: {
        findUnique: vi.fn().mockResolvedValue({
          displayName: "VC Organics",
          primaryColor: "#1f8f5f"
        })
      }
    };

    mockAudit = { record: vi.fn().mockResolvedValue({ id: "audit-1" }) };
    mockPush = { send: vi.fn().mockResolvedValue({ success: true, messageId: "push-1" }) };
    mockEmail = { send: vi.fn().mockResolvedValue({ success: true, messageId: "email-1" }) };
    mockSms = { send: vi.fn().mockResolvedValue({ success: true, messageId: "sms-1" }) };
    mockWhatsapp = { send: vi.fn().mockResolvedValue({ success: true, messageId: "wa-1" }) };
    mockInApp = { send: vi.fn().mockResolvedValue({ success: true, messageId: "inapp-1" }) };

    notifService = new NotificationService(
      mockPrisma,
      mockAudit,
      mockEmail,
      mockSms,
      mockWhatsapp,
      mockPush,
      mockInApp
    );
  });

  it("sends real-time push notification for important ESS event", async () => {
    const res = await notifService.send(tenantId, {
      recipientUserId: userId,
      channel: "PUSH",
      subject: "Payslip Generated for August 2026",
      body: "Your payslip is now available for download in Employee Self-Service."
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(mockPush.send).toHaveBeenCalled();
  });
});
