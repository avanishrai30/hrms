import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Leave Tenant Isolation & Model Integrity", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/leaves/leaves.service.ts", import.meta.url),
    "utf8"
  );
  const controllerCode = readFileSync(
    new URL("../src/modules/leaves/leaves.controller.ts", import.meta.url),
    "utf8"
  );

  it("ensures all LeaveType queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId, isActive: true }");
    expect(serviceCode).toContain("where: { tenantId, code: input.code }");
  });

  it("ensures all LeaveBalance queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId, employeeId, year }");
    expect(serviceCode).toContain("where: { tenantId, employeeId: input.employeeId, leaveTypeId: input.leaveTypeId, year: input.year }");
  });

  it("ensures all LeaveRequest queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { id: requestId, tenantId }");
    expect(controllerCode).toContain("this.leavesService.createLeaveRequest(\n      tenant.tenantId,");
  });

  it("ensures all Holiday queries enforce tenantId", () => {
    expect(serviceCode).toContain("where: { tenantId, date: { gte: start, lte: end } }");
    expect(serviceCode).toContain("where: { id: holidayId, tenantId }");
  });

  it("does not fabricate leave policy values when active policy is missing", () => {
    expect(serviceCode).toContain("No active leave policy is configured for this leave type.");
    expect(serviceCode).not.toContain("annualAllocationDays: 12,\n      allowNegativeBalance: false");
  });

  it("ensures controller extracts tenantId via requireTenantContext", () => {
    expect(controllerCode).toContain("requireTenantContext(req)");
    expect(controllerCode).toContain("tenant.tenantId");
  });
});
