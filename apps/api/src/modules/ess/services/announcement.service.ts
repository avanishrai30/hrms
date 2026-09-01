import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { AuditService } from "../../audit/audit.service.js";
import { NotificationService } from "../../notifications/notification.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type {
  AnnouncementFilterDto,
  CreateAnnouncementDto
} from "../ess.schemas.js";

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService
  ) {}

  async listAnnouncements(tenantId: string, employeeId?: string, filter?: AnnouncementFilterDto) {
    const where: Prisma.AnnouncementWhereInput = {
      tenantId
    };

    if (filter?.priority) {
      where.priority = filter.priority;
    }

    if (filter?.isPinned !== undefined) {
      where.isPinned = filter.isPinned;
    }

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { content: { contains: filter.search, mode: "insensitive" } }
      ];
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      include: {
        author: { select: { id: true, email: true } },
        acknowledgements: employeeId ? { where: { employeeId } } : true
      },
      orderBy: [
        { isPinned: "desc" },
        { publishedAt: "desc" }
      ],
      take: filter?.limit ?? 50,
      skip: filter?.offset ?? 0
    });

    return announcements.map((a) => {
      const isAcked = employeeId ? a.acknowledgements.some((ack) => ack.employeeId === employeeId) : false;
      const ackDate = employeeId ? a.acknowledgements.find((ack) => ack.employeeId === employeeId)?.acknowledgedAt : null;

      return {
        id: a.id,
        tenantId: a.tenantId,
        title: a.title,
        content: a.content,
        priority: a.priority,
        isPinned: a.isPinned,
        publishedAt: a.publishedAt.toISOString(),
        expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
        attachments: (a.attachments as Array<{ name: string; url: string; sizeBytes?: number }>) ?? [],
        createdBy: a.createdBy,
        authorName: a.author.email,
        isAcknowledged: isAcked,
        acknowledgementCount: a.acknowledgements.length,
        acknowledgedAt: ackDate ? ackDate.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString()
      };
    });
  }

  async createAnnouncement(tenantId: string, dto: CreateAnnouncementDto, authorUserId: string) {
    const announcement = await this.prisma.announcement.create({
      data: {
        tenantId,
        title: dto.title,
        content: dto.content,
        priority: dto.priority,
        isPinned: dto.isPinned,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        attachments: (dto.attachments ?? []) as Prisma.InputJsonValue,
        createdBy: authorUserId,
        publishedAt: new Date()
      },
      include: {
        author: { select: { id: true, email: true } }
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: authorUserId,
      action: "announcements.created",
      resourceType: "announcement",
      resourceId: announcement.id,
      after: { title: dto.title, priority: dto.priority, isPinned: dto.isPinned }
    });

    // Multi-channel notifications dispatch
    try {
      const activeMemberships = await this.prisma.tenantMembership.findMany({
        where: { tenantId, status: "ACTIVE" },
        select: { userId: true }
      });

      for (const m of activeMemberships) {
        if (dto.notifyChannels.includes("IN_APP")) {
          await this.notificationService.send(tenantId, {
            recipientUserId: m.userId,
            channel: "IN_APP",
            subject: `Company Announcement: ${dto.title}`,
            body: dto.content.length > 150 ? `${dto.content.slice(0, 147)}...` : dto.content,
            data: { announcementId: announcement.id, priority: dto.priority }
          }).catch(() => null);
        }
        if (dto.notifyChannels.includes("PUSH")) {
          await this.notificationService.send(tenantId, {
            recipientUserId: m.userId,
            channel: "PUSH",
            subject: `📢 ${dto.title}`,
            body: dto.content.slice(0, 100),
            data: { announcementId: announcement.id }
          }).catch(() => null);
        }
      }
    } catch {
      // Non-blocking notification dispatch
    }

    return {
      id: announcement.id,
      tenantId: announcement.tenantId,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      isPinned: announcement.isPinned,
      publishedAt: announcement.publishedAt.toISOString(),
      expiresAt: announcement.expiresAt ? announcement.expiresAt.toISOString() : null,
      attachments: (announcement.attachments as Array<{ name: string; url: string; sizeBytes?: number }>) ?? [],
      createdBy: announcement.createdBy,
      authorName: announcement.author.email,
      isAcknowledged: false,
      acknowledgementCount: 0,
      acknowledgedAt: null,
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString()
    };
  }

  async getAnnouncement(tenantId: string, id: string, employeeId?: string) {
    const a = await this.prisma.announcement.findFirst({
      where: { id, tenantId },
      include: {
        author: { select: { id: true, email: true } },
        acknowledgements: employeeId ? { where: { employeeId } } : true
      }
    });
    if (!a) {
      throw new NotFoundException("Announcement not found.");
    }

    const isAcked = employeeId ? a.acknowledgements.some((ack) => ack.employeeId === employeeId) : false;
    const ackDate = employeeId ? a.acknowledgements.find((ack) => ack.employeeId === employeeId)?.acknowledgedAt : null;

    return {
      id: a.id,
      tenantId: a.tenantId,
      title: a.title,
      content: a.content,
      priority: a.priority,
      isPinned: a.isPinned,
      publishedAt: a.publishedAt.toISOString(),
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
      attachments: (a.attachments as Array<{ name: string; url: string; sizeBytes?: number }>) ?? [],
      createdBy: a.createdBy,
      authorName: a.author.email,
      isAcknowledged: isAcked,
      acknowledgementCount: a.acknowledgements.length,
      acknowledgedAt: ackDate ? ackDate.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString()
    };
  }

  async acknowledgeAnnouncement(tenantId: string, announcementId: string, employeeId: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id: announcementId, tenantId }
    });
    if (!announcement) {
      throw new NotFoundException("Announcement not found.");
    }

    const ack = await this.prisma.acknowledgement.upsert({
      where: {
        tenantId_announcementId_employeeId: {
          tenantId,
          announcementId,
          employeeId
        }
      },
      update: {
        acknowledgedAt: new Date()
      },
      create: {
        tenantId,
        announcementId,
        employeeId,
        acknowledgedAt: new Date()
      }
    });

    return {
      success: true,
      announcementId,
      employeeId,
      acknowledgedAt: ack.acknowledgedAt.toISOString()
    };
  }

  async deleteAnnouncement(tenantId: string, id: string, actorUserId: string) {
    const existing = await this.prisma.announcement.findFirst({
      where: { id, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Announcement not found.");
    }

    await this.prisma.announcement.delete({
      where: { id }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      action: "announcements.deleted",
      resourceType: "announcement",
      resourceId: id,
      before: { title: existing.title }
    });

    return { success: true, message: "Announcement deleted." };
  }
}
