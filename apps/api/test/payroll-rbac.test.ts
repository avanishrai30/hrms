import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Payroll RBAC Enforcement", () => {
  const controllerCode = readFileSync(
    new URL("../src/modules/payroll/payroll.controller.ts", import.meta.url),
    "utf8"
  );

  it("enforces payroll.view on query endpoints", () => {
    expect(controllerCode).toContain('@RequirePermissions("payroll.view")\n  async listPayrollRuns');
    expect(controllerCode).toContain('@RequirePermissions("payroll.view")\n  async getLatestPayrollRun');
    expect(controllerCode).toContain('@RequirePermissions("payroll.view")\n  async getPayrollRun');
    expect(controllerCode).toContain('@RequirePermissions("payroll.view")\n  async getEmployeePayroll');
    expect(controllerCode).toContain('@RequirePermissions("payroll.view")\n  async getMyPayroll');
  });

  it("enforces payroll.generate on generation, recalculation, and adjustments", () => {
    expect(controllerCode).toContain('@RequirePermissions("payroll.generate")\n  async generatePayrollRun');
    expect(controllerCode).toContain('@RequirePermissions("payroll.generate")\n  async recalculatePayrollRun');
    expect(controllerCode).toContain('@RequirePermissions("payroll.generate")\n  async addAdjustment');
    expect(controllerCode).toContain('@RequirePermissions("payroll.generate")\n  async removeAdjustment');
    expect(controllerCode).toContain('@RequirePermissions("payroll.generate")\n  async cancelPayrollRun');
  });

  it("enforces payroll.approve on approval endpoint", () => {
    expect(controllerCode).toContain('@RequirePermissions("payroll.approve")\n  async approvePayrollRun');
  });

  it("enforces payroll.lock on locking endpoint", () => {
    expect(controllerCode).toContain('@RequirePermissions("payroll.lock")\n  async lockPayrollRun');
  });

  it("enforces payroll.audit on audit endpoint", () => {
    expect(controllerCode).toContain('@RequirePermissions("payroll.audit")\n  async getPayrollAudit');
  });
});
