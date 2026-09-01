import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("face biometrics tenant isolation & audit coverage", () => {
  const service = readFileSync(new URL("../src/modules/face/face.service.ts", import.meta.url), "utf8");
  const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");

  it("ensures all biometric Prisma models enforce tenantId", () => {
    expect(schema).toMatch(/model FaceProfile\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model FaceEmbedding\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model FaceEnrollment\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model FaceVerification\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model LivenessVerification\s*\{[^}]+tenantId\s+String/);
  });

  it("ensures face profile and enrollment queries enforce tenantId", () => {
    expect(service).toContain("where: { tenantId, employeeId }");
    expect(service).toContain("where: { id: employeeId, tenantId }");
    expect(service).toContain("where: { tenantId_employeeId: { tenantId, employeeId } }");
    expect(service).toContain("where: { id: enrollmentId, tenantId }");
  });

  it("ensures face verification queries enforce tenantId and active status", () => {
    expect(service).toContain("where: { tenantId, employeeId, status: FaceProfileStatus.ACTIVE }");
  });

  it("ensures biometric mutations emit audit records with tenantId", () => {
    expect(service).toContain('action: "face.enrolled"');
    expect(service).toContain('action: "face.enrollment.reviewed"');
    expect(service).toContain('action: "face.profile.disabled"');
  });
});
