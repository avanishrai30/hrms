import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Payslips Tenant Isolation", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/payslips/payslips.service.ts", import.meta.url),
    "utf8"
  );
  const controllerCode = readFileSync(
    new URL("../src/modules/payslips/payslips.controller.ts", import.meta.url),
    "utf8"
  );

  it("ensures all payslip queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { id: payrollRunId, tenantId }");
    expect(serviceCode).toContain("where: { id: payrollRunEmployeeId, tenantId }");
    expect(serviceCode).toContain("where: { id: payslipId, tenantId }");
    expect(serviceCode).toContain("where: {\n        id: { in: input.payslipIds },\n        tenantId\n      }");
  });

  it("ensures storage paths are strictly prefixed with tenantId", () => {
    expect(serviceCode).toContain("`${tenantId}/payslips/${run.year}/${run.month}/${runEmp.employeeId}/v${version}.pdf`");
  });

  it("ensures controller extracts tenantId via requireTenantContext", () => {
    expect(controllerCode).toContain("requireTenantContext(req)");
    expect(controllerCode).toContain("tenant.tenantId");
  });
});
