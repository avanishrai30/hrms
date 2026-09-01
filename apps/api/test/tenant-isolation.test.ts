import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertTenantScopedPath, tenantCacheKey } from "@vc-wms/utils";

describe("tenant isolation foundations", () => {
  it("requires tenant IDs in cache keys", () => {
    expect(tenantCacheKey("tenant-a", "employees", "list")).toBe("tenant:tenant-a:employees:list");
  });

  it("rejects object keys from another tenant", () => {
    expect(() => assertTenantScopedPath("tenant-a", "tenants/tenant-b/documents/file")).toThrow(
      "Object key is outside the active tenant scope."
    );
  });

  it("keeps employee, document, timeline, and bulk reads tenant scoped", () => {
    const service = readFileSync(new URL("../src/modules/employees/employees.service.ts", import.meta.url), "utf8");

    expect(service).toContain("where: this.employeeWhere(tenantId, filters)");
    expect(service).toContain("where: { tenantId, employeeId }");
    expect(service).toContain("where: { id: documentId, tenantId, employeeId }");
    expect(service).toContain("where: { tenantId, id: { in: input.employeeIds } }");
    expect(service).toContain("assertTenantScopedPath(tenantId, input.objectKey)");
  });

  it("keeps users, roles, audit logs, settings, domains, and feature flags tenant scoped", () => {
    const users = readFileSync(new URL("../src/modules/users/users.service.ts", import.meta.url), "utf8");
    const tenants = readFileSync(new URL("../src/modules/tenants/tenants.service.ts", import.meta.url), "utf8");
    const audit = readFileSync(new URL("../src/modules/audit/audit.service.ts", import.meta.url), "utf8");

    expect(users).toContain("where: { id: membershipId, tenantId }");
    expect(users).toContain("where: { tenantId, code: { in: codes } }");
    expect(users).toContain("where: { id: employeeId, tenantId }");
    expect(tenants).toContain("where: { tenantId_key: { tenantId, key: input.key } }");
    expect(tenants).toContain("data: { tenantId, domain: input.domain.toLowerCase()");
    expect(audit).toContain("where: { tenantId }");
  });

  it("enforces authorization server-side on employee completion endpoints", () => {
    const controller = readFileSync(new URL("../src/modules/employees/employees.controller.ts", import.meta.url), "utf8");

    for (const permission of [
      "employees.read",
      "employees.create",
      "employees.update",
      "employees.status.update",
      "employees.archive",
      "employees.import",
      "employees.export",
      "employees.bulk.update",
      "documents.read",
      "documents.metadata.create",
      "documents.metadata.update"
    ]) {
      expect(controller).toContain(`@RequirePermissions("${permission}")`);
    }
  });
  it("keeps status history, timeline events, and imports tenant scoped", () => {
    const service = readFileSync(new URL("../src/modules/employees/employees.service.ts", import.meta.url), "utf8");
    expect(service).toContain("employeeStatusHistory.create({\n        data: {\n          tenantId,");
    expect(service).toContain("employeeTimelineEvent.create({\n        data: this.timelineData(tenantId");
    expect(service).toContain("employeeTimelineEvent.findMany({ where: { tenantId, employeeId }");
    expect(service).toContain("department.findMany({ where: { tenantId } });");
    expect(service).toContain("designation.findMany({ where: { tenantId } });");
    expect(service).toContain("employee.findMany({\n          where: { tenantId, OR: duplicateCandidates }");
  });

  it("keeps session queries and OTP challenges tenant scoped", () => {
    const auth = readFileSync(new URL("../src/modules/auth/auth.service.ts", import.meta.url), "utf8");
    expect(auth).toContain("session.create({\n      data: {\n        tenantId: membership.tenantId,");
    expect(auth).toContain("otpChallenge.create({\n      data: {\n        tenantId: tenant.id,");
  });

  it("ensures attendance-ready and SaaS models have tenantId fields", () => {
    const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
    expect(schema).toMatch(/model Shift\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model ShiftAssignment\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model WorkCalendar\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model HolidayCalendar\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model TenantSubscription\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model UsageMetric\s*\{[^}]+tenantId\s+String/);
  });
});
