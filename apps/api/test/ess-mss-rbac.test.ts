import { describe, expect, it } from "vitest";
import { ROLE_PERMISSIONS, hasPermission } from "@vc-wms/auth";

describe("ESS & MSS RBAC Authorization", () => {
  it("EMPLOYEE should have access to ess.read and standard self-service actions", () => {
    const employeePerms = ROLE_PERMISSIONS.EMPLOYEE;
    expect(hasPermission(employeePerms, "ess.read")).toBe(true);
    expect(hasPermission(employeePerms, "profile.view")).toBe(true);
    expect(hasPermission(employeePerms, "requests.create")).toBe(true);
    expect(hasPermission(employeePerms, "helpdesk.view")).toBe(true);
    // Should NOT have manager self service
    expect(hasPermission(employeePerms, "mss.read")).toBe(false);
    expect(hasPermission(employeePerms, "mss.manage")).toBe(false);
  });

  it("MANAGER should have mss.read, mss.manage, letters.generate, and team approval capabilities", () => {
    const managerPerms = ROLE_PERMISSIONS.MANAGER;
    expect(hasPermission(managerPerms, "ess.read")).toBe(true);
    expect(hasPermission(managerPerms, "mss.read")).toBe(true);
    expect(hasPermission(managerPerms, "mss.manage")).toBe(true);
    expect(hasPermission(managerPerms, "letters.generate")).toBe(true);
    expect(hasPermission(managerPerms, "leave.approve")).toBe(true);
    expect(hasPermission(managerPerms, "attendance.approve")).toBe(true);
  });

  it("HR_ADMIN and TENANT_ADMIN should have full access to shared services analytics, letters, and communications", () => {
    const hrPerms = ROLE_PERMISSIONS.HR_ADMIN;
    expect(hasPermission(hrPerms, "ess.read")).toBe(true);
    expect(hasPermission(hrPerms, "ess.manage")).toBe(true);
    expect(hasPermission(hrPerms, "mss.read")).toBe(true);
    expect(hasPermission(hrPerms, "mss.manage")).toBe(true);
    expect(hasPermission(hrPerms, "letters.generate")).toBe(true);
    expect(hasPermission(hrPerms, "communications.manage")).toBe(true);
    expect(hasPermission(hrPerms, "servicedelivery.analytics")).toBe(true);
  });
});
