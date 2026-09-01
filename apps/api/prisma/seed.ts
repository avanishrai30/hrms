import { EmploymentStatus, EmploymentType, PrismaClient, SalaryType } from "@prisma/client";
import * as argon2 from "argon2";
import { ROLE_PERMISSIONS } from "@vc-wms/auth";
import type { TenantRoleCode } from "@vc-wms/shared-types";

const prisma = new PrismaClient();

const ROLES: TenantRoleCode[] = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];

async function ensureUser(email: string, passwordHash: string) {
  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, status: "ACTIVE" }
    });
  }

  return prisma.user.create({
    data: { email, passwordHash, status: "ACTIVE" }
  });
}

async function main(): Promise<void> {
  console.log("🌱 Starting production HRMS bootstrap seed...");

  const uniquePerms = new Set<string>();
  for (const roleCode of ROLES) {
    for (const permission of ROLE_PERMISSIONS[roleCode]) uniquePerms.add(permission);
  }

  for (const code of uniquePerms) {
    const [resource, action] = code.split(/\.(.*)/s);
    await prisma.permission.upsert({
      where: { code },
      create: {
        code,
        resource: resource ?? code,
        action: action ?? "read",
        description: code
      },
      update: {
        resource: resource ?? code,
        action: action ?? "read",
        description: code
      }
    });
  }
  console.log(`✅ Seeded ${uniquePerms.size} permissions`);

  const bootstrapPassword = process.env.BOOTSTRAP_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await argon2.hash(bootstrapPassword);
  const platformEmail = (process.env.PLATFORM_ADMIN_EMAILS?.split(",")[0] ?? "admin@example.com").toLowerCase();
  const ownerEmail = (process.env.VC_ORGANICS_OWNER_EMAIL ?? "owner@vcorganics.com").toLowerCase();

  await prisma.platformUser.upsert({
    where: { email: platformEmail },
    create: {
      email: platformEmail,
      passwordHash,
      role: "PLATFORM_SUPER_ADMIN",
      status: "ACTIVE"
    },
    update: {
      passwordHash,
      role: "PLATFORM_SUPER_ADMIN",
      status: "ACTIVE"
    }
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "vc-organics" },
    create: {
      name: "VC Organics",
      slug: "vc-organics",
      legalName: "VC Organics Private Limited",
      status: "ACTIVE",
      plan: "ENTERPRISE",
      primaryDomain: "hrms.vcorganics.com",
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
          domain: "hrms.vcorganics.com",
          isPrimary: true,
          verifiedAt: new Date()
        }
      }
    },
    update: {
      status: "ACTIVE",
      plan: "ENTERPRISE",
      primaryDomain: "hrms.vcorganics.com"
    }
  });
  console.log(`✅ Tenant ready: ${tenant.name} (${tenant.id})`);

  const allPermissions = await prisma.permission.findMany();
  const permissionIds = new Map(allPermissions.map((permission) => [permission.code, permission.id]));

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
      .map((code) => permissionIds.get(code))
      .filter((permissionId): permissionId is string => Boolean(permissionId))
      .map((permissionId) => ({ tenantId: tenant.id, roleId: role.id, permissionId }));

    await prisma.tenantRolePermission.createMany({ data: assignments, skipDuplicates: true });
  }
  console.log("✅ Tenant roles and permissions ready");

  const deptEng = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-ENG" } },
    create: {
      tenantId: tenant.id,
      code: "DEPT-ENG",
      name: "Engineering & Technology",
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  const deptHr = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-HR" } },
    create: {
      tenantId: tenant.id,
      code: "DEPT-HR",
      name: "Human Resources & Talent",
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-FIN" } },
    create: {
      tenantId: tenant.id,
      code: "DEPT-FIN",
      name: "Finance & Accounting",
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-OPS" } },
    create: {
      tenantId: tenant.id,
      code: "DEPT-OPS",
      name: "Supply Chain & Operations",
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  const desigCeo = await prisma.designation.upsert({
    where: {
      tenantId_departmentId_code: {
        tenantId: tenant.id,
        departmentId: deptEng.id,
        code: "DESIG-CEO"
      }
    },
    create: {
      tenantId: tenant.id,
      departmentId: deptEng.id,
      code: "DESIG-CEO",
      name: "Chief Executive Officer",
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  const desigHrLead = await prisma.designation.upsert({
    where: {
      tenantId_departmentId_code: {
        tenantId: tenant.id,
        departmentId: deptHr.id,
        code: "DESIG-HRLEAD"
      }
    },
    create: {
      tenantId: tenant.id,
      departmentId: deptHr.id,
      code: "DESIG-HRLEAD",
      name: "Lead People Operations",
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  const desigArch = await prisma.designation.upsert({
    where: {
      tenantId_departmentId_code: {
        tenantId: tenant.id,
        departmentId: deptEng.id,
        code: "DESIG-ARCH"
      }
    },
    create: {
      tenantId: tenant.id,
      departmentId: deptEng.id,
      code: "DESIG-ARCH",
      name: "Principal Software Architect",
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });
  console.log("✅ Core departments and designations ready");

  await prisma.location.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "LOC-BLR-HQ" } },
    create: {
      tenantId: tenant.id,
      code: "LOC-BLR-HQ",
      name: "Bangalore Global Tech HQ",
      description: "VC Organics Bangalore headquarters",
      type: "OFFICE",
      latitude: 12.9279,
      longitude: 77.6833,
      radiusMeters: 250,
      maxAccuracyMeters: 100,
      isActive: true
    },
    update: { isActive: true }
  });

  const userOwner = await ensureUser(ownerEmail, passwordHash);

  const hrEmail = "hradmin@vcorganics.com";
  const userHrAdmin = await ensureUser(hrEmail, passwordHash);

  const leadEmail = "techlead@vcorganics.com";
  const userLead = await ensureUser(leadEmail, passwordHash);

  const empOwner = await prisma.employee.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: "VC-0001" } },
    create: {
      tenantId: tenant.id,
      employeeCode: "VC-0001",
      fullName: "Avanish Rai",
      email: ownerEmail,
      phone: "+919876543210",
      departmentId: deptEng.id,
      designationId: desigCeo.id,
      joiningDate: new Date("2022-01-01"),
      employmentType: EmploymentType.FULL_TIME,
      salaryType: SalaryType.MONTHLY,
      status: EmploymentStatus.ACTIVE
    },
    update: {
      departmentId: deptEng.id,
      designationId: desigCeo.id,
      status: EmploymentStatus.ACTIVE
    }
  });

  const empHr = await prisma.employee.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: "VC-0002" } },
    create: {
      tenantId: tenant.id,
      employeeCode: "VC-0002",
      fullName: "Priya Sharma",
      email: hrEmail,
      phone: "+919812345678",
      departmentId: deptHr.id,
      designationId: desigHrLead.id,
      managerEmployeeId: empOwner.id,
      joiningDate: new Date("2023-03-15"),
      employmentType: EmploymentType.FULL_TIME,
      salaryType: SalaryType.MONTHLY,
      status: EmploymentStatus.ACTIVE
    },
    update: {
      departmentId: deptHr.id,
      designationId: desigHrLead.id,
      managerEmployeeId: empOwner.id,
      status: EmploymentStatus.ACTIVE
    }
  });

  const empLead = await prisma.employee.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: "VC-0003" } },
    create: {
      tenantId: tenant.id,
      employeeCode: "VC-0003",
      fullName: "Rohit Verma",
      email: leadEmail,
      phone: "+919765432109",
      departmentId: deptEng.id,
      designationId: desigArch.id,
      managerEmployeeId: empOwner.id,
      joiningDate: new Date("2023-06-01"),
      employmentType: EmploymentType.FULL_TIME,
      salaryType: SalaryType.MONTHLY,
      status: EmploymentStatus.ACTIVE
    },
    update: {
      departmentId: deptEng.id,
      designationId: desigArch.id,
      managerEmployeeId: empOwner.id,
      status: EmploymentStatus.ACTIVE
    }
  });
  console.log("✅ Bootstrap employees ready");

  const memberOwner = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: userOwner.id } },
    create: {
      tenantId: tenant.id,
      userId: userOwner.id,
      employeeId: empOwner.id,
      status: "ACTIVE"
    },
    update: { employeeId: empOwner.id, status: "ACTIVE" }
  });

  const memberHr = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: userHrAdmin.id } },
    create: {
      tenantId: tenant.id,
      userId: userHrAdmin.id,
      employeeId: empHr.id,
      status: "ACTIVE"
    },
    update: { employeeId: empHr.id, status: "ACTIVE" }
  });

  const memberLead = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: userLead.id } },
    create: {
      tenantId: tenant.id,
      userId: userLead.id,
      employeeId: empLead.id,
      status: "ACTIVE"
    },
    update: { employeeId: empLead.id, status: "ACTIVE" }
  });

  const roleOwner = await prisma.role.findUniqueOrThrow({
    where: { tenantId_code: { tenantId: tenant.id, code: "TENANT_OWNER" } }
  });
  const roleHr = await prisma.role.findUniqueOrThrow({
    where: { tenantId_code: { tenantId: tenant.id, code: "HR_ADMIN" } }
  });
  const roleManager = await prisma.role.findUniqueOrThrow({
    where: { tenantId_code: { tenantId: tenant.id, code: "MANAGER" } }
  });

  await prisma.tenantMembershipRole.createMany({
    data: [
      { tenantId: tenant.id, membershipId: memberOwner.id, roleId: roleOwner.id },
      { tenantId: tenant.id, membershipId: memberHr.id, roleId: roleHr.id },
      { tenantId: tenant.id, membershipId: memberLead.id, roleId: roleManager.id }
    ],
    skipDuplicates: true
  });

  console.log("🎉 Production bootstrap seed complete");
  console.log(`   Tenant: vc-organics`);
  console.log(`   Owner: ${ownerEmail}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error("❌ Seed Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
