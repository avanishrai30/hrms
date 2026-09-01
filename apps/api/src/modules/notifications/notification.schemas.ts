import { z } from "zod";

export const notificationChannelSchema = z.enum(["EMAIL", "SMS", "WHATSAPP", "PUSH", "IN_APP"]);
export const NotificationChannelSchema = notificationChannelSchema;

export const notificationStatusSchema = z.enum(["PENDING", "QUEUED", "SENT", "DELIVERED", "FAILED", "READ"]);
export const NotificationStatusSchema = notificationStatusSchema;

export const sendNotificationSchema = z.object({
  recipientUserId: z.string().uuid(),
  recipientEmployeeId: z.string().uuid().optional(),
  channel: notificationChannelSchema,
  templateCode: z.string().optional(),
  templateId: z.string().uuid().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.unknown()).optional().default({}),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  pushSubscription: z.record(z.unknown()).optional()
});
export const SendNotificationSchema = sendNotificationSchema;

export const createNotificationTemplateSchema = z.object({
  code: z.string().min(2, "Template code must be at least 2 characters"),
  name: z.string().min(2, "Template name must be at least 2 characters"),
  channel: notificationChannelSchema,
  subject: z.string().optional(),
  bodyTemplate: z.string().min(1, "Body template is required"),
  variables: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true)
});
export const CreateNotificationTemplateSchema = createNotificationTemplateSchema;

export const updateNotificationTemplateSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters").optional(),
  subject: z.string().optional(),
  bodyTemplate: z.string().min(1, "Body template must not be empty").optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});
export const UpdateNotificationTemplateSchema = updateNotificationTemplateSchema;

export const notificationPreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      channel: notificationChannelSchema,
      isEnabled: z.boolean()
    })
  )
});
export const NotificationPreferencesSchema = notificationPreferencesSchema;

export const notificationQuerySchema = z.object({
  channel: notificationChannelSchema.optional(),
  status: notificationStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  unreadOnly: z
    .preprocess((val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true" || val === "1";
      }
      return Boolean(val);
    }, z.boolean())
    .optional()
});
export const NotificationQuerySchema = notificationQuerySchema;

export type SendNotificationDto = z.input<typeof sendNotificationSchema>;
export type CreateNotificationTemplateDto = z.input<typeof createNotificationTemplateSchema>;
export type UpdateNotificationTemplateDto = z.input<typeof updateNotificationTemplateSchema>;
export type NotificationPreferencesDto = z.input<typeof notificationPreferencesSchema>;
export type NotificationQueryDto = z.input<typeof notificationQuerySchema>;
