import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type {
  NotificationDeliveryResult,
  NotificationPayload,
  NotificationProvider
} from "./notification-provider.interface.js";

@Injectable()
export class WhatsAppNotificationProvider implements NotificationProvider {
  readonly channel = "WHATSAPP" as const;
  private readonly logger = new Logger(WhatsAppNotificationProvider.name);

  interpolateTemplate(template: string, data: Record<string, unknown> = {}): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  normalizePhoneNumber(phone: string): string {
    const cleaned = phone.trim().replace(/[^\d]/g, "");
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
  }

  async send(payload: NotificationPayload): Promise<NotificationDeliveryResult> {
    const messageId = `wa_${randomUUID()}`;
    const rawPhone = payload.recipientPhone;

    if (!rawPhone) {
      return {
        success: false,
        channel: this.channel,
        error: "Recipient phone number is required for WHATSAPP channel"
      };
    }

    try {
      const phone = this.normalizePhoneNumber(rawPhone);
      const messageBody = this.interpolateTemplate(payload.body, payload.data);

      this.logger.debug(
        `[WhatsAppNotificationProvider] Dispatching WhatsApp message ${messageId} to ${phone} (template: ${payload.templateCode ?? "custom"}, length: ${messageBody.length})`
      );

      // In production, integrate with Meta Cloud API / Gupshup / Twilio WhatsApp API
      return {
        success: true,
        channel: this.channel,
        messageId,
        deliveredAt: new Date(),
        metadata: {
          recipientPhone: phone,
          templateCode: payload.templateCode,
          bodyLength: messageBody.length,
          interactive: Boolean(payload.data?.buttons || payload.data?.actions)
        }
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send WhatsApp message ${messageId} to ${rawPhone}: ${errorMsg}`);
      return {
        success: false,
        channel: this.channel,
        messageId,
        error: errorMsg
      };
    }
  }
}
