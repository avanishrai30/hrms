import { collectPermissions, hasPermission } from "@vc-wms/auth";
import { describe, expect, it } from "vitest";

describe("Analytics & Reporting RBAC Permissions", () => {
  it("grants full analytics and reporting permissions to TENANT_OWNER, TENANT_ADMIN, and HR_ADMIN", () => {
    const roles = ["TENANT_OWNER", "TENANT_ADMIN", "HR_ADMIN"] as const;

    for (const role of roles) {
      const perms = collectPermissions([role]);
      expect(hasPermission(perms, "analytics.view")).toBe(true);
      expect(hasPermission(perms, "analytics.manage")).toBe(true);
      expect(hasPermission(perms, "reports.view")).toBe(true);
      expect(hasPermission(perms, "reports.create")).toBe(true);
      expect(hasPermission(perms, "reports.export")).toBe(true);
      expect(hasPermission(perms, "reports.schedule")).toBe(true);
      expect(hasPermission(perms, "reports.audit")).toBe(true);
    }
  });

  it("grants view and export permissions to MANAGER", () => {
    const managerPerms = collectPermissions(["MANAGER"]);
    expect(hasPermission(managerPerms, "analytics.view")).toBe(true);
    expect(hasPermission(managerPerms, "reports.view")).toBe(true);
    expect(hasPermission(managerPerms, "reports.export")).toBe(true);
    expect(hasPermission(managerPerms, "analytics.manage")).toBe(false);
    expect(hasPermission(managerPerms, "reports.create")).toBe(false);
    expect(hasPermission(managerPerms, "reports.schedule")).toBe(false);
    expect(hasPermission(managerPerms, "reports.audit")).toBe(false);
  });

  it("grants only view permissions to EMPLOYEE", () => {
    const empPerms = collectPermissions(["EMPLOYEE"]);
    expect(hasPermission(empPerms, "analytics.view")).toBe(true);
    expect(hasPermission(empPerms, "reports.view")).toBe(false);
    expect(hasPermission(empPerms, "reports.export")).toBe(false);
    expect(hasPermission(empPerms, "reports.schedule")).toBe(false);
  });
});
