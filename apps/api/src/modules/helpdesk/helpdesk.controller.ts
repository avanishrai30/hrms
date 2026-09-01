import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import type { Request } from "express";
import { HelpdeskService } from "./helpdesk.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  AddTicketCommentSchema,
  ResolveTicketSchema,
  EscalateTicketSchema
} from "./helpdesk.schemas.js";
import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

interface AuthenticatedEmployeeRequest extends Request {
  employee?: { id?: string };
}

@Controller("api/v1/helpdesk")
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Get("tickets")
  @RequirePermissions("helpdesk.view")
  async listTickets(
    @Req() req: Request,
    @Query("category") category?: TicketCategory,
    @Query("priority") priority?: TicketPriority,
    @Query("status") status?: TicketStatus,
    @Query("createdById") createdById?: string,
    @Query("assigneeId") assigneeId?: string,
    @Query("search") search?: string
  ) {
    const ctx = requireTenantContext(req);
    return this.helpdeskService.listTickets(ctx.tenantId, {
      category,
      priority,
      status,
      createdById,
      assigneeId,
      search
    });
  }

  @Get("sla/performance")
  @RequirePermissions("helpdesk.view")
  async getSLAPerformance(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.helpdeskService.getSLAPerformance(ctx.tenantId);
  }

  @Get("tickets/:id")
  @RequirePermissions("helpdesk.view")
  async getTicketById(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.helpdeskService.getTicketById(ctx.tenantId, id);
  }

  @Post("tickets")
  @RequirePermissions("helpdesk.view")
  async createTicket(@Req() req: AuthenticatedEmployeeRequest, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateTicketSchema.parse(body);
    // User or employee ID from context
    const employeeId = req.employee?.id || ctx.userId;
    return this.helpdeskService.createTicket(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      employeeId,
      dto
    );
  }

  @Put("tickets/:id")
  @RequirePermissions("helpdesk.manage")
  async updateTicket(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = UpdateTicketSchema.parse(body);
    return this.helpdeskService.updateTicket(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      id,
      dto
    );
  }

  @Post("tickets/:id/comments")
  @RequirePermissions("helpdesk.view")
  async addComment(@Req() req: AuthenticatedEmployeeRequest, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = AddTicketCommentSchema.parse(body);
    const employeeId = req.employee?.id || ctx.userId;
    return this.helpdeskService.addComment(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      employeeId,
      id,
      dto
    );
  }

  @Post("tickets/:id/resolve")
  @RequirePermissions("helpdesk.manage")
  async resolveTicket(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = ResolveTicketSchema.parse(body);
    return this.helpdeskService.resolveTicket(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      id,
      dto
    );
  }

  @Post("tickets/:id/escalate")
  @RequirePermissions("helpdesk.manage")
  async escalateTicket(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = EscalateTicketSchema.parse(body);
    return this.helpdeskService.escalateTicket(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      id,
      dto
    );
  }
}
