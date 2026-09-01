import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission } from "./index";

describe("tenant RBAC helpers", () => {
  it("collects unique permissions from tenant roles", () => {
    const permissions = collectPermissions(["HR_ADMIN", "MANAGER"]);

    expect(permissions).toContain("employees.create");
    expect(permissions).toContain("tenant.dashboard.read");
    expect(new Set(permissions).size).toBe(permissions.length);
  });

  it("checks permissions without role-name branching", () => {
    expect(hasPermission(["employees.read"], "employees.read")).toBe(true);
    expect(hasPermission(["employees.read"], "employees.archive")).toBe(false);
  });
});

