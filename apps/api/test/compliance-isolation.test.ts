import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Compliance Tenant Isolation", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/compliance/compliance.service.ts", import.meta.url),
    "utf8"
  );
  const controllerCode = readFileSync(
    new URL("../src/modules/compliance/compliance.controller.ts", import.meta.url),
    "utf8"
  );

  it("ensures all compliance rule queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: {\n        tenantId,");
    expect(serviceCode).toContain("where: { id: ruleId, tenantId }");
    expect(serviceCode).toContain("where: { tenantId_code: { tenantId, code: input.code } }");
  });

  it("ensures compliance snapshots enforce tenantId", () => {
    expect(serviceCode).toContain("where: { id: payrollRunId, tenantId }");
    expect(serviceCode).toContain("where: {\n        tenantId,");
    expect(serviceCode).toContain("tenantId,");
  });

  it("ensures controller extracts tenantId via requireTenantContext", () => {
    expect(controllerCode).toContain("requireTenantContext(req)");
    expect(controllerCode).toContain("tenant.tenantId");
  });
});
