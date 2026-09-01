import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("locations RBAC & server-side authorization", () => {
  const controller = readFileSync(new URL("../src/modules/locations/locations.controller.ts", import.meta.url), "utf8");

  it("enforces server-side permissions on every location endpoint", () => {
    const requiredPermissions = [
      "location.view",
      "location.create",
      "location.update",
      "location.assign",
      "location.override",
      "location.audit"
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
