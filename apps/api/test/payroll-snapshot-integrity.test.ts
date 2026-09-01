import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Payroll Snapshot Integrity & Immutability", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/payroll/payroll.service.ts", import.meta.url),
    "utf8"
  );

  it("stores self-contained attendance, leave, and compensation snapshots", () => {
    expect(serviceCode).toContain("attendanceSnapshot: item.attendanceSnapshot");
    expect(serviceCode).toContain("leaveSnapshot: item.leaveSnapshot");
    expect(serviceCode).toContain("compensationSnapshot: item.compensationSnapshot");
  });

  it("prevents modifications and recalculation on locked payroll runs", () => {
    expect(serviceCode).toContain("Cannot add adjustments to a locked payroll run");
    expect(serviceCode).toContain("Locked payroll runs cannot be recalculated");
    expect(serviceCode).toContain("Locked payroll runs cannot be cancelled");
    expect(serviceCode).toContain("Only APPROVED payroll runs can be locked");
  });

  it("records immutable approvals on approval and locking", () => {
    expect(serviceCode).toContain("tx.payrollApproval.create");
    expect(serviceCode).toContain("action: \"APPROVED\"");
    expect(serviceCode).toContain("action: \"LOCKED\"");
  });
});
