import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { requireTenantContext } from "../common/tenant-context.js";
import type { AuthenticatedRequest } from "../common/request-context.js";
import { RequirePermissions, RequirePlatform } from "../rbac/permissions.decorator.js";
import {
  createDomainSchema,
  createTenantSchema,
  tenantStatusSchema,
  updateBrandingSchema,
  updateSettingsSchema,
  updateTenantSchema,
  upsertFeatureFlagSchema,
  type CreateDomainDto,
  type CreateTenantDto,
  type TenantStatusDto,
  type UpdateBrandingDto,
  type UpdateSettingsDto,
  type UpdateTenantDto,
  type UpsertFeatureFlagDto
} from "./tenants.schemas.js";
import { TenantsService } from "./tenants.service.js";

@Controller("platform/tenants")
@RequirePlatform()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  list() {
    return this.tenantsService.listTenants();
  }

  @Post()
  create(@Body(new ZodValidationPipe(createTenantSchema)) body: CreateTenantDto, @Req() request: AuthenticatedRequest) {
    return this.tenantsService.createTenant(body, request.platformUser?.sub);
  }

  @Patch(":tenantId")
  update(
    @Param("tenantId") tenantId: string,
    @Body(new ZodValidationPipe(updateTenantSchema)) body: UpdateTenantDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.tenantsService.updateTenant(tenantId, body, request.platformUser?.sub);
  }

  @Patch(":tenantId/status")
  status(
    @Param("tenantId") tenantId: string,
    @Body(new ZodValidationPipe(tenantStatusSchema)) body: TenantStatusDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.tenantsService.changeStatus(tenantId, body, request.platformUser?.sub);
  }
}

@Controller("tenant")
export class TenantSelfController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get("current")
  @RequirePermissions("tenant.settings.read")
  async currentTenant(@Req() request: AuthenticatedRequest) {
    const tenantId = requireTenantContext(request).tenantId;
    const tenant = await this.tenantsService.findTenant(tenantId);
    const settings = await this.tenantsService.getSettings(tenantId);
    return {
      ...tenant,
      settings
    };
  }

  @Get("settings")
  @RequirePermissions("tenant.settings.read")
  settings(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.getSettings(requireTenantContext(request).tenantId);
  }

  @Patch("settings")
  @RequirePermissions("tenant.settings.update")
  updateSettings(@Body(new ZodValidationPipe(updateSettingsSchema)) body: UpdateSettingsDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.tenantsService.updateSettings(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("branding")
  @RequirePermissions("tenant.branding.read")
  branding(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.getBranding(requireTenantContext(request).tenantId);
  }

  @Patch("branding")
  @RequirePermissions("tenant.branding.update")
  updateBranding(@Body(new ZodValidationPipe(updateBrandingSchema)) body: UpdateBrandingDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.tenantsService.updateBranding(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("feature-flags")
  @RequirePermissions("tenant.features.read")
  featureFlags(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.listFeatureFlags(requireTenantContext(request).tenantId);
  }

  @Post("feature-flags")
  @RequirePermissions("tenant.features.update")
  upsertFeatureFlag(@Body(new ZodValidationPipe(upsertFeatureFlagSchema)) body: UpsertFeatureFlagDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.tenantsService.upsertFeatureFlag(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("domains")
  @RequirePermissions("tenant.domains.read")
  domains(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.listDomains(requireTenantContext(request).tenantId);
  }

  @Post("domains")
  @RequirePermissions("tenant.domains.update")
  createDomain(@Body(new ZodValidationPipe(createDomainSchema)) body: CreateDomainDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.tenantsService.createDomain(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }
}

@Controller("public/tenants")
export class PublicTenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get("resolve")
  resolve(@Query("host") host: string) {
    return this.tenantsService.resolveTenant(host);
  }

  @Get(":slug/branding")
  branding(@Param("slug") slug: string) {
    return this.tenantsService.getPublicBranding(slug);
  }
}
