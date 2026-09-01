import { Injectable, Logger } from "@nestjs/common";
import { type Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service.js";
import type {
  NotificationDeliveryResult,
  NotificationPayload,
  NotificationProvider
} from "./notification-provider.interface.js";

@Injectable()
export class InAppNotificationProvider implements NotificationProvider {
  readonly channel = "IN_APP" as const;
  private readonly logger = new Logger(InAppNotificationProvider.name);

  constructor(private readonly prisma: PrismaService) {}

  interpolateTemplate(template: string, data: Record<string, unknown> = {}): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  async send(payload: NotificationPayload): Promise<NotificationDeliveryResult> {
    try {
      const subject = payload.subject ? this.interpolateTemplate(payload.subject, payload.data) : null;
      const body = this.interpolateTemplate(payload.body, payload.data);

      const record = await this.prisma.notification.create({
        data: {
          tenantId: payload.tenantId,
          recipientUserId: payload.recipientUserId,
          recipientEmployeeId: payload.recipientEmployeeId,
          channel: this.channel,
          templateCode: payload.templateCode,
          templateId: payload.templateId,
          subject,
          body,
          data: (payload.data ?? {}) as Prisma.InputJsonValue,
          status: "DELIVERED",
          sentAt: new Date(),
          deliveredAt: new Date()
        }
      });

      this.logger.debug(
        `[InAppNotificationProvider] Created in-app notification ${record.id} for user ${payload.recipientUserId}`
      );

      return {
        success: true,
        channel: this.channel,
        messageId: record.id,
        deliveredAt: record.deliveredAt ?? new Date(),
        metadata: {
          notificationId: record.id
        }
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to create in-app notification: ${errorMsg}`);
      return {
        success: false,
        channel: this.channel,
        error: errorMsg
      };
    }
  }
}
