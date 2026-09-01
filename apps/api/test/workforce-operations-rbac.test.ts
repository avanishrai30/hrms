import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission } from "@vc-wms/auth";

describe("TASK 29 — Workforce Operations & Attendance RBAC", () => {
  it("should grant full workforce operations permissions to TENANT_OWNER and TENANT_ADMIN", () => {
    const ownerPerms = collectPermissions(["TENANT_OWNER"]);
    const adminPerms = collectPermissions(["TENANT_ADMIN"]);

    expect(hasPermission(ownerPerms, "workforce.operations.view")).toBe(true);
    expect(hasPermission(ownerPerms, "workforce.operations.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.shifts.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.biometric.sync")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.devices.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.geofence.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.overtime.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.anomalies.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.contractors.manage")).toBe(true);
    expect(hasPermission(ownerPerms, "attendance.scheduling.manage")).toBe(true);

    expect(hasPermission(adminPerms, "workforce.operations.view")).toBe(true);
    expect(hasPermission(adminPerms, "attendance.devices.manage")).toBe(true);
  });

  it("should grant shift, overtime, and anomaly operational permissions to HR_ADMIN", () => {
    const hrPerms = collectPermissions(["HR_ADMIN"]);

    expect(hasPermission(hrPerms, "workforce.operations.view")).toBe(true);
    expect(hasPermission(hrPerms, "attendance.shifts.manage")).toBe(true);
    expect(hasPermission(hrPerms, "attendance.overtime.manage")).toBe(true);
    expect(hasPermission(hrPerms, "attendance.anomalies.manage")).toBe(true);
    expect(hasPermission(hrPerms, "attendance.contractors.manage")).toBe(true);
  });

  it("should grant operational shift view and scheduling to MANAGER role", () => {
    const mgrPerms = collectPermissions(["MANAGER"]);

    expect(hasPermission(mgrPerms, "workforce.operations.view")).toBe(true);
    expect(hasPermission(mgrPerms, "attendance.shifts.manage")).toBe(true);
    expect(hasPermission(mgrPerms, "attendance.overtime.manage")).toBe(true);
    expect(hasPermission(mgrPerms, "attendance.scheduling.manage")).toBe(true);
    expect(hasPermission(mgrPerms, "attendance.devices.manage")).toBe(false);
    expect(hasPermission(mgrPerms, "attendance.biometric.sync")).toBe(false);
  });

  it("should restrict workforce operations management from EMPLOYEE role", () => {
    const empPerms = collectPermissions(["EMPLOYEE"]);

    expect(hasPermission(empPerms, "workforce.operations.view")).toBe(false);
    expect(hasPermission(empPerms, "workforce.operations.manage")).toBe(false);
    expect(hasPermission(empPerms, "attendance.devices.manage")).toBe(false);
    expect(hasPermission(empPerms, "attendance.anomalies.manage")).toBe(false);
  });
});
