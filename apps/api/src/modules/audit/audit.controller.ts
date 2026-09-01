import { Controller, Get, Req } from "@nestjs/common";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import type { AuthenticatedRequest } from "../common/request-context.js";
import { AuditService } from "./audit.service.js";

@Controller("admin/audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions("audit.read")
  async list(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.auditService.listForTenant(tenant.tenantId);
  }
}

