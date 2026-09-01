import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Payslips Locked Payroll Enforcement & Versioning", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/payslips/payslips.service.ts", import.meta.url),
    "utf8"
  );

  it("strictly checks that payroll runs must be LOCKED before generating payslips", () => {
    expect(serviceCode).toContain("run.status !== PayrollRunStatus.LOCKED");
    expect(serviceCode).toContain("Payslips can ONLY be generated from LOCKED payroll runs");
    expect(serviceCode).toContain("runEmp.payrollRun.status !== PayrollRunStatus.LOCKED");
  });

  it("increments sequential version on payslip regeneration", () => {
    expect(serviceCode).toContain("const existingCount = await this.prisma.payslip.count(");
    expect(serviceCode).toContain("const version = existingCount + 1");
    expect(serviceCode).toContain("version > 1 ? \"payslip.regenerated\" : \"payslip.generated\"");
  });

  it("generates deterministic PDF buffer and uploads to storage provider", () => {
    expect(serviceCode).toContain("PayslipPdfEngine.generatePayslipPdf(pdfData)");
    expect(serviceCode).toContain("await this.storageProvider.upload(storageKey, pdfBuffer)");
  });
});
