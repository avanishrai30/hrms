import { collectPermissions, hasPermission } from "@vc-wms/auth";
import { describe, expect, it } from "vitest";

describe("Payslips RBAC Permissions", () => {
  it("grants full payslip lifecycle permissions to TENANT_OWNER, TENANT_ADMIN, and HR_ADMIN", () => {
    const roles = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN"] as const;

    for (const role of roles) {
      const perms = collectPermissions([role]);
      expect(hasPermission(perms, "payslip.view")).toBe(true);
      expect(hasPermission(perms, "payslip.generate")).toBe(true);
      expect(hasPermission(perms, "payslip.distribute")).toBe(true);
      expect(hasPermission(perms, "payslip.audit")).toBe(true);
    }
  });

  it("grants only payslip.view to EMPLOYEE and MANAGER", () => {
    const employeePerms = collectPermissions(["EMPLOYEE"]);
    expect(hasPermission(employeePerms, "payslip.view")).toBe(true);
    expect(hasPermission(employeePerms, "payslip.generate")).toBe(false);
    expect(hasPermission(employeePerms, "payslip.distribute")).toBe(false);
    expect(hasPermission(employeePerms, "payslip.audit")).toBe(false);

    const managerPerms = collectPermissions(["MANAGER"]);
    expect(hasPermission(managerPerms, "payslip.view")).toBe(true);
    expect(hasPermission(managerPerms, "payslip.generate")).toBe(false);
    expect(hasPermission(managerPerms, "payslip.distribute")).toBe(false);
    expect(hasPermission(managerPerms, "payslip.audit")).toBe(false);
  });
});
