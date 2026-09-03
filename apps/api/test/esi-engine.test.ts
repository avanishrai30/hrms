import { describe, expect, it } from "vitest";
import { EsiEngine } from "../src/modules/payroll/engines/esi-engine.js";

describe("EsiEngine (Task 30 - ESIC Statutory Calculation)", () => {
  it("should calculate ESI for wages under ₹21,000 ceiling", () => {
    const res = EsiEngine.calculateEsi({
      grossMonthlyWages: 20000,
      year: 2026,
      month: 4,
      jurisdiction: "IN"
    });

    expect(res.isEligible).toBe(true);
    expect(res.employeeEsiContribution).toBe(150); // 0.75% of 20,000
    expect(res.employerEsiContribution).toBe(650); // 3.25% of 20,000
    expect(res.totalMonthlyEsiDeposit).toBe(800);
  });

  it("should mark employee ineligible when gross wages exceed ₹21,000 ceiling", () => {
    const res = EsiEngine.calculateEsi({
      grossMonthlyWages: 35000,
      year: 2026,
      month: 4,
      jurisdiction: "IN"
    });

    expect(res.isEligible).toBe(false);
    expect(res.employeeEsiContribution).toBe(0);
    expect(res.employerEsiContribution).toBe(0);
  });
});
