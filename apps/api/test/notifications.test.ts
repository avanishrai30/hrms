import { collectPermissions, hasPermission } from "@vc-wms/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNotificationTemplateSchema,
  notificationPreferencesSchema,
  notificationQuerySchema,
  sendNotificationSchema,
  updateNotificationTemplateSchema
} from "../src/modules/notifications/notification.schemas.js";
import { NotificationService } from "../src/modules/notifications/notification.service.js";
import { EmailNotificationProvider } from "../src/modules/notifications/providers/email.provider.js";
import { InAppNotificationProvider } from "../src/modules/notifications/providers/inapp.provider.js";
import { PushNotificationProvider } from "../src/modules/notifications/providers/push.provider.js";
import { SmsNotificationProvider } from "../src/modules/notifications/providers/sms.provider.js";
import { WhatsAppNotificationProvider } from "../src/modules/notifications/providers/whatsapp.provider.js";

describe("Sprint 3: Notification Module Tests", () => {
  describe("Notification Schemas Validation", () => {
    it("validates sendNotificationSchema correctly", () => {
      const valid = {
        recipientUserId: "11111111-1111-1111-1111-111111111111",
        channel: "EMAIL",
        subject: "Welcome!",
        body: "Hello {{name}}",
        data: { name: "John" },
        recipientEmail: "john@example.com"
      };
      const parsed = sendNotificationSchema.safeParse(valid);
      expect(parsed.success).toBe(true);

      const invalidChannel = {
        ...valid,
        channel: "INVALID_CHANNEL"
      };
      expect(sendNotificationSchema.safeParse(invalidChannel).success).toBe(false);

      const invalidUserId = {
        ...valid,
        recipientUserId: "not-a-uuid"
      };
      expect(sendNotificationSchema.safeParse(invalidUserId).success).toBe(false);
    });

    it("validates createNotificationTemplateSchema and updateNotificationTemplateSchema", () => {
      const validCreate = {
        code: "WELCOME_EMAIL",
        name: "Welcome Email",
        channel: "EMAIL",
        subject: "Welcome to {{company}}",
        bodyTemplate: "<p>Welcome {{name}} to our platform!</p>",
        variables: ["company", "name"]
      };
      expect(createNotificationTemplateSchema.safeParse(validCreate).success).toBe(true);

      const invalidCreate = {
        code: "W", // Too short
        name: "W",
        channel: "EMAIL",
        bodyTemplate: ""
      };
      expect(createNotificationTemplateSchema.safeParse(invalidCreate).success).toBe(false);

      const validUpdate = {
        name: "Updated Welcome Email",
        isActive: false
      };
      expect(updateNotificationTemplateSchema.safeParse(validUpdate).success).toBe(true);
    });

    it("validates notificationPreferencesSchema and notificationQuerySchema", () => {
      const validPref = {
        preferences: [
          { channel: "EMAIL", isEnabled: true },
          { channel: "SMS", isEnabled: false }
        ]
      };
      expect(notificationPreferencesSchema.safeParse(validPref).success).toBe(true);

      const validQuery = {
        channel: "IN_APP",
        page: "2",
        limit: "10",
        unreadOnly: "true"
      };
      const parsedQuery = notificationQuerySchema.parse(validQuery);
      expect(parsedQuery.page).toBe(2);
      expect(parsedQuery.limit).toBe(10);
      expect(parsedQuery.unreadOnly).toBe(true);
    });
  });

  describe("Notification Providers", () => {
    it("EmailNotificationProvider renders HTML with tenant branding and variable interpolation", async () => {
      const provider = new EmailNotificationProvider();
      const payload = {
        tenantId: "t-1",
        recipientUserId: "u-1",
        recipientEmail: "test@example.com",
        subject: "Hello {{name}}",
        body: "Your balance is {{balance}} USD",
        data: { name: "Alice", balance: "100" },
        branding: {
          displayName: "Acme Corp",
          primaryColor: "#ff0000"
        }
      };

      const html = provider.renderHtml(payload);
      expect(html).toContain("Acme Corp");
      expect(html).toContain("#ff0000");
      expect(html).toContain("Your balance is 100 USD");

      const result = await provider.send(payload);
      expect(result.success).toBe(true);
      expect(result.channel).toBe("EMAIL");
      expect(result.messageId).toBeDefined();
    });

    it("EmailNotificationProvider fails gracefully when recipient email is missing", async () => {
      const provider = new EmailNotificationProvider();
      const result = await provider.send({
        tenantId: "t-1",
        recipientUserId: "u-1",
        body: "Test"
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Recipient email address is required");
    });

    it("SmsNotificationProvider formats phone number and dispatches SMS", async () => {
      const provider = new SmsNotificationProvider();
      expect(provider.normalizePhoneNumber("9876543210")).toBe("+919876543210");
      expect(provider.normalizePhoneNumber("+1 (555) 123-4567")).toBe("+15551234567");

      const result = await provider.send({
        tenantId: "t-1",
        recipientUserId: "u-1",
        recipientPhone: "9876543210",
        body: "OTP is {{otp}}",
        data: { otp: "123456" }
      });
      expect(result.success).toBe(true);
      expect(result.channel).toBe("SMS");
      expect(result.metadata?.recipientPhone).toBe("+919876543210");
    });

    it("WhatsAppNotificationProvider formats payload and sends WhatsApp message", async () => {
      const provider = new WhatsAppNotificationProvider();
      const result = await provider.send({
        tenantId: "t-1",
        recipientUserId: "u-1",
        recipientPhone: "+91 9876543210",
        body: "Your payslip for {{month}} is ready",
        data: { month: "August 2026" }
      });
      expect(result.success).toBe(true);
      expect(result.channel).toBe("WHATSAPP");
      expect(result.messageId).toBeDefined();
    });

    it("PushNotificationProvider builds Web Push payload with branding", async () => {
      const provider = new PushNotificationProvider();
      const result = await provider.send({
        tenantId: "t-1",
        recipientUserId: "u-1",
        subject: "Shift Reminder",
        body: "Your shift starts in 30 mins",
        branding: { displayName: "Acme", logoObjectKey: "/logo.png" }
      });
      expect(result.success).toBe(true);
      expect(result.channel).toBe("PUSH");
      const pushPayload = result.metadata?.pushPayload as Record<string, unknown> | undefined;
      expect(pushPayload?.title).toBe("Shift Reminder");
    });

    it("InAppNotificationProvider creates notification record in database", async () => {
      const mockPrisma = {
        notification: {
          create: vi.fn().mockResolvedValue({
            id: "notif-123",
            deliveredAt: new Date()
          })
        }
      };
      const provider = new InAppNotificationProvider(mockPrisma as never);
      const result = await provider.send({
        tenantId: "t-1",
        recipientUserId: "u-1",
        subject: "Notice",
        body: "Welcome to the portal"
      });
      expect(result.success).toBe(true);
      expect(result.channel).toBe("IN_APP");
      expect(result.messageId).toBe("notif-123");
      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });
  });

  describe("NotificationService", () => {
    let mockPrisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;
    let mockAudit: { record: ReturnType<typeof vi.fn> };
    let service: NotificationService;

    beforeEach(() => {
      mockPrisma = {
        notificationPreference: {
          findUnique: vi.fn().mockResolvedValue(null),
          findMany: vi.fn().mockResolvedValue([]),
          upsert: vi.fn().mockImplementation(({ create }) => Promise.resolve({ id: "pref-1", ...create }))
        },
        notificationTemplate: {
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue(null),
          findMany: vi.fn().mockResolvedValue([]),
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "tpl-1", ...data })),
          update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "tpl-1", ...data }))
        },
        tenantBranding: {
          findUnique: vi.fn().mockResolvedValue({
            displayName: "Test Tenant",
            primaryColor: "#0055ff"
          })
        },
        user: {
          findFirst: vi.fn().mockResolvedValue({
            email: "user@test.com",
            phone: "9876543210"
          })
        },
        notification: {
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "notif-db-1", ...data })),
          findMany: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
          findFirst: vi.fn().mockResolvedValue({ id: "n-1", status: "DELIVERED", readAt: null }),
          update: vi.fn().mockResolvedValue({ id: "n-1", status: "READ", readAt: new Date() }),
          updateMany: vi.fn().mockResolvedValue({ count: 5 })
        }
      };

      mockAudit = {
        record: vi.fn().mockResolvedValue({})
      };

      const email = new EmailNotificationProvider();
      const sms = new SmsNotificationProvider();
      const wa = new WhatsAppNotificationProvider();
      const push = new PushNotificationProvider();
      const inApp = new InAppNotificationProvider(mockPrisma as never);

      service = new NotificationService(
        mockPrisma as never,
        mockAudit as never,
        email,
        sms,
        wa,
        push,
        inApp
      );
    });

    it("respects user preferences and skips sending if channel is disabled", async () => {
      mockPrisma.notificationPreference.findUnique.mockResolvedValueOnce({
        isEnabled: false
      });

      const res = await service.send("tenant-1", {
        recipientUserId: "u-1",
        channel: "EMAIL",
        body: "Hello",
        data: {}
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("User has disabled notifications for EMAIL");
    });

    it("sends email notification and creates db record and audit log", async () => {
      const res = await service.send("tenant-1", {
        recipientUserId: "u-1",
        channel: "EMAIL",
        subject: "Invoice #{{invoiceId}}",
        body: "Amount: {{amount}}",
        data: { invoiceId: "101", amount: "$50" }
      });

      expect(res.success).toBe(true);
      expect(res.notificationId).toBe("notif-db-1");
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-1",
          action: "notification.send",
          resourceType: "Notification"
        })
      );
    });

    it("uses notification template when templateCode is provided", async () => {
      mockPrisma.notificationTemplate.findFirst.mockResolvedValueOnce({
        id: "tpl-123",
        code: "LEAVE_APPROVED",
        subject: "Leave Request Approved",
        bodyTemplate: "Your leave for {{days}} days has been approved."
      });

      const res = await service.send("tenant-1", {
        recipientUserId: "u-1",
        channel: "EMAIL",
        templateCode: "LEAVE_APPROVED",
        data: { days: 3 }
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.notificationTemplate.findFirst).toHaveBeenCalled();
    });

    it("sendBulk sends multiple notifications in batch", async () => {
      const res = await service.sendBulk("tenant-1", [
        { recipientUserId: "u-1", channel: "EMAIL", body: "Msg 1", data: {} },
        { recipientUserId: "u-2", channel: "SMS", body: "Msg 2", data: {} }
      ]);

      expect(res.length).toBe(2);
      expect(res[0]!.success).toBe(true);
      expect(res[1]!.success).toBe(true);
    });

    it("getUnreadCount returns unread count for in-app notifications", async () => {
      mockPrisma.notification.count.mockResolvedValueOnce(7);
      const res = await service.getUnreadCount("tenant-1", "user-1");
      expect(res.unreadCount).toBe(7);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: {
          tenantId: "tenant-1",
          recipientUserId: "user-1",
          channel: "IN_APP",
          readAt: null
        }
      });
    });

    it("markAsRead updates notification status and records audit", async () => {
      const res = await service.markAsRead("tenant-1", "notif-1", "user-1");
      expect(res.status).toBe("READ");
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-1",
          action: "notification.mark_read"
        })
      );
    });

    it("markAllAsRead marks all unread notifications as read and records audit", async () => {
      const res = await service.markAllAsRead("tenant-1", "user-1");
      expect(res.updatedCount).toBe(5);
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-1",
          action: "notification.mark_all_read"
        })
      );
    });

    it("createTemplate creates template and prevents duplicates", async () => {
      mockPrisma.notificationTemplate.findUnique.mockResolvedValueOnce(null);
      const template = await service.createTemplate("tenant-1", {
        code: "PAYROLL_PROCESSED",
        name: "Payroll Processed",
        isActive: true,
        channel: "EMAIL",
        subject: "Payslip Ready",
        bodyTemplate: "Your payslip is ready.",
        variables: ["month"]
      });
      expect(template.code).toBe("PAYROLL_PROCESSED");
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-1",
          action: "notification_template.create"
        })
      );

      // Duplicate detection
      mockPrisma.notificationTemplate.findUnique.mockResolvedValueOnce({ id: "tpl-existing" });
      await expect(
        service.createTemplate("tenant-1", {
          code: "PAYROLL_PROCESSED",
          name: "Payroll Processed",
          isActive: true,
          channel: "EMAIL",
          bodyTemplate: "Test",
          variables: []
        })
      ).rejects.toThrow();
    });

    it("getPreferences returns all channels with defaults and updates preferences", async () => {
      const prefs = await service.getPreferences("tenant-1", "user-1");
      expect(prefs.length).toBe(5);
      expect(prefs.every((p) => p.isEnabled)).toBe(true);

      const updated = await service.updatePreferences("tenant-1", "user-1", {
        preferences: [
          { channel: "EMAIL", isEnabled: true },
          { channel: "SMS", isEnabled: false }
        ]
      });
      expect(updated.length).toBe(2);
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-1",
          action: "notification_preferences.update"
        })
      );
    });
  });

  describe("Notification RBAC Permissions", () => {
    it("grants full notification permissions to TENANT_OWNER, TENANT_ADMIN, and HR_ADMIN", () => {
      const roles = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN"] as const;
      for (const role of roles) {
        const perms = collectPermissions([role]);
        expect(hasPermission(perms, "notifications.view")).toBe(true);
        expect(hasPermission(perms, "notifications.send")).toBe(true);
        expect(hasPermission(perms, "notifications.manage")).toBe(true);
      }
    });

    it("grants only view permissions to MANAGER and EMPLOYEE", () => {
      for (const role of ["MANAGER", "EMPLOYEE"] as const) {
        const perms = collectPermissions([role]);
        expect(hasPermission(perms, "notifications.view")).toBe(true);
        expect(hasPermission(perms, "notifications.send")).toBe(false);
        expect(hasPermission(perms, "notifications.manage")).toBe(false);
      }
    });
  });
});
