import { describe, expect, it } from "vitest";
import { GratuityEngine } from "../src/modules/payroll/engines/gratuity-engine.js";

describe("GratuityEngine (Task 30 - Payment of Gratuity Act 1972)", () => {
  it("should calculate gratuity with (15 * Basic * Years) / 26 for eligible service (>= 5 years)", () => {
    const res = GratuityEngine.calculateGratuity({
      dateOfJoining: new Date("2020-01-01"),
      dateOfLeaving: new Date("2026-01-01"), // 6 years
      lastDrawnBasicSalary: 52000,
      lastDrawnDa: 0
    });

    expect(res.isEligible).toBe(true);
    expect(res.completedYearsForGratuity).toBe(6);
    // (15 * 52000 * 6) / 26 = 180,000
    expect(res.gratuityGrossCalculated).toBe(180000);
    expect(res.gratuityTaxExemptAmount).toBe(180000);
    expect(res.gratuityTaxableAmount).toBe(0);
  });

  it("should return zero gratuity for ineligible tenure (< 5 years) unless death/disablement", () => {
    const res = GratuityEngine.calculateGratuity({
      dateOfJoining: new Date("2023-01-01"),
      dateOfLeaving: new Date("2026-01-01"), // 3 years
      lastDrawnBasicSalary: 60000
    });

    expect(res.isEligible).toBe(false);
    expect(res.netGratuityPayable).toBe(0);
  });

  it("should waive 5-year requirement in case of disablement / death", () => {
    const res = GratuityEngine.calculateGratuity({
      dateOfJoining: new Date("2024-01-01"),
      dateOfLeaving: new Date("2026-01-01"), // 2 years
      lastDrawnBasicSalary: 52000,
      isSeparationDueToDeathOrDisablement: true
    });

    expect(res.isEligible).toBe(true);
    expect(res.gratuityGrossCalculated).toBe(60000); // (15 * 52000 * 2) / 26
  });
});
