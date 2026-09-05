import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { ROLE_PERMISSIONS } from "@vc-wms/auth";
import type { TenantRoleCode } from "@vc-wms/shared-types";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateDomainDto,
  CreateTenantDto,
  TenantStatusDto,
  UpdateBrandingDto,
  UpdateSettingsDto,
  UpdateTenantDto,
  UpsertFeatureFlagDto
} from "./tenants.schemas.js";

const SYSTEM_ROLES: TenantRoleCode[] = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  listTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: { settings: true, branding: true, domains: true }
    });
  }

  async createTenant(input: CreateTenantDto, actorUserId?: string) {
    const tenant = await this.prisma.$transaction(async (tx) => {
      const created = await tx.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          legalName: input.legalName,
          plan: input.plan,
          primaryDomain: input.primaryDomain,
          timezone: input.timezone,
          locale: input.locale,
          currency: input.currency,
          settings: {
            create: {
              timezone: input.timezone,
              locale: input.locale,
              currency: input.currency,
              attendanceTimezone: input.timezone
            }
          },
          branding: {
            create: {
              displayName: input.name,
              pwaName: `${input.name} Workforce`,
              pwaShortName: input.name.slice(0, 16)
            }
          }
        }
      });
      if (input.primaryDomain) {
        await tx.tenantDomain.create({
          data: { tenantId: created.id, domain: input.primaryDomain, isPrimary: true }
        });
      }
      await this.seedTenantRbac(tx, created.id);
      return created;
    });

    await this.auditService.record({
      tenantId: tenant.id,
      actorUserId,
      action: "tenant.created",
      resourceType: "tenant",
      resourceId: tenant.id,
      after: this.auditJson(tenant)
    });
    return tenant;
  }

  async updateTenant(tenantId: string, input: UpdateTenantDto, actorUserId?: string) {
    const before = await this.findTenant(tenantId);
    const tenant = await this.prisma.tenant.update({ where: { id: tenantId }, data: input });
    await this.auditService.record({
      tenantId,
      actorUserId,
      action: "tenant.updated",
      resourceType: "tenant",
      resourceId: tenantId,
      before: this.auditJson(before),
      after: this.auditJson(tenant)
    });
    return tenant;
  }

  async changeStatus(tenantId: string, input: TenantStatusDto, actorUserId?: string) {
    const before = await this.findTenant(tenantId);
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: input.status, archivedAt: input.status === "ARCHIVED" ? new Date() : null }
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      action: `tenant.${input.status.toLowerCase()}`,
      resourceType: "tenant",
      resourceId: tenantId,
      before: this.auditJson(before),
      after: this.auditJson(tenant)
    });
    return tenant;
  }

  async getPublicBranding(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { branding: true }
    });
    if (!tenant?.branding) {
      throw new NotFoundException("Tenant branding was not found.");
    }
    return { tenant: { slug: tenant.slug, status: tenant.status }, branding: tenant.branding };
  }

  async resolveTenant(host: string) {
    const normalized = host.split(":")[0]?.toLowerCase();
    if (!normalized) {
      throw new BadRequestException("Host is required.");
    }
    const domain = await this.prisma.tenantDomain.findUnique({
      where: { domain: normalized },
      include: { tenant: { include: { branding: true } } }
    });
    if (domain) {
      return domain.tenant;
    }
    const slug = normalized.split(".")[0];
    return this.prisma.tenant.findUnique({ where: { slug }, include: { branding: true } });
  }

  getSettings(tenantId: string) {
    return this.prisma.tenantSettings.findUniqueOrThrow({ where: { tenantId } });
  }

  async updateSettings(tenantId: string, input: UpdateSettingsDto, actorUserId: string, membershipId: string) {
    const before = await this.getSettings(tenantId);
    const existingMeta = (before.metadata as Record<string, unknown>) ?? {};
    const mergedMetadata = input.metadata !== undefined
      ? { ...existingMeta, ...input.metadata }
      : undefined;

    const dataToUpdate: Prisma.TenantSettingsUpdateInput = {};
    if (input.timezone !== undefined) dataToUpdate.timezone = input.timezone;
    if (input.locale !== undefined) dataToUpdate.locale = input.locale;
    if (input.currency !== undefined) dataToUpdate.currency = input.currency;
    if (input.weekStartDay !== undefined) dataToUpdate.weekStartDay = input.weekStartDay;
    if (input.payrollCycleDay !== undefined) dataToUpdate.payrollCycleDay = input.payrollCycleDay;
    if (input.attendanceTimezone !== undefined) dataToUpdate.attendanceTimezone = input.attendanceTimezone;
    if (input.defaultWorkingDaysPerMonth !== undefined) dataToUpdate.defaultWorkingDaysPerMonth = input.defaultWorkingDaysPerMonth;
    if (mergedMetadata !== undefined) dataToUpdate.metadata = mergedMetadata as Prisma.InputJsonValue;

    const settings = await this.prisma.tenantSettings.update({
      where: { tenantId },
      data: dataToUpdate
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId: membershipId,
      action: "tenant.settings.updated",
      resourceType: "tenant_settings",
      resourceId: settings.id,
      before: this.auditJson(before),
      after: this.auditJson(settings)
    });
    return settings;
  }

  getBranding(tenantId: string) {
    return this.prisma.tenantBranding.findUniqueOrThrow({ where: { tenantId } });
  }

  async updateBranding(tenantId: string, input: UpdateBrandingDto, actorUserId: string, membershipId: string) {
    const before = await this.getBranding(tenantId);
    const branding = await this.prisma.tenantBranding.update({ where: { tenantId }, data: input });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId: membershipId,
      action: "tenant.branding.updated",
      resourceType: "tenant_branding",
      resourceId: branding.id,
      before: this.auditJson(before),
      after: this.auditJson(branding)
    });
    return branding;
  }

  listFeatureFlags(tenantId: string) {
    return this.prisma.tenantFeatureFlag.findMany({ where: { tenantId }, orderBy: { key: "asc" } });
  }

  async upsertFeatureFlag(tenantId: string, input: UpsertFeatureFlagDto, actorUserId?: string, actorMembershipId?: string) {
    const before = await this.prisma.tenantFeatureFlag.findUnique({ where: { tenantId_key: { tenantId, key: input.key } } });
    const flag = await this.prisma.tenantFeatureFlag.upsert({
      where: { tenantId_key: { tenantId, key: input.key } },
      create: { tenantId, key: input.key, enabled: input.enabled, config: input.config as Prisma.InputJsonValue },
      update: { enabled: input.enabled, config: input.config as Prisma.InputJsonValue }
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "tenant.feature_flag.upserted",
      resourceType: "tenant_feature_flag",
      resourceId: flag.id,
      before: before ? this.auditJson(before) : undefined,
      after: this.auditJson(flag)
    });
    return flag;
  }

  listDomains(tenantId: string) {
    return this.prisma.tenantDomain.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  }

  async createDomain(tenantId: string, input: CreateDomainDto, actorUserId?: string, actorMembershipId?: string) {
    const domain = await this.prisma.tenantDomain.create({ data: { tenantId, domain: input.domain.toLowerCase(), isPrimary: input.isPrimary } });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "tenant.domain.created",
      resourceType: "tenant_domain",
      resourceId: domain.id,
      after: this.auditJson(domain)
    });
    return domain;
  }

  async findTenant(tenantId: string) {
    return this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  }

  private async seedTenantRbac(tx: Prisma.TransactionClient, tenantId: string): Promise<void> {
    const permissions = await tx.permission.findMany();
    const byCode = new Map(permissions.map((permission) => [permission.code, permission.id]));
    for (const roleCode of SYSTEM_ROLES) {
      const role = await tx.role.create({
        data: {
          tenantId,
          code: roleCode,
          name: roleCode
            .split("_")
            .map((part) => part[0] + part.slice(1).toLowerCase())
            .join(" "),
          isSystemRole: true
        }
      });
      const permissionsForRole = ROLE_PERMISSIONS[roleCode as keyof typeof ROLE_PERMISSIONS] || [];

      const rolePermissions = permissionsForRole
        .map((code: string) => byCode.get(code))
        .filter((permissionId): permissionId is string => Boolean(permissionId))
        .map((permissionId: string) => ({ tenantId, roleId: role.id, permissionId }));

      if (rolePermissions.length > 0) {
        await tx.tenantRolePermission.createMany({ data: rolePermissions, skipDuplicates: true });
      }
    }
  }

  private auditJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
