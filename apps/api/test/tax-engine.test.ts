import { describe, expect, it } from "vitest";
import { TaxEngine } from "../src/modules/payroll/engines/tax-engine.js";

describe("TaxEngine (Task 30 - Indian Income Tax & TDS)", () => {
  it("should calculate New Tax Regime with ₹75,000 standard deduction and Rebate 87A for income <= ₹7L", () => {
    const res = TaxEngine.computeIncomeTaxAndTds({
      regime: "NEW",
      grossAnnualSalary: 700000,
      basicAnnualSalary: 350000,
      hraReceivedAnnual: 175000
    });

    expect(res.standardDeduction).toBe(75000);
    expect(res.netTaxableIncome).toBe(625000);
    expect(res.rebate87A).toBe(res.baseTaxBeforeCess);
    expect(res.totalAnnualTaxPayable).toBe(0);
    expect(res.monthlyTdsDeduction).toBe(0);
  });

  it("should compute New Regime tax correctly for higher income brackets", () => {
    const res = TaxEngine.computeIncomeTaxAndTds({
      regime: "NEW",
      grossAnnualSalary: 1800000,
      basicAnnualSalary: 900000,
      hraReceivedAnnual: 450000,
      remainingMonthsInFY: 12
    });

    expect(res.standardDeduction).toBe(75000);
    expect(res.netTaxableIncome).toBe(1725000);
    expect(res.totalAnnualTaxPayable).toBeGreaterThan(200000);
    expect(res.monthlyTdsDeduction).toBe(Math.round(res.totalAnnualTaxPayable / 12));
  });

  it("should calculate Old Tax Regime with HRA and 80C exemptions", () => {
    const hraExempt = TaxEngine.calculateHraExemption(600000, 300000, 240000, true);
    expect(hraExempt).toBe(180000); // 240,000 - 60,000 (10% basic) = 180,000

    const res = TaxEngine.computeIncomeTaxAndTds({
      regime: "OLD",
      grossAnnualSalary: 1500000,
      basicAnnualSalary: 600000,
      hraReceivedAnnual: 300000,
      rentPaidAnnual: 240000,
      isMetroCity: true,
      section80C: 150000,
      section80D: 25000,
      section24HomeLoanInterest: 200000,
      section80CCD_NPS: 50000
    });

    expect(res.standardDeduction).toBe(50000);
    expect(res.hraExemption).toBe(180000);
    expect(res.totalSection80CDeductions).toBe(425000);
    expect(res.totalExemptionsAndDeductions).toBe(655000);
    expect(res.netTaxableIncome).toBe(845000);
  });
});
