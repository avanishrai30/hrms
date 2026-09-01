import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import { SLAEngine } from "./engines/sla.engine.js";
import {
  type TicketCategory,
  type TicketPriority,
  type TicketSource,
  type TicketStatus,
  Prisma
} from "@prisma/client";
import type {
  CreateTicketDto,
  UpdateTicketDto,
  AddTicketCommentDto,
  ResolveTicketDto,
  EscalateTicketDto
} from "./helpdesk.schemas.js";

@Injectable()
export class HelpdeskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private async recordAudit(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    userId?: string,
    membershipId?: string
  ) {
    return this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action,
      resourceType,
      resourceId,
      metadata: (metadata ?? {}) as unknown as Prisma.InputJsonValue
    });
  }

  async listTickets(
    tenantId: string,
    filters?: {
      category?: TicketCategory;
      priority?: TicketPriority;
      status?: TicketStatus;
      createdById?: string;
      assigneeId?: string;
      search?: string;
    }
  ) {
    const where: Prisma.TicketWhereInput = {
      tenantId,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.createdById && { createdById: filters.createdById }),
      ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
      ...(filters?.search && {
        OR: [
          { ticketNumber: { contains: filters.search, mode: "insensitive" } },
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } }
        ]
      })
    };

    return this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: true,
        assignee: true,
        asset: true,
        comments: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getTicketById(tenantId: string, id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, tenantId },
      include: {
        createdBy: true,
        assignee: true,
        asset: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" }
        },
        attachments: true,
        escalations: {
          orderBy: { escalatedAt: "desc" }
        }
      }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    const isBreached = SLAEngine.isBreached(ticket.resolutionDueAt, ticket.resolvedAt);

    return {
      ...ticket,
      isSlaBreached: ticket.isSlaBreached || isBreached
    };
  }

  async createTicket(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    employeeId: string,
    dto: CreateTicketDto
  ) {
    const count = await this.prisma.ticket.count({ where: { tenantId } });
    const ticketNumber = `TICK-${String(count + 1).padStart(5, "0")}`;

    const now = new Date();
    const priority = dto.priority as TicketPriority;
    const { responseDueAt, resolutionDueAt } = SLAEngine.computeDueDates(priority, now);

    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId,
        ticketNumber,
        title: dto.title,
        description: dto.description,
        category: dto.category as TicketCategory,
        priority,
        source: dto.source as TicketSource,
        createdById: employeeId,
        assigneeId: dto.assigneeId,
        assetId: dto.assetId,
        responseDueAt,
        resolutionDueAt,
        tags: dto.tags || []
      }
    });

    await this.recordAudit(
      tenantId,
      "TICKET_CREATED",
      "Ticket",
      ticket.id,
      { ticketNumber: ticket.ticketNumber, priority: ticket.priority },
      actorContext.userId,
      actorContext.membershipId
    );

    return ticket;
  }

  async updateTicket(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    id: string,
    dto: UpdateTicketDto
  ) {
    const existing = await this.getTicketById(tenantId, id);

    const data: Prisma.TicketUpdateInput = {
      ...(dto.title && { title: dto.title }),
      ...(dto.description && { description: dto.description }),
      ...(dto.category && { category: dto.category as TicketCategory }),
      ...(dto.priority && { priority: dto.priority as TicketPriority }),
      ...(dto.status && { status: dto.status as TicketStatus }),
      ...(dto.tags && { tags: dto.tags }),
      ...(dto.assigneeId !== undefined && {
        assignee: dto.assigneeId ? { connect: { id: dto.assigneeId } } : { disconnect: true }
      })
    };

    if (dto.status === "RESOLVED" && existing.status !== "RESOLVED") {
      data.resolvedAt = new Date();
    }
    if (dto.status === "CLOSED" && existing.status !== "CLOSED") {
      data.closedAt = new Date();
    }
    if (dto.status === "REOPENED") {
      data.reopenCount = existing.reopenCount + 1;
      data.resolvedAt = null;
      data.closedAt = null;
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data
    });

    await this.recordAudit(
      tenantId,
      "TICKET_UPDATED",
      "Ticket",
      id,
      { changes: dto },
      actorContext.userId,
      actorContext.membershipId
    );

    return updated;
  }

  async addComment(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    employeeId: string,
    ticketId: string,
    dto: AddTicketCommentDto
  ) {
    const ticket = await this.getTicketById(tenantId, ticketId);

    const comment = await this.prisma.ticketComment.create({
      data: {
        tenantId,
        ticketId,
        authorId: employeeId,
        message: dto.message,
        isInternal: dto.isInternal
      }
    });

    // Mark first responded if not yet set
    if (!ticket.firstRespondedAt && !dto.isInternal) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { firstRespondedAt: new Date() }
      });
    }

    await this.recordAudit(
      tenantId,
      "TICKET_COMMENT_ADDED",
      "TicketComment",
      comment.id,
      { ticketId, isInternal: dto.isInternal },
      actorContext.userId,
      actorContext.membershipId
    );

    return comment;
  }

  async resolveTicket(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    ticketId: string,
    dto: ResolveTicketDto
  ) {
    const ticket = await this.getTicketById(tenantId, ticketId);
    const resolvedAt = new Date();
    const isBreached = SLAEngine.isBreached(ticket.resolutionDueAt, resolvedAt);

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "RESOLVED" as TicketStatus,
        resolvedAt,
        isSlaBreached: isBreached,
        resolutionNotes: dto.resolutionNotes,
        satisfactionScore: dto.satisfactionScore,
        feedbackNotes: dto.feedbackNotes
      }
    });

    await this.recordAudit(
      tenantId,
      "TICKET_RESOLVED",
      "Ticket",
      ticketId,
      { isSlaBreached: isBreached, satisfactionScore: dto.satisfactionScore },
      actorContext.userId,
      actorContext.membershipId
    );

    return updated;
  }

  async escalateTicket(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    ticketId: string,
    dto: EscalateTicketDto
  ) {
    await this.getTicketById(tenantId, ticketId);

    const escalation = await this.prisma.ticketEscalation.create({
      data: {
        tenantId,
        ticketId,
        level: dto.level,
        reason: dto.reason,
        escalatedTo: dto.escalatedTo
      }
    });

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { priority: "CRITICAL" as TicketPriority }
    });

    await this.recordAudit(
      tenantId,
      "TICKET_ESCALATED",
      "TicketEscalation",
      escalation.id,
      { ticketId, level: dto.level, reason: dto.reason },
      actorContext.userId,
      actorContext.membershipId
    );

    return escalation;
  }

  async getSLAPerformance(tenantId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { tenantId },
      select: {
        priority: true,
        createdAt: true,
        firstRespondedAt: true,
        resolvedAt: true,
        resolutionDueAt: true,
        isSlaBreached: true
      }
    });

    const breakdown = SLAEngine.computeSLAStats(tickets);
    const mttr = SLAEngine.calculateMTTR(tickets);

    const totalTickets = tickets.length;
    const breachedTotal = breakdown.reduce((sum, b) => sum + b.breachedCount, 0);
    const overallCompliance =
      totalTickets > 0 ? Math.round(((totalTickets - breachedTotal) / totalTickets) * 1000) / 10 : 100;

    return {
      overallCompliance,
      mttrHours: mttr,
      totalTickets,
      breachedCount: breachedTotal,
      priorities: breakdown
    };
  }
}
