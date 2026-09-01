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
import { VisitorService } from "./visitor.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  PreRegisterVisitorSchema,
  CheckInVisitorSchema,
  CheckOutVisitorSchema,
  CreateGatePassSchema,
  ApproveGatePassSchema,
  CreateContractorSchema,
  AddContractorWorkerPassSchema
} from "./visitor.schemas.js";
import type { ContractorStatus, GatePassStatus, GatePassType, VisitorStatus } from "@prisma/client";

interface AuthenticatedEmployeeRequest extends Request {
  employee?: { id?: string };
}

@Controller("api/v1/visitor")
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Get("visitors")
  @RequirePermissions("visitor.view")
  async listVisitors(@Req() req: Request, @Query("status") status?: VisitorStatus) {
    const ctx = requireTenantContext(req);
    return this.visitorService.listVisitors(ctx.tenantId, status);
  }

  @Post("pre-register")
  @RequirePermissions("visitor.view")
  async preRegisterVisitor(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = PreRegisterVisitorSchema.parse(body);
    return this.visitorService.preRegisterVisitor(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("check-in")
  @RequirePermissions("visitor.manage")
  async checkInVisitor(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CheckInVisitorSchema.parse(body);
    return this.visitorService.checkInVisitor(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("check-out")
  @RequirePermissions("visitor.manage")
  async checkOutVisitor(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CheckOutVisitorSchema.parse(body);
    return this.visitorService.checkOutVisitor(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("gate-passes")
  @RequirePermissions("visitor.view")
  async listGatePasses(
    @Req() req: Request,
    @Query("status") status?: GatePassStatus,
    @Query("type") type?: GatePassType
  ) {
    const ctx = requireTenantContext(req);
    return this.visitorService.listGatePasses(ctx.tenantId, status, type);
  }

  @Post("gate-passes")
  @RequirePermissions("gatepass.manage")
  async createGatePass(@Req() req: AuthenticatedEmployeeRequest, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateGatePassSchema.parse(body);
    const employeeId = req.employee?.id || ctx.userId;
    return this.visitorService.createGatePass(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      employeeId,
      dto
    );
  }

  @Post("gate-passes/:id/approve")
  @RequirePermissions("gatepass.manage")
  async approveGatePass(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = ApproveGatePassSchema.parse(body);
    return this.visitorService.approveGatePass(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      id,
      dto
    );
  }

  @Get("contractors")
  @RequirePermissions("visitor.view")
  async listContractors(@Req() req: Request, @Query("status") status?: ContractorStatus) {
    const ctx = requireTenantContext(req);
    return this.visitorService.listContractors(ctx.tenantId, status);
  }

  @Post("contractors")
  @RequirePermissions("visitor.manage")
  async createContractor(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateContractorSchema.parse(body);
    return this.visitorService.createContractor(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("contractors/workers")
  @RequirePermissions("visitor.manage")
  async addContractorWorkerPass(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = AddContractorWorkerPassSchema.parse(body);
    return this.visitorService.addContractorWorkerPass(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }
}
