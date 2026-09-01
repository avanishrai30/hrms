import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req
} from "@nestjs/common";
import type { Request } from "express";
import { FacilitiesService } from "./facilities.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  CreateFacilitySchema,
  BookFacilitySchema,
  CreateDeskSchema,
  AllocateDeskSchema,
  CreateVehicleSchema,
  BookVehicleSchema,
  RecordVehicleLogSchema
} from "./facilities.schemas.js";
import type { FacilityType, VehicleStatus } from "@prisma/client";

interface AuthenticatedEmployeeRequest extends Request {
  employee?: { id?: string };
}

@Controller("api/v1/facilities")
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  @RequirePermissions("facilities.view")
  async listFacilities(@Req() req: Request, @Query("type") type?: FacilityType) {
    const ctx = requireTenantContext(req);
    return this.facilitiesService.listFacilities(ctx.tenantId, type);
  }

  @Post()
  @RequirePermissions("facilities.manage")
  async createFacility(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateFacilitySchema.parse(body);
    return this.facilitiesService.createFacility(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("bookings")
  @RequirePermissions("facilities.view")
  async listBookings(
    @Req() req: Request,
    @Query("facilityId") facilityId?: string,
    @Query("date") date?: string
  ) {
    const ctx = requireTenantContext(req);
    return this.facilitiesService.listBookings(ctx.tenantId, facilityId, date);
  }

  @Post("bookings")
  @RequirePermissions("facilities.view")
  async bookFacility(@Req() req: AuthenticatedEmployeeRequest, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = BookFacilitySchema.parse(body);
    const employeeId = req.employee?.id || ctx.userId;
    return this.facilitiesService.bookFacility(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      employeeId,
      dto
    );
  }

  @Get("desks")
  @RequirePermissions("facilities.view")
  async listDesks(
    @Req() req: Request,
    @Query("floor") floor?: string,
    @Query("zone") zone?: string
  ) {
    const ctx = requireTenantContext(req);
    return this.facilitiesService.listDesks(ctx.tenantId, floor, zone);
  }

  @Post("desks")
  @RequirePermissions("facilities.manage")
  async createDesk(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateDeskSchema.parse(body);
    return this.facilitiesService.createDesk(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("desks/allocate")
  @RequirePermissions("facilities.manage")
  async allocateDesk(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = AllocateDeskSchema.parse(body);
    return this.facilitiesService.allocateDesk(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("vehicles")
  @RequirePermissions("facilities.view")
  async listVehicles(@Req() req: Request, @Query("status") status?: VehicleStatus) {
    const ctx = requireTenantContext(req);
    return this.facilitiesService.listVehicles(ctx.tenantId, status);
  }

  @Post("vehicles")
  @RequirePermissions("facilities.manage")
  async createVehicle(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateVehicleSchema.parse(body);
    return this.facilitiesService.createVehicle(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("vehicles/book")
  @RequirePermissions("facilities.view")
  async bookVehicle(@Req() req: AuthenticatedEmployeeRequest, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = BookVehicleSchema.parse(body);
    const employeeId = req.employee?.id || ctx.userId;
    return this.facilitiesService.bookVehicle(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      employeeId,
      dto
    );
  }

  @Post("vehicles/log")
  @RequirePermissions("facilities.manage")
  async recordVehicleLog(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = RecordVehicleLogSchema.parse(body);
    return this.facilitiesService.recordVehicleLog(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }
}
