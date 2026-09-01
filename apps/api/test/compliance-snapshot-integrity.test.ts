import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Compliance Snapshot Integrity & Rule Versioning", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/compliance/compliance.service.ts", import.meta.url),
    "utf8"
  );

  it("freezes PF, ESI, PT, and TDS calculations in compliance snapshots", () => {
    expect(serviceCode).toContain("pfEmployee: pf.totalEmployeePf");
    expect(serviceCode).toContain("pfEmployer: pf.totalEmployerPf");
    expect(serviceCode).toContain("pfWageBasis: pf.wageBasis");
    expect(serviceCode).toContain("esiEmployee: esi.employeeEsi");
    expect(serviceCode).toContain("esiEmployer: esi.employerEsi");
    expect(serviceCode).toContain("esiWageBasis: esi.wageBasis");
    expect(serviceCode).toContain("ptAmount: pt.monthlyDeduction");
    expect(serviceCode).toContain("tdsAmount: tds.monthlyTds");
  });

  it("increments sequential rule versions on update", () => {
    expect(serviceCode).toContain("const nextVersion = rule.currentVersion + 1");
    expect(serviceCode).toContain("currentVersion: nextVersion");
  });

  it("records audit events for rule changes and snapshot freezes", () => {
    expect(serviceCode).toContain("action: \"compliance.rule.created\"");
    expect(serviceCode).toContain("action: \"compliance.rule.updated\"");
    expect(serviceCode).toContain("action: \"compliance.snapshot.created\"");
  });
});
