import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission, ROLE_PERMISSIONS } from "@vc-wms/auth";

describe("ESS RBAC Permission Matrix (Task 18)", () => {
  it("grants EMPLOYEE self-service permissions for profile, documents, requests, announcements, and ID card", () => {
    const employeePerms = ROLE_PERMISSIONS.EMPLOYEE;

    expect(employeePerms).toContain("profile.view");
    expect(employeePerms).toContain("profile.update");
    expect(employeePerms).toContain("documents.view");
    expect(employeePerms).toContain("documents.upload");
    expect(employeePerms).toContain("requests.view");
    expect(employeePerms).toContain("requests.create");
    expect(employeePerms).toContain("announcements.view");
    expect(employeePerms).toContain("announcements.acknowledge");
    expect(employeePerms).toContain("directory.view");
    expect(employeePerms).toContain("idcard.view");

    // Must NOT have admin-only actions
    expect(employeePerms).not.toContain("documents.verify");
    expect(employeePerms).not.toContain("requests.manage");
    expect(employeePerms).not.toContain("announcements.manage");
  });

  it("grants MANAGER capability to manage employee requests and view team records", () => {
    const managerPerms = ROLE_PERMISSIONS.MANAGER;

    expect(managerPerms).toContain("profile.view");
    expect(managerPerms).toContain("requests.view");
    expect(managerPerms).toContain("requests.manage");
    expect(managerPerms).toContain("directory.view");
    expect(managerPerms).toContain("idcard.view");
  });

  it("grants HR_ADMIN full document verification and announcement publication permissions", () => {
    const hrPerms = ROLE_PERMISSIONS.HR_ADMIN;

    expect(hrPerms).toContain("documents.verify");
    expect(hrPerms).toContain("requests.manage");
    expect(hrPerms).toContain("announcements.manage");
    expect(hrPerms).toContain("profile.view");
    expect(hrPerms).toContain("profile.update");
  });

  it("evaluates permission checks correctly using hasPermission and collectPermissions", () => {
    const perms = collectPermissions(["EMPLOYEE"]);
    expect(hasPermission(perms, "profile.view")).toBe(true);
    expect(hasPermission(perms, "documents.verify")).toBe(false);

    const adminPerms = collectPermissions(["HR_ADMIN"]);
    expect(hasPermission(adminPerms, "documents.verify")).toBe(true);
    expect(hasPermission(adminPerms, "announcements.manage")).toBe(true);
  });
});
