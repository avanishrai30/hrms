import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type LocationVerificationStatus } from "@prisma/client";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  createAssignmentSchema,
  createLocationSchema,
  locationFilterSchema,
  locationOverrideSchema,
  updateLocationSchema,
  verifyGpsSchema,
  type CreateAssignmentDto,
  type CreateLocationDto,
  type LocationFilterDto,
  type LocationOverrideDto,
  type UpdateLocationDto,
  type VerifyGpsDto
} from "./locations.schemas.js";
import { LocationsService } from "./locations.service.js";

@Controller("locations")
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly prisma: PrismaService
  ) {}

  private async resolveEmployeeId(tenantId: string, membershipId: string, employeeId?: string): Promise<string> {
    if (employeeId) return employeeId;
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { id: membershipId, tenantId },
      select: { employeeId: true }
    });
    if (!membership?.employeeId) {
      throw new BadRequestException("No employee profile is linked to your user account.");
    }
    return membership.employeeId;
  }

  @Get()
  @RequirePermissions("location.view")
  listLocations(
    @Query(new ZodValidationPipe(locationFilterSchema)) query: LocationFilterDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.locationsService.listLocations(tenant.tenantId, query);
  }

  @Post()
  @RequirePermissions("location.create")
  createLocation(
    @Body(new ZodValidationPipe(createLocationSchema)) body: CreateLocationDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.locationsService.createLocation(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("audit/verifications")
  @RequirePermissions("location.audit")
  listVerifications(
    @Query("status") status: LocationVerificationStatus | undefined,
    @Query("locationId") locationId: string | undefined,
    @Query("employeeId") employeeId: string | undefined,
    @Query("page") page: string | undefined,
    @Query("limit") limit: string | undefined,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.locationsService.listVerifications(tenant.tenantId, {
      status,
      locationId,
      employeeId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
  }

  @Post("audit/override")
  @RequirePermissions("location.override")
  recordOverride(
    @Body(new ZodValidationPipe(locationOverrideSchema)) body: LocationOverrideDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.locationsService.recordManualOverride(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Post("verify-gps")
  @RequirePermissions("location.view")
  async verifyGps(
    @Body(new ZodValidationPipe(verifyGpsSchema)) body: VerifyGpsDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, body.employeeId);
    return this.locationsService.verifyGps(tenant.tenantId, employeeId, body, tenant.userId);
  }

  @Get(":id")
  @RequirePermissions("location.view")
  getLocation(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.locationsService.getLocation(tenant.tenantId, id);
  }

  @Patch(":id")
  @RequirePermissions("location.update")
  updateLocation(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateLocationSchema)) body: UpdateLocationDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.locationsService.updateLocation(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }

  @Delete(":id")
  @RequirePermissions("location.update")
  deleteLocation(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.locationsService.deleteLocation(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  @Get(":id/assignments")
  @RequirePermissions("location.view")
  listAssignments(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.locationsService.listAssignments(tenant.tenantId, id);
  }

  @Post(":id/assignments")
  @RequirePermissions("location.assign")
  createAssignment(
    @Param("id") locationId: string,
    @Body(new ZodValidationPipe(createAssignmentSchema)) body: CreateAssignmentDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.locationsService.createAssignment(
      tenant.tenantId,
      { ...body, locationId },
      tenant.userId,
      tenant.membershipId
    );
  }

  @Delete(":id/assignments/:assignmentId")
  @RequirePermissions("location.assign")
  deleteAssignment(
    @Param("id") _locationId: string,
    @Param("assignmentId") assignmentId: string,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.locationsService.deleteAssignment(tenant.tenantId, assignmentId, tenant.userId, tenant.membershipId);
  }
}
