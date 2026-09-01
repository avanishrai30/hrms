import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { ROLE_PERMISSIONS } from "@vc-wms/auth";
import type { PermissionCode, TenantRoleCode } from "@vc-wms/shared-types";

const prisma = new PrismaClient();

const PERMISSIONS: PermissionCode[] = [
  "tenant.dashboard.read",
  "tenant.settings.read",
  "tenant.settings.update",
  "tenant.branding.read",
  "tenant.branding.update",
  "tenant.features.read",
  "tenant.features.update",
  "tenant.domains.read",
  "tenant.domains.update",
  "roles.read",
  "roles.create",
  "roles.update",
  "permissions.read",
  "users.read",
  "users.invite",
  "users.update",
  "users.deactivate",
  "users.reset_access",
  "employees.read",
  "employees.create",
  "employees.update",
  "employees.archive",
  "departments.read",
  "departments.create",
  "departments.update",
  "designations.read",
  "designations.create",
  "designations.update",
  "documents.read",
  "documents.metadata.create",
  "finance.view",
  "finance.manage",
  "finance.approve",
  "finance.pay",
  "finance.audit",
  "finance.accounts.view",
  "finance.accounts.manage",
  "finance.gl.view",
  "finance.gl.post",
  "finance.journal.view",
  "finance.journal.manage",
  "finance.journal.approve",
  "finance.bank.view",
  "finance.bank.manage",
  "finance.vendor.view",
  "finance.vendor.manage",
  "finance.payable.view",
  "finance.payable.manage",
  "finance.receivable.view",
  "finance.receivable.manage",
  "finance.tax.view",
  "finance.tax.manage",
  "finance.erp.view",
  "finance.erp.manage",
  "finance.report.view",
  "finance.report.export",
  "integrations.view",
  "integrations.manage",
  "integrations.api.view",
  "integrations.api.manage",
  "integrations.webhooks.view",
  "integrations.webhooks.manage",
  "integrations.connectors.view",
  "integrations.connectors.manage",
  "integrations.sso.view",
  "integrations.sso.manage",
  "automation.view",
  "automation.manage",
  "automation.run",
  "knowledge.view",
  "knowledge.manage",
  "marketplace.view",
  "marketplace.manage",
  "ai.assistant.view",
  "expenses.view",
  "expenses.create",
  "expenses.submit",
  "expenses.approve",
  "expenses.pay",
  "expenses.manage",
  "travel.view",
  "travel.create",
  "travel.approve",
  "travel.manage",
  "budgets.view",
  "budgets.manage",
  "reimbursements.view",
  "reimbursements.manage",
  "audit.read",
  "platform.tenants.read",
  "platform.tenants.create",
  "platform.tenants.update",
  "platform.tenants.status",
  "platform.audit.read"
];

const ROLES: TenantRoleCode[] = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];

async function main(): Promise<void> {
  for (const code of PERMISSIONS) {
    const [resource, action] = code.split(/\.(.*)/s);
    await prisma.permission.upsert({
      where: { code },
      create: { code, resource: resource ?? code, action: action ?? "read", description: code },
      update: { resource: resource ?? code, action: action ?? "read", description: code }
    });
  }

  const platformEmail = process.env.PLATFORM_ADMIN_EMAILS?.split(",")[0] ?? "admin@example.com";
  const bootstrapPassword = process.env.BOOTSTRAP_PASSWORD ?? "ChangeMe123!";
  await prisma.platformUser.upsert({
    where: { email: platformEmail.toLowerCase() },
    create: {
      email: platformEmail.toLowerCase(),
      passwordHash: await argon2.hash(bootstrapPassword),
      role: "PLATFORM_SUPER_ADMIN",
      status: "ACTIVE"
    },
    update: { role: "PLATFORM_SUPER_ADMIN", status: "ACTIVE" }
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "vc-organics" },
    create: {
      name: "VC Organics",
      slug: "vc-organics",
      legalName: "VC Organics",
      status: "ACTIVE",
      plan: "STANDARD",
      primaryDomain: "hr.vcorganics.com",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      currency: "INR",
      settings: {
        create: {
          timezone: "Asia/Kolkata",
          locale: "en-IN",
          currency: "INR",
          attendanceTimezone: "Asia/Kolkata",
          defaultWorkingDaysPerMonth: 26
        }
      },
      branding: {
        create: {
          displayName: "VC Organics",
          primaryColor: "#1f8f5f",
          secondaryColor: "#335c67",
          accentColor: "#f2b84b",
          pwaName: "VC Organics Workforce",
          pwaShortName: "VC-WMS"
        }
      },
      domains: {
        create: {
          domain: "hr.vcorganics.com",
          isPrimary: true,
          verifiedAt: new Date()
        }
      }
    },
    update: { status: "ACTIVE", primaryDomain: "hr.vcorganics.com" }
  });

  const allPermissions = await prisma.permission.findMany();
  const byCode = new Map(allPermissions.map((permission) => [permission.code, permission.id]));

  for (const roleCode of ROLES) {
    const role = await prisma.role.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: roleCode } },
      create: {
        tenantId: tenant.id,
        code: roleCode,
        name: roleCode
          .split("_")
          .map((part) => part[0] + part.slice(1).toLowerCase())
          .join(" "),
        isSystemRole: true
      },
      update: { isSystemRole: true }
    });
    const assignments = ROLE_PERMISSIONS[roleCode]
      .map((code) => byCode.get(code))
      .filter((permissionId): permissionId is string => Boolean(permissionId))
      .map((permissionId) => ({ tenantId: tenant.id, roleId: role.id, permissionId }));
    await prisma.tenantRolePermission.createMany({ data: assignments, skipDuplicates: true });
  }

  const ownerEmail = process.env.VC_ORGANICS_OWNER_EMAIL ?? "owner@vcorganics.com";
  const owner = await prisma.user.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      email: ownerEmail.toLowerCase(),
      passwordHash: await argon2.hash(bootstrapPassword),
      status: "ACTIVE"
    },
    update: { email: ownerEmail.toLowerCase(), status: "ACTIVE" }
  });
  const membership = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: owner.id } },
    create: { tenantId: tenant.id, userId: owner.id, status: "ACTIVE" },
    update: { status: "ACTIVE" }
  });
  const ownerRole = await prisma.role.findUniqueOrThrow({
    where: { tenantId_code: { tenantId: tenant.id, code: "TENANT_OWNER" } }
  });
  await prisma.tenantMembershipRole.createMany({
    data: [{ tenantId: tenant.id, membershipId: membership.id, roleId: ownerRole.id }],
    skipDuplicates: true
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
