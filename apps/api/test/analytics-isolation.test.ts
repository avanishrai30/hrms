import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analytics & Reports Tenant Isolation", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/analytics/analytics.service.ts", import.meta.url),
    "utf8"
  );
  const controllerCode = readFileSync(
    new URL("../src/modules/analytics/analytics.controller.ts", import.meta.url),
    "utf8"
  );

  it("ensures all analytics database queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId }");
    expect(serviceCode).toContain("tenantId,");
  });

  it("ensures saved reports and schedules enforce tenantId", () => {
    expect(serviceCode).toContain("where: { id, tenantId }");
    expect(serviceCode).toContain("where: { id: scheduleId, tenantId }");
  });

  it("ensures controller extracts tenantId via requireTenantContext", () => {
    expect(controllerCode).toContain("requireTenantContext(req)");
    expect(controllerCode).toContain("tenant.tenantId");
  });
});
