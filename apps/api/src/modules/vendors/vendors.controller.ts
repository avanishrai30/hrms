import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  CreateVendorSchema,
  CreateContractSchema,
  CreateComplianceSchema
} from "./vendors.schemas.js";
import { VendorsService } from "./vendors.service.js";

@Controller("vendors")
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @RequirePermissions("vendors.manage")
  async listVendors(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.vendorsService.listVendors(tenant.tenantId);
  }

  @Post()
  @RequirePermissions("vendors.manage")
  async createVendor(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateVendorSchema.parse(body);
    return this.vendorsService.createVendor(
      tenant.tenantId,
      { userId: tenant.userId, membershipId: tenant.membershipId },
      dto
    );
  }

  @Get("analytics")
  @RequirePermissions("vendors.manage")
  async getVendorAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.vendorsService.getVendorAnalytics(tenant.tenantId);
  }

  @Get("contracts")
  @RequirePermissions("vendors.manage")
  async listContracts(
    @Req() req: AuthenticatedRequest,
    @Query("vendorId") vendorId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.vendorsService.listContracts(tenant.tenantId, vendorId);
  }

  @Post("contracts")
  @RequirePermissions("vendors.manage")
  async createContract(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateContractSchema.parse(body);
    return this.vendorsService.createContract(
      tenant.tenantId,
      { userId: tenant.userId, membershipId: tenant.membershipId },
      dto
    );
  }

  @Get("compliance")
  @RequirePermissions("vendors.manage")
  async listCompliance(
    @Req() req: AuthenticatedRequest,
    @Query("vendorId") vendorId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.vendorsService.listCompliance(tenant.tenantId, vendorId);
  }

  @Post("compliance")
  @RequirePermissions("vendors.manage")
  async createCompliance(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateComplianceSchema.parse(body);
    return this.vendorsService.createCompliance(
      tenant.tenantId,
      { userId: tenant.userId, membershipId: tenant.membershipId },
      dto
    );
  }

  @Get(":id")
  @RequirePermissions("vendors.manage")
  async getVendorById(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.vendorsService.getVendorById(tenant.tenantId, id);
  }
}
