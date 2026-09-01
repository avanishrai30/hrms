import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Compensation RBAC Enforcement", () => {
  const controllerCode = readFileSync(
    new URL("../src/modules/compensation/compensation.controller.ts", import.meta.url),
    "utf8"
  );

  it("enforces compensation.view on read and preview endpoints", () => {
    expect(controllerCode).toContain('@RequirePermissions("compensation.view")\n  async listComponents');
    expect(controllerCode).toContain('@RequirePermissions("compensation.view")\n  async listTemplates');
    expect(controllerCode).toContain('@RequirePermissions("compensation.view")\n  async calculatePreview');
    expect(controllerCode).toContain('@RequirePermissions("compensation.view")\n  async listAllCompensations');
    expect(controllerCode).toContain('@RequirePermissions("compensation.view")\n  async getMyCompensation');
  });

  it("enforces compensation.manage on component and template creation/updates", () => {
    expect(controllerCode).toContain('@RequirePermissions("compensation.manage")\n  async createComponent');
    expect(controllerCode).toContain('@RequirePermissions("compensation.manage")\n  async updateComponent');
    expect(controllerCode).toContain('@RequirePermissions("compensation.manage")\n  async createTemplate');
    expect(controllerCode).toContain('@RequirePermissions("compensation.manage")\n  async updateTemplate');
  });

  it("enforces compensation.manage on salary assignment and revision", () => {
    expect(controllerCode).toContain('@RequirePermissions("compensation.manage")\n  async assignCompensation');
    expect(controllerCode).toContain('@RequirePermissions("compensation.manage")\n  async reviseCompensation');
  });

  it("enforces compensation.audit on audit endpoint", () => {
    expect(controllerCode).toContain('@RequirePermissions("compensation.audit")\n  async getAuditLogs');
  });
});
