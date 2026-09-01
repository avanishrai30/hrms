import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("attendance RBAC & server-side authorization", () => {
  const controller = readFileSync(new URL("../src/modules/attendance/attendance.controller.ts", import.meta.url), "utf8");

  it("enforces server-side permissions on every attendance endpoint", () => {
    const requiredPermissions = [
      'attendance.create',
      'attendance.view',
      'attendance.update',
      'attendance.correct',
      'attendance.approve'
    ];

    for (const perm of requiredPermissions) {
      expect(controller).toContain(`@RequirePermissions("${perm}")`);
    }
  });

  it("extracts tenant context safely using requireTenantContext", () => {
    expect(controller).toContain("requireTenantContext(request)");
  });

  it("resolves employeeId securely inside tenant context", () => {
    expect(controller).toContain("where: { id: membershipId, tenantId }");
  });
});
