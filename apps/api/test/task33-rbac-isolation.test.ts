import { describe, it, expect } from "vitest";
import { collectPermissions, hasPermission } from "@vc-wms/auth";

describe("Task 33 Enterprise RBAC & Permissions Isolation", () => {
  it("grants full vendor, contractor, search, and executive intelligence permissions to TENANT_OWNER and TENANT_ADMIN", () => {
    const ownerPerms = collectPermissions(["TENANT_OWNER"]);
    const adminPerms = collectPermissions(["TENANT_ADMIN"]);

    expect(hasPermission(ownerPerms, "vendors.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "contractors.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "assets.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "visitors.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "facilities.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "search.global")).toBe(true);
    expect(hasPermission(ownerPerms, "executive.intelligence")).toBe(true);
    expect(hasPermission(ownerPerms, "system.health")).toBe(true);

    expect(hasPermission(adminPerms, "vendors.manage")).toBe(true);
    expect(hasPermission(adminPerms, "executive.intelligence")).toBe(true);
  });

  it("grants HR_ADMIN vendor, contractor, search, and executive permissions", () => {
    const hrPerms = collectPermissions(["HR_ADMIN"]);

    expect(hasPermission(hrPerms, "vendors.manage")).toBe(true);
    expect(hasPermission(hrPerms, "contractors.manage")).toBe(true);
    expect(hasPermission(hrPerms, "assets.manage")).toBe(true);
    expect(hasPermission(hrPerms, "search.global")).toBe(true);
    expect(hasPermission(hrPerms, "executive.intelligence")).toBe(true);
  });

  it("restricts EMPLOYEE from administrative vendor, contractor, and executive controls while allowing search.global and ess.read", () => {
    const empPerms = collectPermissions(["EMPLOYEE"]);

    expect(hasPermission(empPerms, "search.global")).toBe(true);
    expect(hasPermission(empPerms, "ess.read")).toBe(true);

    expect(hasPermission(empPerms, "vendors.manage")).toBe(false);
    expect(hasPermission(empPerms, "contractors.manage")).toBe(false);
    expect(hasPermission(empPerms, "executive.intelligence")).toBe(false);
    expect(hasPermission(empPerms, "system.health")).toBe(false);
  });
});
