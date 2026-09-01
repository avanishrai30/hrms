import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type {
  NotificationDeliveryResult,
  NotificationPayload,
  NotificationProvider
} from "./notification-provider.interface.js";

@Injectable()
export class SmsNotificationProvider implements NotificationProvider {
  readonly channel = "SMS" as const;
  private readonly logger = new Logger(SmsNotificationProvider.name);

  interpolateTemplate(template: string, data: Record<string, unknown> = {}): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  normalizePhoneNumber(phone: string): string {
    // Strip non-digits except leading +
    const cleaned = phone.trim().replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    // Default to India +91 if 10 digits
    if (cleaned.length === 10) return `+91${cleaned}`;
    return `+${cleaned}`;
  }

  async send(payload: NotificationPayload): Promise<NotificationDeliveryResult> {
    const messageId = `sms_${randomUUID()}`;
    const rawPhone = payload.recipientPhone;

    if (!rawPhone) {
      return {
        success: false,
        channel: this.channel,
        error: "Recipient phone number is required for SMS channel"
      };
    }

    try {
      const phone = this.normalizePhoneNumber(rawPhone);
      const text = this.interpolateTemplate(payload.body, payload.data);
      const senderId = payload.branding?.displayName?.slice(0, 6).toUpperCase() || "VCWHMS";

      this.logger.debug(
        `[SmsNotificationProvider] Dispatching SMS ${messageId} to ${phone} (senderId: ${senderId}, length: ${text.length})`
      );

      // In production, integrate with Twilio, AWS SNS, MSG91 or Kaleyra
      return {
        success: true,
        channel: this.channel,
        messageId,
        deliveredAt: new Date(),
        metadata: {
          recipientPhone: phone,
          senderId,
          characterCount: text.length,
          segments: Math.ceil(text.length / 160)
        }
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send SMS ${messageId} to ${rawPhone}: ${errorMsg}`);
      return {
        success: false,
        channel: this.channel,
        messageId,
        error: errorMsg
      };
    }
  }
}
