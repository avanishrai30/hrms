import { describe, expect, it } from "vitest";
import {
  SalaryProrationEngine,
  type CompensationItemSnapshot
} from "./salary-proration.engine.js";

describe("SalaryProrationEngine", () => {
  const components: CompensationItemSnapshot[] = [
    {
      name: "Basic Salary",
      code: "BASIC",
      type: "EARNING",
      category: "BASIC",
      monthlyAmount: 15000
    },
    {
      name: "House Rent Allowance",
      code: "HRA",
      type: "EARNING",
      category: "HRA",
      monthlyAmount: 6000
    },
    {
      name: "Special Allowance",
      code: "SPECIAL_ALLOWANCE",
      type: "EARNING",
      category: "SPECIAL_ALLOWANCE",
      monthlyAmount: 9000
    },
    {
      name: "Provident Fund (Employee)",
      code: "PF_EE",
      type: "DEDUCTION",
      category: "PF",
      monthlyAmount: 1800
    },
    {
      name: "Professional Tax",
      code: "PT",
      type: "DEDUCTION",
      category: "PROFESSIONAL_TAX",
      monthlyAmount: 200
    }
  ];

  it("calculates 100% payout when payable days equal working days", () => {
    const result = SalaryProrationEngine.calculateProration({
      baseMonthlyCtc: 30000,
      workingDays: 30,
      payableDays: 30,
      components,
      year: 2026,
      month: 4,
      jurisdiction: "IN"
    });

    expect(result.grossSalary).toBe(30000);
    // PF = 12% of 15000 = 1800, PT = 200 -> total deductions = 2000
    expect(result.totalDeductions).toBe(2000);
    // Net Salary = 30000 - 2000 = 28000
    expect(result.netSalary).toBe(28000);
  });

  it("prorates salary accurately when payable days are 25 out of 30", () => {
    // 30,000 * 25 / 30 = 25,000
    const result = SalaryProrationEngine.calculateProration({
      baseMonthlyCtc: 30000,
      workingDays: 30,
      payableDays: 25,
      components,
      year: 2026,
      month: 4,
      jurisdiction: "IN"
    });

    expect(result.grossSalary).toBe(25000);
    // Prorated Basic = 15000 * 25/30 = 12500
    // Prorated PF = 12% of 12500 = 1500
    // PT = 200
    // Total Deductions = 1700
    expect(result.totalDeductions).toBe(1700);
    // Net Salary = 25000 - 1700 = 23300
    expect(result.netSalary).toBe(23300);
  });

  it("applies positive and negative adjustments (bonuses, penalties) correctly", () => {
    const result = SalaryProrationEngine.calculateProration({
      baseMonthlyCtc: 30000,
      workingDays: 30,
      payableDays: 30,
      components,
      year: 2026,
      month: 4,
      jurisdiction: "IN",
      adjustments: [
        { type: "BONUS", title: "Quarterly Performance Bonus", amount: 5000 },
        { type: "PENALTY", title: "Inventory Loss Recovery", amount: -1000 }
      ]
    });

    expect(result.totalAdjustments).toBe(4000);
    // Net Salary = 28000 + 4000 = 32000
    expect(result.netSalary).toBe(32000);
  });
});
