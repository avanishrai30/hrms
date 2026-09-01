import { Injectable, Logger } from "@nestjs/common";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}

export const EMAIL_PROVIDER = "EMAIL_PROVIDER";

@Injectable()
export class LocalQueueEmailProvider implements EmailProvider {
  private readonly logger = new Logger(LocalQueueEmailProvider.name);

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      this.logger.log(`[PayslipEmail] Queuing payslip email to ${options.to} (${options.subject})`);
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to deliver email";
      this.logger.error(`[PayslipEmail] Failed to send email to ${options.to}: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg
      };
    }
  }
}
