import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type {
  NotificationDeliveryResult,
  NotificationPayload,
  NotificationProvider
} from "./notification-provider.interface.js";

@Injectable()
export class PushNotificationProvider implements NotificationProvider {
  readonly channel = "PUSH" as const;
  private readonly logger = new Logger(PushNotificationProvider.name);

  interpolateTemplate(template: string, data: Record<string, unknown> = {}): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  async send(payload: NotificationPayload): Promise<NotificationDeliveryResult> {
    const messageId = `push_${randomUUID()}`;

    try {
      const title = payload.subject
        ? this.interpolateTemplate(payload.subject, payload.data)
        : payload.branding?.displayName || "VC-WMS HRMS";
      const body = this.interpolateTemplate(payload.body, payload.data);

      const pushPayload = {
        title,
        body,
        icon: payload.branding?.logoObjectKey ?? "/icon-192.png",
        badge: "/badge-72.png",
        data: {
          ...payload.data,
          tenantId: payload.tenantId,
          recipientUserId: payload.recipientUserId
        },
        tag: payload.templateCode ?? "general-notification"
      };

      this.logger.debug(
        `[PushNotificationProvider] Dispatching Web Push notification ${messageId} to user ${payload.recipientUserId} (title: ${title})`
      );

      // In production, sign using web-push / VAPID keys and POST to payload.pushSubscription.endpoint
      return {
        success: true,
        channel: this.channel,
        messageId,
        deliveredAt: new Date(),
        metadata: {
          pushPayload,
          hasSubscription: Boolean(payload.pushSubscription)
        }
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send Push notification ${messageId} to ${payload.recipientUserId}: ${errorMsg}`);
      return {
        success: false,
        channel: this.channel,
        messageId,
        error: errorMsg
      };
    }
  }
}
