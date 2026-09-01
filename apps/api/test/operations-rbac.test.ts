import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission } from "@vc-wms/auth";

describe("Operations, Assets & ITSM RBAC Permissions (Task 22)", () => {
  it("grants full operations permissions to TENANT_OWNER and TENANT_ADMIN", () => {
    const ownerPerms = collectPermissions(["TENANT_OWNER"]);
    const adminPerms = collectPermissions(["TENANT_ADMIN"]);

    const requiredPerms = [
      "assets.view",
      "assets.manage",
      "inventory.view",
      "inventory.manage",
      "helpdesk.view",
      "helpdesk.manage",
      "facilities.view",
      "facilities.manage",
      "visitor.view",
      "visitor.manage",
      "gatepass.manage",
      "clearance.manage",
      "analytics.operations"
    ] as const;

    for (const perm of requiredPerms) {
      expect(hasPermission(ownerPerms, perm)).toBe(true);
      expect(hasPermission(adminPerms, perm)).toBe(true);
    }
  });

  it("grants HR_ADMIN full operational permissions", () => {
    const hrPerms = collectPermissions(["HR_ADMIN"]);
    expect(hasPermission(hrPerms, "assets.manage")).toBe(true);
    expect(hasPermission(hrPerms, "clearance.manage")).toBe(true);
    expect(hasPermission(hrPerms, "gatepass.manage")).toBe(true);
    expect(hasPermission(hrPerms, "analytics.operations")).toBe(true);
  });

  it("grants MANAGER appropriate operational permissions", () => {
    const managerPerms = collectPermissions(["MANAGER"]);
    expect(hasPermission(managerPerms, "assets.view")).toBe(true);
    expect(hasPermission(managerPerms, "helpdesk.view")).toBe(true);
    expect(hasPermission(managerPerms, "helpdesk.manage")).toBe(true);
    expect(hasPermission(managerPerms, "gatepass.manage")).toBe(true);
    expect(hasPermission(managerPerms, "clearance.manage")).toBe(true);
    expect(hasPermission(managerPerms, "assets.manage")).toBe(false);
  });

  it("restricts EMPLOYEE to view permissions and booking self-service", () => {
    const empPerms = collectPermissions(["EMPLOYEE"]);
    expect(hasPermission(empPerms, "assets.view")).toBe(true);
    expect(hasPermission(empPerms, "helpdesk.view")).toBe(true);
    expect(hasPermission(empPerms, "facilities.view")).toBe(true);
    expect(hasPermission(empPerms, "visitor.view")).toBe(true);
    expect(hasPermission(empPerms, "assets.manage")).toBe(false);
    expect(hasPermission(empPerms, "inventory.manage")).toBe(false);
    expect(hasPermission(empPerms, "clearance.manage")).toBe(false);
  });
});
