import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("locations tenant isolation & audit coverage", () => {
  const service = readFileSync(new URL("../src/modules/locations/locations.service.ts", import.meta.url), "utf8");
  const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");

  it("ensures all location Prisma models enforce tenantId", () => {
    expect(schema).toMatch(/model Location\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model LocationAssignment\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model LocationVerification\s*\{[^}]+tenantId\s+String/);
  });

  it("ensures location creation and queries enforce tenantId", () => {
    expect(service).toContain("where: { tenantId_code: { tenantId, code: input.code } }");
    expect(service).toContain("where: { id, tenantId }");
    expect(service).toContain("tenantId,");
  });

  it("ensures assignment queries enforce tenantId", () => {
    expect(service).toContain("where: { id: input.locationId, tenantId }");
    expect(service).toContain("where: { id: assignmentId, tenantId }");
    expect(service).toContain("where: { tenantId, locationId }");
  });

  it("ensures manual override enforces tenantId", () => {
    expect(service).toContain("where: { id: input.employeeId, tenantId }");
    expect(service).toContain("where: { id: input.locationId, tenantId }");
  });

  it("ensures location mutations emit audit records with tenantId", () => {
    expect(service).toContain('action: "location.created"');
    expect(service).toContain('action: "location.updated"');
    expect(service).toContain('action: "location.deactivated"');
    expect(service).toContain('action: "location.assigned"');
    expect(service).toContain('action: "location.assignment.removed"');
    expect(service).toContain('action: "location.override"');
  });
});
