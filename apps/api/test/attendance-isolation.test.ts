import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("attendance tenant isolation & audit coverage", () => {
  const service = readFileSync(new URL("../src/modules/attendance/attendance.service.ts", import.meta.url), "utf8");
  const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");

  it("ensures all attendance Prisma models enforce tenantId", () => {
    expect(schema).toMatch(/model Attendance\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model AttendanceEvent\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model AttendanceCorrection\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model AttendanceRule\s*\{[^}]+tenantId\s+String\s+@unique/);
    expect(schema).toMatch(/model AttendanceException\s*\{[^}]+tenantId\s+String/);
    expect(schema).toMatch(/model AttendanceSummary\s*\{[^}]+tenantId\s+String/);
  });

  it("ensures check-in and check-out queries are scoped by tenantId", () => {
    expect(service).toContain("where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } }");
    expect(service).toContain("create: {\n          tenantId,");
    expect(service).toContain("attendanceEvent.create({\n        data: {\n          tenantId,");
    expect(service).toContain("employeeTimelineEvent.create({\n        data: {\n          tenantId,");
  });

  it("ensures manual attendance and update queries enforce tenantId", () => {
    expect(service).toContain("where: { tenantId_employeeId_date: { tenantId, employeeId: input.employeeId, date } }");
    expect(service).toContain("where: { id, tenantId }");
  });

  it("ensures corrections workflow enforces tenantId", () => {
    expect(service).toContain("where: { id: correctionId, tenantId }");
    expect(service).toContain("where: {\n        tenantId,");
  });

  it("ensures attendance queries emit audit records with tenantId", () => {
    expect(service).toContain('action: "attendance.check_in"');
    expect(service).toContain('action: "attendance.check_out"');
    expect(service).toContain('action: "attendance.manual"');
    expect(service).toContain('action: "attendance.updated"');
    expect(service).toContain('action: "attendance.correction.requested"');
    expect(service).toContain('action: "attendance.correction.reviewed"');
    expect(service).toContain('action: "attendance.rules.updated"');
  });
});
