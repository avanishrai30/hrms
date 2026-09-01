import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission } from "@vc-wms/auth";

describe("TASK 28 — Workforce Planning RBAC & Authorization", () => {
  it("should grant full workforce management permissions to TENANT_OWNER and TENANT_ADMIN", () => {
    const ownerPerms = collectPermissions(["TENANT_OWNER"]);
    const adminPerms = collectPermissions(["TENANT_ADMIN"]);

    expect(hasPermission(ownerPerms, "workforce.view")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.positions.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.headcount.plan")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.orgdesign.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.succession.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.attrition.predict")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.analytics.view")).toBe(true);

    expect(hasPermission(adminPerms, "workforce.view")).toBe(true);
    expect(hasPermission(adminPerms, "workforce.headcount.plan")).toBe(true);
    expect(hasPermission(adminPerms, "workforce.succession.manage")).toBe(true);
  });

  it("should grant strategic workforce planning permissions to HR_ADMIN", () => {
    const hrPerms = collectPermissions(["HR_ADMIN"]);

    expect(hasPermission(hrPerms, "workforce.view")).toBe(true);
    expect(hasPermission(hrPerms, "workforce.manage")).toBe(true);
    expect(hasPermission(hrPerms, "workforce.positions.manage")).toBe(true);
    expect(hasPermission(hrPerms, "workforce.headcount.plan")).toBe(true);
    expect(hasPermission(hrPerms, "workforce.attrition.predict")).toBe(true);
    expect(hasPermission(hrPerms, "workforce.analytics.view")).toBe(true);
  });

  it("should grant department-level workforce view and succession permissions to MANAGER role", () => {
    const mgrPerms = collectPermissions(["MANAGER"]);

    expect(hasPermission(mgrPerms, "workforce.view")).toBe(true);
    expect(hasPermission(mgrPerms, "workforce.positions.manage")).toBe(true);
    expect(hasPermission(mgrPerms, "workforce.succession.manage")).toBe(true);
    expect(hasPermission(mgrPerms, "workforce.analytics.view")).toBe(true);
    expect(hasPermission(mgrPerms, "workforce.orgdesign.manage")).toBe(false);
    expect(hasPermission(mgrPerms, "workforce.attrition.predict")).toBe(false);
  });

  it("should restrict workforce planning and strategic HR permissions from EMPLOYEE role", () => {
    const empPerms = collectPermissions(["EMPLOYEE"]);

    expect(hasPermission(empPerms, "workforce.view")).toBe(false);
    expect(hasPermission(empPerms, "workforce.manage")).toBe(false);
    expect(hasPermission(empPerms, "workforce.positions.manage")).toBe(false);
    expect(hasPermission(empPerms, "workforce.headcount.plan")).toBe(false);
    expect(hasPermission(empPerms, "workforce.succession.manage")).toBe(false);
  });
});
