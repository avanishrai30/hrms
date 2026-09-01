import { collectPermissions, hasPermission } from "@vc-wms/auth";
import { describe, expect, it } from "vitest";

describe("Compliance RBAC Permissions", () => {
  it("grants full compliance management permissions to TENANT_OWNER, TENANT_ADMIN, and HR_ADMIN", () => {
    const roles = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN"] as const;

    for (const role of roles) {
      const perms = collectPermissions([role]);
      expect(hasPermission(perms, "compliance.view")).toBe(true);
      expect(hasPermission(perms, "compliance.manage")).toBe(true);
      expect(hasPermission(perms, "compliance.report")).toBe(true);
      expect(hasPermission(perms, "compliance.audit")).toBe(true);
    }
  });

  it("grants view and report permissions to MANAGER", () => {
    const managerPerms = collectPermissions(["MANAGER"]);
    expect(hasPermission(managerPerms, "compliance.view")).toBe(true);
    expect(hasPermission(managerPerms, "compliance.report")).toBe(true);
    expect(hasPermission(managerPerms, "compliance.manage")).toBe(false);
    expect(hasPermission(managerPerms, "compliance.audit")).toBe(false);
  });

  it("grants only view permissions to EMPLOYEE", () => {
    const empPerms = collectPermissions(["EMPLOYEE"]);
    expect(hasPermission(empPerms, "compliance.view")).toBe(true);
    expect(hasPermission(empPerms, "compliance.report")).toBe(false);
    expect(hasPermission(empPerms, "compliance.manage")).toBe(false);
    expect(hasPermission(empPerms, "compliance.audit")).toBe(false);
  });
});
