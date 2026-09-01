import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission } from "@vc-wms/auth";

describe("Performance RBAC & Permissions (Task 21)", () => {
  it("grants full performance permissions to TENANT_OWNER and TENANT_ADMIN", () => {
    const ownerPerms = collectPermissions(["TENANT_OWNER"]);
    const adminPerms = collectPermissions(["TENANT_ADMIN"]);

    expect(hasPermission(ownerPerms, "performance.view")).toBe(true);
    expect(hasPermission(ownerPerms, "performance.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "performance.review")).toBe(true);
    expect(hasPermission(ownerPerms, "performance.calibration")).toBe(true);
    expect(hasPermission(ownerPerms, "performance.analytics")).toBe(true);
    expect(hasPermission(ownerPerms, "performance.succession")).toBe(true);

    expect(hasPermission(adminPerms, "performance.view")).toBe(true);
    expect(hasPermission(adminPerms, "performance.manage")).toBe(true);
    expect(hasPermission(adminPerms, "performance.calibration")).toBe(true);
  });

  it("grants management, calibration, and analytics to HR_ADMIN", () => {
    const hrPerms = collectPermissions(["HR_ADMIN"]);

    expect(hasPermission(hrPerms, "performance.view")).toBe(true);
    expect(hasPermission(hrPerms, "performance.manage")).toBe(true);
    expect(hasPermission(hrPerms, "performance.review")).toBe(true);
    expect(hasPermission(hrPerms, "performance.calibration")).toBe(true);
    expect(hasPermission(hrPerms, "performance.analytics")).toBe(true);
    expect(hasPermission(hrPerms, "performance.succession")).toBe(true);
  });

  it("grants review, view, analytics, and succession to MANAGER while restricting calibration and manage", () => {
    const managerPerms = collectPermissions(["MANAGER"]);

    expect(hasPermission(managerPerms, "performance.view")).toBe(true);
    expect(hasPermission(managerPerms, "performance.review")).toBe(true);
    expect(hasPermission(managerPerms, "performance.analytics")).toBe(true);
    expect(hasPermission(managerPerms, "performance.succession")).toBe(true);

    expect(hasPermission(managerPerms, "performance.manage")).toBe(false);
    expect(hasPermission(managerPerms, "performance.calibration")).toBe(false);
  });

  it("grants only self performance.view and performance.review to EMPLOYEE", () => {
    const employeePerms = collectPermissions(["EMPLOYEE"]);

    expect(hasPermission(employeePerms, "performance.view")).toBe(true);
    expect(hasPermission(employeePerms, "performance.review")).toBe(true);

    expect(hasPermission(employeePerms, "performance.manage")).toBe(false);
    expect(hasPermission(employeePerms, "performance.calibration")).toBe(false);
    expect(hasPermission(employeePerms, "performance.analytics")).toBe(false);
    expect(hasPermission(employeePerms, "performance.succession")).toBe(false);
  });
});
