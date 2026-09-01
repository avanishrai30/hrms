import { PrismaClient, EmployeeStatus, EmploymentType, AssetCategory, AssetCondition, AssetStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { ROLE_PERMISSIONS } from "@vc-wms/auth";
import type { TenantRoleCode } from "@vc-wms/shared-types";

const prisma = new PrismaClient();

const ROLES: TenantRoleCode[] = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];

async function main(): Promise<void> {
  console.log("🌱 Starting Enterprise HRMS Seed...");

  // 1. Seed all permissions from ROLE_PERMISSIONS map
  const uniquePerms = new Set<string>();
  for (const roleCode of ROLES) {
    for (const perm of ROLE_PERMISSIONS[roleCode]) {
      uniquePerms.add(perm);
    }
  }

  for (const code of uniquePerms) {
    const [resource, action] = code.split(/\.(.*)/s);
    await prisma.permission.upsert({
      where: { code },
      create: { code, resource: resource ?? code, action: action ?? "read", description: code },
      update: { resource: resource ?? code, action: action ?? "read", description: code }
    });
  }
  console.log(`✅ Seeded ${uniquePerms.size} Enterprise Permissions`);

  // 2. Seed Platform Super Admin
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

  // 3. Seed Primary Tenant (VC Organics HQ)
  const tenant = await prisma.tenant.upsert({
    where: { slug: "vc-organics" },
    create: {
      name: "VC Organics",
      slug: "vc-organics",
      legalName: "VC Organics Private Limited",
      status: "ACTIVE",
      plan: "ENTERPRISE",
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
  console.log(`✅ Seeded Tenant: ${tenant.name} (${tenant.id})`);

  // 4. Seed Roles & Role-Permission Mappings
  const allPermissions = await prisma.permission.findMany();
  const byCode = new Map(allPermissions.map((p) => [p.code, p.id]));

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

  // 5. Seed Locations / Workplaces
  const locHq = await prisma.location.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "LOC-BLR-HQ" } },
    create: {
      tenantId: tenant.id,
      code: "LOC-BLR-HQ",
      name: "Bangalore Global Tech HQ",
      timezone: "Asia/Kolkata",
      country: "IND",
      addressLine1: "Tower B, Cyber City, Outer Ring Road",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560103",
      latitude: 12.9279,
      longitude: 77.6833,
      geofenceRadiusMeters: 250,
      isActive: true
    },
    update: { isActive: true }
  });

  const locMumbai = await prisma.location.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "LOC-MUM-HUB" } },
    create: {
      tenantId: tenant.id,
      code: "LOC-MUM-HUB",
      name: "Mumbai Commercial Hub",
      timezone: "Asia/Kolkata",
      country: "IND",
      addressLine1: "BKC Complex, Bandra East",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400051",
      latitude: 19.0664,
      longitude: 72.8687,
      geofenceRadiusMeters: 200,
      isActive: true
    },
    update: { isActive: true }
  });

  // 6. Seed Departments
  const deptEng = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-ENG" } },
    create: { tenantId: tenant.id, code: "DEPT-ENG", name: "Engineering & Technology", isActive: true },
    update: { isActive: true }
  });

  const deptHr = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-HR" } },
    create: { tenantId: tenant.id, code: "DEPT-HR", name: "Human Resources & Talent", isActive: true },
    update: { isActive: true }
  });

  const deptFin = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-FIN" } },
    create: { tenantId: tenant.id, code: "DEPT-FIN", name: "Finance & Accounting", isActive: true },
    update: { isActive: true }
  });

  const deptOps = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DEPT-OPS" } },
    create: { tenantId: tenant.id, code: "DEPT-OPS", name: "Supply Chain & Operations", isActive: true },
    update: { isActive: true }
  });

  // 7. Seed Designations
  const desigCeo = await prisma.designation.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DESIG-CEO" } },
    create: { tenantId: tenant.id, code: "DESIG-CEO", name: "Chief Executive Officer", level: 10, isActive: true },
    update: { isActive: true }
  });

  const desigChro = await prisma.designation.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DESIG-CHRO" } },
    create: { tenantId: tenant.id, code: "DESIG-CHRO", name: "Chief Human Resources Officer", level: 9, isActive: true },
    update: { isActive: true }
  });

  const desigArch = await prisma.designation.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DESIG-ARCH" } },
    create: { tenantId: tenant.id, code: "DESIG-ARCH", name: "Principal Software Architect", level: 8, isActive: true },
    update: { isActive: true }
  });

  const desigEng = await prisma.designation.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DESIG-ENG" } },
    create: { tenantId: tenant.id, code: "DESIG-ENG", name: "Senior Software Engineer", level: 6, isActive: true },
    update: { isActive: true }
  });

  const desigHrLead = await prisma.designation.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "DESIG-HRLEAD" } },
    create: { tenantId: tenant.id, code: "DESIG-HRLEAD", name: "Lead People Operations", level: 7, isActive: true },
    update: { isActive: true }
  });

  // 8. Seed Enterprise Users & Employees
  const ownerEmail = process.env.VC_ORGANICS_OWNER_EMAIL ?? "owner@vcorganics.com";
  const userOwner = await prisma.user.upsert({
    where: { email: ownerEmail.toLowerCase() },
    create: {
      email: ownerEmail.toLowerCase(),
      passwordHash: await argon2.hash(bootstrapPassword),
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  const userHrAdmin = await prisma.user.upsert({
    where: { email: "hradmin@vcorganics.com" },
    create: {
      email: "hradmin@vcorganics.com",
      passwordHash: await argon2.hash(bootstrapPassword),
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  const userLead = await prisma.user.upsert({
    where: { email: "techlead@vcorganics.com" },
    create: {
      email: "techlead@vcorganics.com",
      passwordHash: await argon2.hash(bootstrapPassword),
      status: "ACTIVE"
    },
    update: { status: "ACTIVE" }
  });

  // Memberships
  const memberOwner = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: userOwner.id } },
    create: { tenantId: tenant.id, userId: userOwner.id, status: "ACTIVE" },
    update: { status: "ACTIVE" }
  });

  const memberHr = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: userHrAdmin.id } },
    create: { tenantId: tenant.id, userId: userHrAdmin.id, status: "ACTIVE" },
    update: { status: "ACTIVE" }
  });

  const memberLead = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: userLead.id } },
    create: { tenantId: tenant.id, userId: userLead.id, status: "ACTIVE" },
    update: { status: "ACTIVE" }
  });

  // Assign Roles
  const roleOwner = await prisma.role.findUniqueOrThrow({ where: { tenantId_code: { tenantId: tenant.id, code: "TENANT_OWNER" } } });
  const roleHr = await prisma.role.findUniqueOrThrow({ where: { tenantId_code: { tenantId: tenant.id, code: "HR_ADMIN" } } });
  const roleMgr = await prisma.role.findUniqueOrThrow({ where: { tenantId_code: { tenantId: tenant.id, code: "MANAGER" } } });

  await prisma.tenantMembershipRole.createMany({
    data: [
      { tenantId: tenant.id, membershipId: memberOwner.id, roleId: roleOwner.id },
      { tenantId: tenant.id, membershipId: memberHr.id, roleId: roleHr.id },
      { tenantId: tenant.id, membershipId: memberLead.id, roleId: roleMgr.id }
    ],
    skipDuplicates: true
  });

  // Create Employee Profiles
  const empOwner = await prisma.employee.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: "VC-0001" } },
    create: {
      tenantId: tenant.id,
      userId: userOwner.id,
      employeeCode: "VC-0001",
      firstName: "Avanish",
      lastName: "Rai",
      fullName: "Avanish Rai",
      email: ownerEmail.toLowerCase(),
      phone: "+919876543210",
      status: EmployeeStatus.ACTIVE,
      employmentType: EmploymentType.FULL_TIME,
      joiningDate: new Date("2022-01-01"),
      departmentId: deptEng.id,
      designationId: desigCeo.id,
      locationId: locHq.id
    },
    update: { status: EmployeeStatus.ACTIVE }
  });

  const empHr = await prisma.employee.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: "VC-0002" } },
    create: {
      tenantId: tenant.id,
      userId: userHrAdmin.id,
      employeeCode: "VC-0002",
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma",
      email: "hradmin@vcorganics.com",
      phone: "+919812345678",
      status: EmployeeStatus.ACTIVE,
      employmentType: EmploymentType.FULL_TIME,
      joiningDate: new Date("2023-03-15"),
      departmentId: deptHr.id,
      designationId: desigHrLead.id,
      locationId: locHq.id,
      managerId: empOwner.id
    },
    update: { status: EmployeeStatus.ACTIVE }
  });

  const empLead = await prisma.employee.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: "VC-0003" } },
    create: {
      tenantId: tenant.id,
      userId: userLead.id,
      employeeCode: "VC-0003",
      firstName: "Rohit",
      lastName: "Verma",
      fullName: "Rohit Verma",
      email: "techlead@vcorganics.com",
      phone: "+919765432109",
      status: EmployeeStatus.ACTIVE,
      employmentType: EmploymentType.FULL_TIME,
      joiningDate: new Date("2023-06-01"),
      departmentId: deptEng.id,
      designationId: desigArch.id,
      locationId: locHq.id,
      managerId: empOwner.id
    },
    update: { status: EmployeeStatus.ACTIVE }
  });

  // 9. Seed Facilities (Meeting Rooms & Parking)
  await prisma.meetingRoom.createMany({
    data: [
      { tenantId: tenant.id, name: "Boardroom Alpha", capacity: 20, floor: "Floor 4", building: "Building 1", isActive: true },
      { tenantId: tenant.id, name: "Innovation Bay 1", capacity: 8, floor: "Floor 3", building: "Building 1", isActive: true },
      { tenantId: tenant.id, name: "Design Studio Hub", capacity: 12, floor: "Floor 3", building: "Building 1", isActive: true }
    ],
    skipDuplicates: true
  });

  await prisma.parkingSlot.createMany({
    data: [
      { tenantId: tenant.id, slotNumber: "P-4W-01", vehicleType: "FOUR_WHEELER", isAssigned: true, assignedToName: "Avanish Rai", assignedVehicleNo: "KA-01-MJ-9999" },
      { tenantId: tenant.id, slotNumber: "P-4W-02", vehicleType: "FOUR_WHEELER", isAssigned: true, assignedToName: "Priya Sharma", assignedVehicleNo: "KA-03-AB-1234" },
      { tenantId: tenant.id, slotNumber: "P-EV-01", vehicleType: "EV_CHARGING", isAssigned: false }
    ],
    skipDuplicates: true
  });

  // 10. Seed Vendor & Contractors
  const vendor = await prisma.vendor.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "VND-APX-01" } },
    create: {
      tenantId: tenant.id,
      code: "VND-APX-01",
      name: "Apex Logistics & Staffing Pvt Ltd",
      gstin: "27ABCDE1234F1Z5",
      pan: "ABCDE1234F",
      isActive: true
    },
    update: { isActive: true }
  });

  await prisma.vendorContract.createMany({
    data: [
      {
        tenantId: tenant.id,
        vendorId: vendor.id,
        contractNumber: "CNT-APX-2026-01",
        title: "Master Staffing & Security Services MSA",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
        valueInInr: 12000000,
        status: "ACTIVE",
        slaRating: 4.8
      }
    ],
    skipDuplicates: true
  });

  await prisma.contractor.createMany({
    data: [
      {
        tenantId: tenant.id,
        contractCode: "CON-001",
        companyName: "Apex Logistics",
        contactPerson: "Ramesh Sharma",
        phone: "+919876500001",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
        totalWorkers: 15,
        status: "ACTIVE"
      }
    ],
    skipDuplicates: true
  });

  // 11. Seed Assets
  await prisma.asset.createMany({
    data: [
      {
        tenantId: tenant.id,
        assetCode: "AST-LAP-001",
        serialNumber: "C02XYZ12345",
        name: 'MacBook Pro 16" M3 Max',
        category: AssetCategory.LAPTOP,
        purchaseDate: new Date("2024-01-15"),
        purchaseCost: 285000,
        currency: "INR",
        condition: AssetCondition.BRAND_NEW,
        status: AssetStatus.ASSIGNED,
        currentHolderId: empOwner.id
      },
      {
        tenantId: tenant.id,
        assetCode: "AST-LAP-002",
        serialNumber: "DL987654321",
        name: "Dell XPS 15 9530",
        category: AssetCategory.LAPTOP,
        purchaseDate: new Date("2024-03-10"),
        purchaseCost: 175000,
        currency: "INR",
        condition: AssetCondition.GOOD,
        status: AssetStatus.AVAILABLE
      }
    ],
    skipDuplicates: true
  });

  // 12. Seed Company Policies
  await prisma.companyPolicy.createMany({
    data: [
      {
        tenantId: tenant.id,
        code: "POL-COC-01",
        title: "Code of Conduct, Ethics & Anti-Bribery Policy",
        category: "COMPLIANCE",
        version: "2.1",
        description: "Official behavioral guidelines and professional standards for all VC Organics personnel.",
        content: "All employees and contractors must strictly adhere to the highest standards of integrity, data privacy, and ethical conduct.",
        isPublished: true,
        publishedAt: new Date("2026-01-01")
      },
      {
        tenantId: tenant.id,
        code: "POL-LEAVE-01",
        title: "Comprehensive Annual & Sick Leave Policy",
        category: "HUMAN_RESOURCES",
        version: "3.0",
        description: "Annual leave accrual, carry-forward rules, casual leave, and maternity/paternity guidelines.",
        content: "Employees accrue 1.75 days of paid annual leave per month with up to 45 days lifetime carry-forward limit.",
        isPublished: true,
        publishedAt: new Date("2026-01-01")
      }
    ],
    skipDuplicates: true
  });

  console.log("🎉 Enterprise Seed Complete! VC Organics HRMS is 100% Production Ready.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error("❌ Seed Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
