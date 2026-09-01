import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { NotificationController } from "./notification.controller.js";
import { NotificationService } from "./notification.service.js";
import { EmailNotificationProvider } from "./providers/email.provider.js";
import { InAppNotificationProvider } from "./providers/inapp.provider.js";
import {
  EMAIL_NOTIFICATION_PROVIDER,
  INAPP_NOTIFICATION_PROVIDER,
  PUSH_NOTIFICATION_PROVIDER,
  SMS_NOTIFICATION_PROVIDER,
  WHATSAPP_NOTIFICATION_PROVIDER
} from "./providers/notification-provider.interface.js";
import { PushNotificationProvider } from "./providers/push.provider.js";
import { SmsNotificationProvider } from "./providers/sms.provider.js";
import { WhatsAppNotificationProvider } from "./providers/whatsapp.provider.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailNotificationProvider,
    SmsNotificationProvider,
    WhatsAppNotificationProvider,
    PushNotificationProvider,
    InAppNotificationProvider,
    {
      provide: EMAIL_NOTIFICATION_PROVIDER,
      useExisting: EmailNotificationProvider
    },
    {
      provide: SMS_NOTIFICATION_PROVIDER,
      useExisting: SmsNotificationProvider
    },
    {
      provide: WHATSAPP_NOTIFICATION_PROVIDER,
      useExisting: WhatsAppNotificationProvider
    },
    {
      provide: PUSH_NOTIFICATION_PROVIDER,
      useExisting: PushNotificationProvider
    },
    {
      provide: INAPP_NOTIFICATION_PROVIDER,
      useExisting: InAppNotificationProvider
    }
  ],
  exports: [
    NotificationService,
    EmailNotificationProvider,
    SmsNotificationProvider,
    WhatsAppNotificationProvider,
    PushNotificationProvider,
    InAppNotificationProvider,
    EMAIL_NOTIFICATION_PROVIDER,
    SMS_NOTIFICATION_PROVIDER,
    WHATSAPP_NOTIFICATION_PROVIDER,
    PUSH_NOTIFICATION_PROVIDER,
    INAPP_NOTIFICATION_PROVIDER
  ]
})
export class NotificationModule {}
