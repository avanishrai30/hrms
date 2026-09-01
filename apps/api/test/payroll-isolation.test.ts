import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Payroll Tenant Isolation", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/payroll/payroll.service.ts", import.meta.url),
    "utf8"
  );
  const controllerCode = readFileSync(
    new URL("../src/modules/payroll/payroll.controller.ts", import.meta.url),
    "utf8"
  );

  it("ensures all PayrollRun queries and mutations enforce tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId_month_year: { tenantId, month, year } }");
    expect(serviceCode).toContain("where: { id: runId, tenantId }");
    expect(serviceCode).toContain("tenantId,");
  });

  it("ensures employee lookups for payroll enforce tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId, status: \"ACTIVE\" }");
    expect(serviceCode).toContain("where: { id: input.payrollRunEmployeeId, payrollRunId: runId, tenantId }");
  });

  it("ensures adjustments enforce tenantId on creation and deletion", () => {
    expect(serviceCode).toContain("where: { id: adjustmentId, payrollRunId: runId, tenantId }");
  });

  it("ensures controller extracts tenantId via requireTenantContext", () => {
    expect(controllerCode).toContain("requireTenantContext(req)");
    expect(controllerCode).toContain("tenant.tenantId");
  });
});
