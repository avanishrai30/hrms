import { describe, expect, it } from "vitest";
import { ROLE_PERMISSIONS, hasPermission } from "@vc-wms/auth";

describe("AI Intelligence RBAC Tests (Task 19)", () => {
  it("should grant EMPLOYEE basic conversational AI and policy read permissions", () => {
    const employeePerms = ROLE_PERMISSIONS.EMPLOYEE;
    expect(hasPermission(employeePerms, "ai.chat")).toBe(true);
    expect(hasPermission(employeePerms, "ai.knowledge.read")).toBe(true);

    // Employee must NOT have manage or executive prediction permissions
    expect(hasPermission(employeePerms, "ai.knowledge.manage")).toBe(false);
    expect(hasPermission(employeePerms, "ai.prediction.read")).toBe(false);
    expect(hasPermission(employeePerms, "ai.insights.read")).toBe(false);
    expect(hasPermission(employeePerms, "ai.settings.manage")).toBe(false);
  });

  it("should grant MANAGER predictions, insights, and report generation permissions", () => {
    const managerPerms = ROLE_PERMISSIONS.MANAGER;
    expect(hasPermission(managerPerms, "ai.chat")).toBe(true);
    expect(hasPermission(managerPerms, "ai.knowledge.read")).toBe(true);
    expect(hasPermission(managerPerms, "ai.prediction.read")).toBe(true);
    expect(hasPermission(managerPerms, "ai.insights.read")).toBe(true);
    expect(hasPermission(managerPerms, "ai.reports.generate")).toBe(true);

    // Manager must NOT manage global AI settings
    expect(hasPermission(managerPerms, "ai.settings.manage")).toBe(false);
  });

  it("should grant HR_ADMIN full operational and policy management permissions", () => {
    const hrPerms = ROLE_PERMISSIONS.HR_ADMIN;
    expect(hasPermission(hrPerms, "ai.chat")).toBe(true);
    expect(hasPermission(hrPerms, "ai.knowledge.read")).toBe(true);
    expect(hasPermission(hrPerms, "ai.knowledge.manage")).toBe(true);
    expect(hasPermission(hrPerms, "ai.prediction.read")).toBe(true);
    expect(hasPermission(hrPerms, "ai.insights.read")).toBe(true);
    expect(hasPermission(hrPerms, "ai.documents.extract")).toBe(true);
    expect(hasPermission(hrPerms, "ai.reports.generate")).toBe(true);
    expect(hasPermission(hrPerms, "ai.settings.manage")).toBe(true);
  });

  it("should grant TENANT_ADMIN and TENANT_OWNER all AI capabilities", () => {
    for (const role of ["TENANT_ADMIN", "TENANT_OWNER"] as const) {
      const perms = ROLE_PERMISSIONS[role];
      expect(hasPermission(perms, "ai.chat")).toBe(true);
      expect(hasPermission(perms, "ai.knowledge.manage")).toBe(true);
      expect(hasPermission(perms, "ai.settings.manage")).toBe(true);
      expect(hasPermission(perms, "ai.prediction.read")).toBe(true);
    }
  });
});
