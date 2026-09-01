import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req
} from "@nestjs/common";
import type { Request } from "express";
import { ClearanceService } from "./clearance.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  InitiateExitClearanceSchema,
  CompleteClearanceTaskSchema
} from "./clearance.schemas.js";
import type { ClearanceStatus } from "@prisma/client";

@Controller("api/v1/clearance")
export class ClearanceController {
  constructor(private readonly clearanceService: ClearanceService) {}

  @Get()
  @RequirePermissions("clearance.manage")
  async listClearances(@Req() req: Request, @Query("status") status?: ClearanceStatus) {
    const ctx = requireTenantContext(req);
    return this.clearanceService.listClearances(ctx.tenantId, status);
  }

  @Get(":id")
  @RequirePermissions("clearance.manage")
  async getClearanceById(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.clearanceService.getClearanceById(ctx.tenantId, id);
  }

  @Post("initiate")
  @RequirePermissions("clearance.manage")
  async initiateClearance(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = InitiateExitClearanceSchema.parse(body);
    return this.clearanceService.initiateClearance(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("tasks/:id/complete")
  @RequirePermissions("clearance.manage")
  async completeClearanceTask(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CompleteClearanceTaskSchema.parse(body);
    return this.clearanceService.completeClearanceTask(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      id,
      dto
    );
  }
}
