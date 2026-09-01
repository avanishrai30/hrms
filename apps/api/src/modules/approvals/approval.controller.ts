import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  approvalActionSchema,
  approvalQuerySchema,
  createApprovalTemplateSchema,
  delegateApprovalSchema,
  submitApprovalRequestSchema
} from "./approval.schemas.js";
import { ApprovalService } from "./approval.service.js";

@Controller("approvals")
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get("templates")
  @RequirePermissions("approvals.view")
  async listTemplates(
    @Req() req: AuthenticatedRequest,
    @Query("entityType") entityType?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.approvalService.listTemplates(tenant.tenantId, entityType);
  }

  @Post("templates")
  @RequirePermissions("approvals.manage")
  async createTemplate(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createApprovalTemplateSchema.parse(body);
    return this.approvalService.createTemplate(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Get("templates/:id")
  @RequirePermissions("approvals.view")
  async getTemplate(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.approvalService.getTemplate(tenant.tenantId, id);
  }

  @Get("requests")
  @RequirePermissions("approvals.view")
  async listRequests(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = approvalQuerySchema.parse(query);
    return this.approvalService.listRequests(tenant.tenantId, parsed);
  }

  @Post("submit")
  @RequirePermissions("approvals.create")
  async submitRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = submitApprovalRequestSchema.parse(body);
    return this.approvalService.submitRequest(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Get("me")
  @RequirePermissions("approvals.view")
  async getMyPendingApprovals(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.approvalService.getMyPendingApprovals(
      tenant.tenantId,
      tenant.userId
    );
  }

  @Get("requests/:id")
  @RequirePermissions("approvals.view")
  async getRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.approvalService.getRequest(tenant.tenantId, id);
  }

  @Post("requests/:id/approve")
  @RequirePermissions("approvals.action")
  async approveRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = approvalActionSchema.parse(body ?? {});
    return this.approvalService.approve(
      tenant.tenantId,
      id,
      tenant.userId,
      parsed.comment
    );
  }

  @Post("requests/:id/reject")
  @RequirePermissions("approvals.action")
  async rejectRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = approvalActionSchema.parse(body ?? {});
    return this.approvalService.reject(
      tenant.tenantId,
      id,
      tenant.userId,
      parsed.comment
    );
  }

  @Post("requests/:id/delegate")
  @RequirePermissions("approvals.action")
  async delegateRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = delegateApprovalSchema.parse(body);
    return this.approvalService.delegate(
      tenant.tenantId,
      id,
      tenant.userId,
      parsed.delegateToUserId,
      parsed.comment
    );
  }
}
