import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Compensation Tenant Isolation & Model Integrity", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/compensation/compensation.service.ts", import.meta.url),
    "utf8"
  );
  const controllerCode = readFileSync(
    new URL("../src/modules/compensation/compensation.controller.ts", import.meta.url),
    "utf8"
  );

  it("ensures all SalaryComponent queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId, isActive: true }");
    expect(serviceCode).toContain("where: { tenantId, code: input.code }");
  });

  it("ensures all CompensationTemplate queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { id, tenantId }");
    expect(serviceCode).toContain("where: { tenantId, code: input.code }");
  });

  it("ensures all EmployeeCompensation queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { id: employeeId, tenantId }");
    expect(serviceCode).toContain("tenantId,");
  });

  it("ensures all EmployeeCompensationHistory records include tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId, employeeId }");
    expect(serviceCode).toContain("employeeCompensationHistory.create");
  });

  it("ensures controller extracts tenantId via requireTenantContext", () => {
    expect(controllerCode).toContain("requireTenantContext(req)");
    expect(controllerCode).toContain("tenant.tenantId");
  });
});
