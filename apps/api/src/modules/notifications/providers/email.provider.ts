import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type {
  NotificationDeliveryResult,
  NotificationPayload,
  NotificationProvider
} from "./notification-provider.interface.js";

@Injectable()
export class EmailNotificationProvider implements NotificationProvider {
  readonly channel = "EMAIL" as const;
  private readonly logger = new Logger(EmailNotificationProvider.name);

  interpolateTemplate(template: string, data: Record<string, unknown> = {}): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  renderHtml(payload: NotificationPayload): string {
    const branding = payload.branding ?? {};
    const appName = branding.displayName || "VC-WMS HRMS";
    const primaryColor = branding.primaryColor || "#1f8f5f";
    const renderedBody = this.interpolateTemplate(payload.body, payload.data);
    const subject = payload.subject ? this.interpolateTemplate(payload.subject, payload.data) : "Notification";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background-color: ${primaryColor}; color: #ffffff; padding: 20px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; line-height: 1.6; font-size: 15px; color: #334155; }
    .footer { padding: 16px 24px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtml(appName)}</h1>
    </div>
    <div class="content">
      ${renderedBody}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(appName)}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async send(payload: NotificationPayload): Promise<NotificationDeliveryResult> {
    const messageId = `email_${randomUUID()}`;
    const recipient = payload.recipientEmail;

    if (!recipient) {
      return {
        success: false,
        channel: this.channel,
        error: "Recipient email address is required for EMAIL channel"
      };
    }

    try {
      const subject = payload.subject ? this.interpolateTemplate(payload.subject, payload.data) : "Notification";
      const html = this.renderHtml(payload);
      const text = this.interpolateTemplate(payload.body, payload.data);

      this.logger.debug(
        `[EmailNotificationProvider] Sending email ${messageId} to ${recipient} (subject: ${subject})`
      );

      // In SaaS production, this connects to SMTP / AWS SES / SendGrid / Postmark
      return {
        success: true,
        channel: this.channel,
        messageId,
        deliveredAt: new Date(),
        metadata: {
          recipient,
          subject,
          textLength: text.length,
          htmlLength: html.length
        }
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email ${messageId} to ${recipient}: ${errorMsg}`);
      return {
        success: false,
        channel: this.channel,
        messageId,
        error: errorMsg
      };
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
