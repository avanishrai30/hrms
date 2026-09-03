import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { OperationsAnalyticsService } from "./operations-analytics.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";

@Controller(["operations", "api/v1/operations"])
export class OperationsAnalyticsController {
  constructor(private readonly analyticsService: OperationsAnalyticsService) {}

  @Get("analytics")
  @RequirePermissions("analytics.operations")
  async getExecutiveAnalytics(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.analyticsService.getExecutiveAnalytics(ctx.tenantId);
  }
}
