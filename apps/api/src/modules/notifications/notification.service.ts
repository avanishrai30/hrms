import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { type NotificationChannel, type Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateNotificationTemplateDto,
  NotificationPreferencesDto,
  NotificationQueryDto,
  SendNotificationDto,
  UpdateNotificationTemplateDto
} from "./notification.schemas.js";
import { EmailNotificationProvider } from "./providers/email.provider.js";
import { InAppNotificationProvider } from "./providers/inapp.provider.js";
import type {
  NotificationDeliveryResult,
  NotificationPayload,
  NotificationProvider
} from "./providers/notification-provider.interface.js";
import { PushNotificationProvider } from "./providers/push.provider.js";
import { SmsNotificationProvider } from "./providers/sms.provider.js";
import { WhatsAppNotificationProvider } from "./providers/whatsapp.provider.js";

const ALL_CHANNELS: NotificationChannel[] = ["EMAIL", "SMS", "WHATSAPP", "PUSH", "IN_APP"];

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly providers: Map<NotificationChannel, NotificationProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly smsProvider: SmsNotificationProvider,
    private readonly whatsAppProvider: WhatsAppNotificationProvider,
    private readonly pushProvider: PushNotificationProvider,
    private readonly inAppProvider: InAppNotificationProvider
  ) {
    this.providers = new Map<NotificationChannel, NotificationProvider>([
      ["EMAIL", this.emailProvider],
      ["SMS", this.smsProvider],
      ["WHATSAPP", this.whatsAppProvider],
      ["PUSH", this.pushProvider],
      ["IN_APP", this.inAppProvider]
    ]);
  }

  async send(
    tenantId: string,
    input: SendNotificationDto,
    actorUserId?: string,
    actorMembershipId?: string
  ): Promise<NotificationDeliveryResult & { notificationId?: string }> {
    // 1. Check user preferences for this channel
    const pref = await this.prisma.notificationPreference.findUnique({
      where: {
        tenantId_userId_channel: {
          tenantId,
          userId: input.recipientUserId,
          channel: input.channel
        }
      }
    });

    if (pref && !pref.isEnabled) {
      return {
        success: false,
        channel: input.channel,
        error: `User has disabled notifications for ${input.channel} channel`
      };
    }

    // 2. Resolve template if specified
    let subject = input.subject;
    let body = input.body;
    let templateId = input.templateId;
    let templateCode = input.templateCode;

    if (templateCode || templateId) {
      const template = await this.prisma.notificationTemplate.findFirst({
        where: {
          tenantId,
          isActive: true,
          ...(templateId ? { id: templateId } : {}),
          ...(templateCode ? { code: templateCode, channel: input.channel } : {})
        }
      });

      if (template) {
        templateId = template.id;
        templateCode = template.code;
        if (!body) body = template.bodyTemplate;
        if (!subject && template.subject) subject = template.subject;
      }
    }

    if (!body) {
      throw new BadRequestException("Notification body or valid template is required");
    }

    // 3. Fetch recipient contact details if not provided
    let recipientEmail = input.recipientEmail;
    let recipientPhone = input.recipientPhone;

    if (!recipientEmail || !recipientPhone) {
      const user = await this.prisma.user.findFirst({
        where: { id: input.recipientUserId },
        select: { email: true, phone: true }
      });
      if (user) {
        if (!recipientEmail) recipientEmail = user.email;
        if (!recipientPhone && user.phone) recipientPhone = user.phone;
      }
    }

    // 4. Fetch tenant branding
    const branding = await this.prisma.tenantBranding.findUnique({
      where: { tenantId }
    });

    const payload: NotificationPayload = {
      tenantId,
      recipientUserId: input.recipientUserId,
      recipientEmployeeId: input.recipientEmployeeId,
      templateCode,
      templateId,
      subject,
      body,
      data: input.data ?? {},
      recipientEmail,
      recipientPhone,
      pushSubscription: input.pushSubscription,
      branding: branding
        ? {
            displayName: branding.displayName,
            logoObjectKey: branding.logoObjectKey,
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            accentColor: branding.accentColor
          }
        : undefined
    };

    // 5. Dispatch via appropriate provider
    const provider = this.providers.get(input.channel);
    if (!provider) {
      throw new BadRequestException(`Unsupported notification channel: ${input.channel}`);
    }

    let result: NotificationDeliveryResult;
    let notificationId: string | undefined;

    if (input.channel === "IN_APP") {
      result = await this.inAppProvider.send(payload);
      notificationId = result.messageId;
    } else {
      result = await provider.send(payload);

      // Create notification log in database for external channels
      const dbNotification = await this.prisma.notification.create({
        data: {
          tenantId,
          recipientUserId: input.recipientUserId,
          recipientEmployeeId: input.recipientEmployeeId,
          channel: input.channel,
          templateCode,
          templateId,
          subject,
          body,
          data: (input.data ?? {}) as Prisma.InputJsonValue,
          status: result.success ? "DELIVERED" : "FAILED",
          sentAt: result.success ? new Date() : null,
          deliveredAt: result.deliveredAt ?? null,
          failureReason: result.error ?? null
        }
      });
      notificationId = dbNotification.id;
    }

    // 6. Record audit log
    await this.auditService.record({
      tenantId,
      actorUserId: actorUserId ?? input.recipientUserId,
      actorMembershipId,
      action: "notification.send",
      resourceType: "Notification",
      resourceId: notificationId,
      after: {
        channel: input.channel,
        recipientUserId: input.recipientUserId,
        status: result.success ? "DELIVERED" : "FAILED",
        templateCode
      },
      metadata: {
        channel: input.channel,
        success: result.success,
        error: result.error
      }
    });

    return {
      ...result,
      notificationId
    };
  }

  async sendBulk(
    tenantId: string,
    inputs: SendNotificationDto[],
    actorUserId?: string,
    actorMembershipId?: string
  ): Promise<Array<NotificationDeliveryResult & { notificationId?: string }>> {
    const results: Array<NotificationDeliveryResult & { notificationId?: string }> = [];
    for (const input of inputs) {
      try {
        const res = await this.send(tenantId, input, actorUserId, actorMembershipId);
        results.push(res);
      } catch (err) {
        results.push({
          success: false,
          channel: input.channel,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
    return results;
  }

  async getInAppNotifications(tenantId: string, userId: string, query: NotificationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      tenantId,
      recipientUserId: userId,
      channel: query.channel ?? "IN_APP",
      ...(query.unreadOnly ? { readAt: null } : {}),
      ...(query.status ? { status: query.status } : {})
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          template: {
            select: {
              code: true,
              name: true
            }
          }
        }
      }),
      this.prisma.notification.count({ where })
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.prisma.notification.count({
      where: {
        tenantId,
        recipientUserId: userId,
        channel: "IN_APP",
        readAt: null
      }
    });

    return { unreadCount };
  }

  async markAsRead(
    tenantId: string,
    notificationId: string,
    userId: string,
    actorMembershipId?: string
  ) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        tenantId,
        recipientUserId: userId
      }
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        readAt: new Date(),
        status: "READ"
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId,
      action: "notification.mark_read",
      resourceType: "Notification",
      resourceId: notificationId,
      before: { status: notification.status, readAt: notification.readAt },
      after: { status: updated.status, readAt: updated.readAt }
    });

    return updated;
  }

  async markAllAsRead(tenantId: string, userId: string, actorMembershipId?: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        tenantId,
        recipientUserId: userId,
        channel: "IN_APP",
        readAt: null
      },
      data: {
        readAt: new Date(),
        status: "READ"
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId,
      action: "notification.mark_all_read",
      resourceType: "Notification",
      metadata: { count: result.count }
    });

    return { updatedCount: result.count };
  }

  async listTemplates(tenantId: string) {
    return this.prisma.notificationTemplate.findMany({
      where: { tenantId },
      orderBy: [{ channel: "asc" }, { code: "asc" }]
    });
  }

  async createTemplate(
    tenantId: string,
    input: CreateNotificationTemplateDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.notificationTemplate.findUnique({
      where: {
        tenantId_code_channel: {
          tenantId,
          code: input.code,
          channel: input.channel
        }
      }
    });

    if (existing) {
      throw new BadRequestException(
        `Template with code '${input.code}' already exists for channel '${input.channel}'`
      );
    }

    const template = await this.prisma.notificationTemplate.create({
      data: {
        tenantId,
        code: input.code,
        name: input.name,
        channel: input.channel,
        subject: input.subject,
        bodyTemplate: input.bodyTemplate,
        variables: (input.variables ?? []) as Prisma.InputJsonValue,
        isActive: input.isActive ?? true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "notification_template.create",
      resourceType: "NotificationTemplate",
      resourceId: template.id,
      after: {
        code: template.code,
        channel: template.channel,
        name: template.name
      }
    });

    return template;
  }

  async updateTemplate(
    tenantId: string,
    id: string,
    input: UpdateNotificationTemplateDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { id, tenantId }
    });

    if (!template) {
      throw new NotFoundException("Notification template not found");
    }

    const updated = await this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.subject !== undefined ? { subject: input.subject } : {}),
        ...(input.bodyTemplate !== undefined ? { bodyTemplate: input.bodyTemplate } : {}),
        ...(input.variables !== undefined ? { variables: input.variables as Prisma.InputJsonValue } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "notification_template.update",
      resourceType: "NotificationTemplate",
      resourceId: updated.id,
      before: {
        name: template.name,
        subject: template.subject,
        bodyTemplate: template.bodyTemplate,
        isActive: template.isActive
      },
      after: {
        name: updated.name,
        subject: updated.subject,
        bodyTemplate: updated.bodyTemplate,
        isActive: updated.isActive
      }
    });

    return updated;
  }

  async getPreferences(tenantId: string, userId: string) {
    const stored = await this.prisma.notificationPreference.findMany({
      where: { tenantId, userId }
    });

    const storedMap = new Map<NotificationChannel, boolean>(
      stored.map((p) => [p.channel, p.isEnabled])
    );

    return ALL_CHANNELS.map((channel) => ({
      channel,
      isEnabled: storedMap.has(channel) ? (storedMap.get(channel) as boolean) : true
    }));
  }

  async updatePreferences(
    tenantId: string,
    userId: string,
    input: NotificationPreferencesDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.prisma.notificationPreference.findMany({
      where: { tenantId, userId }
    });

    const results = await Promise.all(
      input.preferences.map((p) =>
        this.prisma.notificationPreference.upsert({
          where: {
            tenantId_userId_channel: {
              tenantId,
              userId,
              channel: p.channel
            }
          },
          create: {
            tenantId,
            userId,
            channel: p.channel,
            isEnabled: p.isEnabled
          },
          update: {
            isEnabled: p.isEnabled
          }
        })
      )
    );

    await this.auditService.record({
      tenantId,
      actorUserId: actorUserId ?? userId,
      actorMembershipId,
      action: "notification_preferences.update",
      resourceType: "NotificationPreference",
      before: { preferences: before as unknown as Prisma.InputJsonValue },
      after: { preferences: results as unknown as Prisma.InputJsonValue }
    });

    return results;
  }
}
