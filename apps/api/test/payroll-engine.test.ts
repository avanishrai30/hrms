import { describe, expect, it } from "vitest";
import { PayrollEngine } from "../src/modules/payroll/engines/payroll-engine.js";

describe("PayrollEngine (Task 30)", () => {
  it("should calculate standard monthly payroll with full payable days", () => {
    const res = PayrollEngine.calculateMonthlyPayroll({
      employeeId: "emp-1",
      monthlyCtc: 100000,
      basicSalary: 50000,
      hra: 25000,
      specialAllowance: 15000,
      conveyanceAllowance: 5000,
      medicalAllowance: 5000,
      totalWorkingDaysInMonth: 30,
      payableDays: 30,
      pfDeductionEmployee: 6000,
      professionalTax: 200,
      monthlyTdsDeduction: 5000,
      employerPfContribution: 6000
    });

    expect(res.prorationRatio).toBe(1.0);
    expect(res.grossEarnedSalary).toBe(100000);
    expect(res.totalStatutoryDeductions).toBe(11200);
    expect(res.netPayableSalary).toBe(88800);
    expect(res.employerTotalCost).toBe(106000);
  });

  it("should prorate earnings properly for partial attendance / LOP", () => {
    const res = PayrollEngine.calculateMonthlyPayroll({
      employeeId: "emp-2",
      monthlyCtc: 100000,
      basicSalary: 60000,
      hra: 30000,
      specialAllowance: 10000,
      totalWorkingDaysInMonth: 30,
      payableDays: 15,
      pfDeductionEmployee: 3600
    });

    expect(res.prorationRatio).toBe(0.5);
    expect(res.proratedBasic).toBe(30000);
    expect(res.proratedHra).toBe(15000);
    expect(res.grossEarnedSalary).toBe(50000);
    expect(res.netPayableSalary).toBe(46400);
  });

  it("should include overtime, shift allowance, and reimbursements in total earnings", () => {
    const res = PayrollEngine.calculateMonthlyPayroll({
      employeeId: "emp-3",
      monthlyCtc: 60000,
      basicSalary: 30000,
      hra: 15000,
      specialAllowance: 15000,
      totalWorkingDaysInMonth: 30,
      payableDays: 30,
      shiftAllowance: 3000,
      overtimeEarnings: 4500,
      reimbursementsApproved: 2500
    });

    expect(res.grossEarnedSalary).toBe(60000);
    expect(res.totalEarnings).toBe(70000);
    expect(res.netPayableSalary).toBe(70000);
  });
});
