import { describe, expect, it } from "vitest";
import { TdsProvider } from "./tds.provider.js";

describe("TdsProvider", () => {
  const provider = new TdsProvider();

  it("calculates New Tax Regime with ₹75,000 standard deduction and 87A rebate", () => {
    // Annual income ₹7,00,000 (taxable = 6,25,000 <= 7L -> rebate applies, tax = 0)
    const zeroTax = provider.calculate({
      annualEstimatedGross: 700000,
      regime: "NEW"
    });
    expect(zeroTax.standardDeduction).toBe(75000);
    expect(zeroTax.taxableIncome).toBe(625000);
    expect(zeroTax.totalAnnualTax).toBe(0);
    expect(zeroTax.monthlyTds).toBe(0);

    // Higher income ₹12,00,000 (taxable = 11,25,000)
    const taxable = provider.calculate({
      annualEstimatedGross: 1200000,
      regime: "NEW"
    });
    expect(taxable.standardDeduction).toBe(75000);
    expect(taxable.taxableIncome).toBe(1125000);
    expect(taxable.totalAnnualTax).toBeGreaterThan(0);
    expect(taxable.monthlyTds).toBeGreaterThan(0);
  });

  it("calculates Old Tax Regime with ₹50,000 standard deduction and 80C exemptions", () => {
    const oldResult = provider.calculate({
      annualEstimatedGross: 800000,
      regime: "OLD",
      declarations80C: 150000,
      declarations80D: 25000
    });

    expect(oldResult.standardDeduction).toBe(50000);
    expect(oldResult.totalExemptions).toBe(175000);
    expect(oldResult.taxableIncome).toBe(575000); // 800000 - 50000 - 175000
    expect(oldResult.totalAnnualTax).toBeGreaterThan(0);
  });
});
