import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  resolveSuspiciousActivitySchema,
  securityAlertQuerySchema,
  type ResolveSuspiciousActivityDto,
  type SecurityAlertQueryDto
} from "./security.schemas.js";
import { SecurityService } from "./security.service.js";

@Controller("security")
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get("alerts")
  @RequirePermissions("security.view")
  async listAlerts(
    @Query(new ZodValidationPipe(securityAlertQuerySchema)) query: SecurityAlertQueryDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.securityService.listAlerts(tenant.tenantId, query);
  }

  @Post("alerts/:id/resolve")
  @RequirePermissions("security.manage")
  async resolveAlert(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(resolveSuspiciousActivitySchema)) body: ResolveSuspiciousActivityDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.securityService.resolveAlert(
      tenant.tenantId,
      id,
      tenant.userId,
      body.resolutionNote,
      tenant.membershipId
    );
  }

  @Get("metrics")
  @RequirePermissions("security.view")
  async getMetrics(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.securityService.getSecurityMetrics(tenant.tenantId);
  }
}
