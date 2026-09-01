import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  advanceWorkflowStepSchema,
  createWorkflowDefinitionSchema,
  delegateWorkflowStepSchema,
  escalateWorkflowSchema,
  startWorkflowSchema,
  workflowQuerySchema
} from "./workflow.schemas.js";
import { WorkflowService } from "./workflow.service.js";

@Controller("workflows")
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get("definitions")
  @RequirePermissions("workflows.view")
  async listDefinitions(
    @Req() req: AuthenticatedRequest,
    @Query("entityType") entityType?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workflowService.listDefinitions(tenant.tenantId, entityType);
  }

  @Post("definitions")
  @RequirePermissions("workflows.manage")
  async createDefinition(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createWorkflowDefinitionSchema.parse(body);
    return this.workflowService.createDefinition(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Get("definitions/:id")
  @RequirePermissions("workflows.view")
  async getDefinition(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workflowService.getDefinition(tenant.tenantId, id);
  }

  @Post("start")
  @RequirePermissions("workflows.create")
  async startWorkflow(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = startWorkflowSchema.parse(body);
    return this.workflowService.startWorkflow(
      tenant.tenantId,
      parsed.definitionCode,
      parsed.entityType,
      parsed.entityId,
      tenant.userId,
      parsed.data
    );
  }

  @Get("instances")
  @RequirePermissions("workflows.view")
  async listInstances(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = workflowQuerySchema.parse(query);
    return this.workflowService.listInstances(tenant.tenantId, parsed);
  }

  @Get("me")
  @RequirePermissions("workflows.view")
  async getMyPendingWorkflows(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.workflowService.getMyPendingWorkflows(
      tenant.tenantId,
      tenant.userId,
      tenant.roles
    );
  }

  @Get("instances/:id")
  @RequirePermissions("workflows.view")
  async getInstance(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workflowService.getInstance(tenant.tenantId, id);
  }

  @Post("instances/:id/advance")
  @RequirePermissions("workflows.action")
  async advanceStep(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = advanceWorkflowStepSchema.parse(body);
    return this.workflowService.advanceStep(
      tenant.tenantId,
      id,
      parsed.action,
      tenant.userId,
      parsed.comment,
      parsed.data
    );
  }

  @Post("instances/:id/delegate")
  @RequirePermissions("workflows.action")
  async delegateStep(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = delegateWorkflowStepSchema.parse(body);
    return this.workflowService.delegateStep(
      tenant.tenantId,
      id,
      parsed.stepId,
      parsed.delegatedToUserId,
      tenant.userId,
      parsed.comment
    );
  }

  @Post("instances/:id/escalate")
  @RequirePermissions("workflows.manage")
  async escalateWorkflow(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = escalateWorkflowSchema.parse(body ?? {});
    return this.workflowService.escalateWorkflow(
      tenant.tenantId,
      id,
      tenant.userId,
      parsed.reason
    );
  }

  @Get("instances/:id/audit")
  @RequirePermissions("workflows.audit")
  async getWorkflowAuditTrail(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workflowService.getWorkflowAuditTrail(tenant.tenantId, id);
  }
}
