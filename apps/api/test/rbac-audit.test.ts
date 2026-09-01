import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function getAllControllers(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllControllers(fullPath));
    } else if (fullPath.endsWith(".controller.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("RBAC and security decorators", () => {
  it("ensures every controller uses @RequirePermissions or @RequirePlatform", () => {
    const modulesDir = new URL("../src/modules", import.meta.url).pathname;
    const controllers = getAllControllers(modulesDir);
    expect(controllers.length).toBeGreaterThan(0);

    for (const controllerPath of controllers) {
      const content = readFileSync(controllerPath, "utf8");
      // Either class-level or method-level or public
      const hasSecurity = content.includes("@RequirePermissions") || content.includes("@RequirePlatform") || content.includes("@Public()");
      expect(hasSecurity).toBe(true);
    }
  });

  it("verifies employees controller permissions", () => {
    const content = readFileSync(new URL("../src/modules/employees/employees.controller.ts", import.meta.url), "utf8");
    const perms = [
      "employees.read",
      "employees.create",
      "employees.update",
      "employees.status.update",
      "employees.archive",
      "employees.import",
      "employees.export",
      "employees.bulk.update",
      "documents.read",
      "documents.metadata.create",
      "documents.metadata.update"
    ];
    for (const p of perms) {
      expect(content).toContain(`@RequirePermissions("${p}")`);
    }
  });

  it("verifies tenants controller permissions", () => {
    const content = readFileSync(new URL("../src/modules/tenants/tenants.controller.ts", import.meta.url), "utf8");
    expect(content).toContain("@RequirePlatform()");
  });

  it("verifies tenant self-controller permissions", () => {
    const content = readFileSync(new URL("../src/modules/tenants/tenants.controller.ts", import.meta.url), "utf8");
    const perms = [
      "tenant.settings.read",
      "tenant.settings.update",
      "tenant.branding.read",
      "tenant.branding.update",
      "tenant.features.read",
      "tenant.features.update",
      "tenant.domains.read",
      "tenant.domains.update"
    ];
    for (const p of perms) {
      expect(content).toContain(`@RequirePermissions("${p}")`);
    }
  });

  it("verifies users controller permissions", () => {
    const content = readFileSync(new URL("../src/modules/users/users.controller.ts", import.meta.url), "utf8");
    const perms = [
      "users.read",
      "users.invite",
      "users.update",
      "users.deactivate",
      "users.reset_access",
      "roles.read",
      "roles.create",
      "roles.update",
      "permissions.read"
    ];
    for (const p of perms) {
      expect(content).toContain(`@RequirePermissions("${p}")`);
    }
  });

  it("verifies audit controller permissions", () => {
    const content = readFileSync(new URL("../src/modules/audit/audit.controller.ts", import.meta.url), "utf8");
    expect(content).toContain(`@RequirePermissions("audit.read")`);
  });
});
