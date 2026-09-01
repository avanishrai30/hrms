import type { NotificationChannel } from "@prisma/client";

export const NOTIFICATION_PROVIDERS = Symbol("NOTIFICATION_PROVIDERS");
export const EMAIL_NOTIFICATION_PROVIDER = Symbol("EMAIL_NOTIFICATION_PROVIDER");
export const SMS_NOTIFICATION_PROVIDER = Symbol("SMS_NOTIFICATION_PROVIDER");
export const WHATSAPP_NOTIFICATION_PROVIDER = Symbol("WHATSAPP_NOTIFICATION_PROVIDER");
export const PUSH_NOTIFICATION_PROVIDER = Symbol("PUSH_NOTIFICATION_PROVIDER");
export const INAPP_NOTIFICATION_PROVIDER = Symbol("INAPP_NOTIFICATION_PROVIDER");

export interface TenantBrandingInfo {
  displayName?: string;
  logoObjectKey?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface NotificationPayload {
  tenantId: string;
  recipientUserId: string;
  recipientEmployeeId?: string | null;
  templateCode?: string | null;
  templateId?: string | null;
  subject?: string | null;
  body: string;
  data?: Record<string, unknown>;
  recipientEmail?: string;
  recipientPhone?: string;
  pushSubscription?: Record<string, unknown>;
  branding?: TenantBrandingInfo;
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationDeliveryResult>;
}
