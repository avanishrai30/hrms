import { describe, expect, it } from "vitest";
import type { PermissionCode } from "@vc-wms/shared-types";
import { filterGroups, routeCommandItems } from "./navigation";

describe("permission-aware navigation", () => {
  it("hides admin surfaces from employee-level permissions", () => {
    const permissions: PermissionCode[] = ["tenant.dashboard.read", "profile.view", "requests.view", "attendance.view", "ai.assistant.view", "directory.view"];

    const labels = filterGroups(permissions).map((group) => group.label);

    expect(labels).toContain("People");
    expect(labels).toContain("Time");
    expect(labels).toContain("AI");
    expect(labels).not.toContain("Admin");
  });

  it("shows tenant administration only when tenant permissions exist", () => {
    const permissions: PermissionCode[] = ["tenant.dashboard.read", "tenant.settings.read", "tenant.branding.read", "roles.read", "users.read", "integrations.view"];

    const admin = filterGroups(permissions).find((group) => group.label === "Admin");

    expect(admin?.items.map((item) => item.label)).toEqual(["Tenant Settings", "Brand Settings", "Roles", "Users", "Integrations"]);
  });

  it("filters command routes by both permission and query", () => {
    const permissions: PermissionCode[] = ["employees.read", "directory.view"];

    const matches = routeCommandItems(permissions, "employee");

    expect(matches.map((item) => item.label)).toEqual(["Employees"]);
    expect(matches.some((item) => item.group === "Admin")).toBe(false);
  });
});
