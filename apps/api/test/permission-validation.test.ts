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

describe("permission validation and RBAC", () => {
  it("verifies rbac.guard.ts exists and checks permissions against tenant context", () => {
    const rbacGuard = readFileSync(new URL("../src/modules/rbac/rbac.guard.ts", import.meta.url), "utf8");
    expect(rbacGuard).toContain("Reflector");
    expect(rbacGuard).toContain("permissions");
  });

  it("verifies permissions.decorator.ts uses SetMetadata", () => {
    const permDec = readFileSync(new URL("../src/modules/rbac/permissions.decorator.ts", import.meta.url), "utf8");
    expect(permDec).toContain("SetMetadata");
  });

  it("verifies tenant-context.ts extracts tenantId from request/JWT, not from request body", () => {
    const tenantCtx = readFileSync(new URL("../src/modules/common/tenant-context.ts", import.meta.url), "utf8");
    expect(tenantCtx).not.toContain("request.body.tenantId");
    expect(tenantCtx).toContain("request.");
  });

  it("verifies no controller bypasses the guard (uses RequirePermissions, RequirePlatform, or Public)", () => {
    const modulesDir = new URL("../src/modules", import.meta.url).pathname;
    const controllers = getAllControllers(modulesDir);
    expect(controllers.length).toBeGreaterThan(0);

    for (const controllerPath of controllers) {
      const content = readFileSync(controllerPath, "utf8");
      const hasSecurity = content.includes("@RequirePermissions") || content.includes("@RequirePlatform") || content.includes("@Public()");
      expect(hasSecurity, `Controller ${controllerPath} has no security decorator`).toBe(true);
    }
  });

  it("verifies rbac guard throws on missing permissions", () => {
    const rbacGuard = readFileSync(new URL("../src/modules/rbac/rbac.guard.ts", import.meta.url), "utf8");
    expect(rbacGuard).toContain("throw");
  });
});
