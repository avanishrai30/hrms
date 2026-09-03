import { describe, expect, it } from "vitest";
import { PfEngine } from "../src/modules/payroll/engines/pf-engine.js";

describe("PfEngine (Task 30 - EPF & EPS Statutory Calculation)", () => {
  it("should calculate PF uncapped on full basic wage", () => {
    const res = PfEngine.calculatePf({
      basicMonthlySalary: 40000,
      daMonthlySalary: 0,
      isPfCappedAtStatutoryWageCeiling: false,
      year: 2026,
      month: 4,
      jurisdiction: "IN"
    });

    expect(res.pfWage).toBe(40000);
    expect(res.employeePfContribution).toBe(4800); // 12% of 40,000
    expect(res.employerEpsContribution).toBe(1250); // Capped at ₹1,250
    expect(res.employerEpfContribution).toBe(3550); // 4800 - 1250 = 3550
    expect(res.employerEdliContribution).toBe(75); // Capped at ₹75
    expect(res.employerAdminCharges).toBe(75);
    expect(res.totalMonthlyPfDeposit).toBe(4800 + res.totalEmployerPfCost);
  });

  it("should calculate PF capped at statutory wage ceiling (₹15,000)", () => {
    const res = PfEngine.calculatePf({
      basicMonthlySalary: 50000,
      daMonthlySalary: 0,
      isPfCappedAtStatutoryWageCeiling: true,
      year: 2026,
      month: 4,
      jurisdiction: "IN"
    });

    expect(res.pfWage).toBe(15000);
    expect(res.employeePfContribution).toBe(1800); // 12% of 15,000
    expect(res.employerEpsContribution).toBe(1250);
    expect(res.employerEpfContribution).toBe(550); // 1800 - 1250 = 550
  });
});
