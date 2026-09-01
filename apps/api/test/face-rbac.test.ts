import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("face biometrics server-side RBAC enforcement", () => {
  const controller = readFileSync(new URL("../src/modules/face/face.controller.ts", import.meta.url), "utf8");

  it("verifies all endpoints have explicit @RequirePermissions decorators", () => {
    expect(controller).toContain('@RequirePermissions("face.view")');
    expect(controller).toContain('@RequirePermissions("face.enroll")');
    expect(controller).toContain('@RequirePermissions("face.manage")');
    expect(controller).toContain('@RequirePermissions("face.verify")');
    expect(controller).toContain('@RequirePermissions("face.audit")');
  });

  it("verifies sensitive administrative actions require face.manage or face.audit", () => {
    expect(controller).toMatch(/@Patch\("enrollments\/:id\/review"\)\s+@RequirePermissions\("face\.manage"\)/);
    expect(controller).toMatch(/@Patch\("profiles\/:id\/disable"\)\s+@RequirePermissions\("face\.manage"\)/);
    expect(controller).toMatch(/@Get\("audit\/verifications"\)\s+@RequirePermissions\("face\.audit"\)/);
  });
});
