import { describe, expect, it } from "vitest";
import { CompensationEngine, type ComponentCalculationInput } from "./compensation-engine.js";

describe("CompensationEngine", () => {
  const defaultComponents: ComponentCalculationInput[] = [
    {
      componentId: "comp-basic",
      name: "Basic Salary",
      code: "BASIC",
      type: "EARNING",
      category: "BASIC",
      calculationType: "PERCENTAGE_OF_BASIC",
      calculationValue: 50
    },
    {
      componentId: "comp-hra",
      name: "House Rent Allowance",
      code: "HRA",
      type: "EARNING",
      category: "HRA",
      calculationType: "PERCENTAGE_OF_BASIC",
      calculationValue: 40
    },
    {
      componentId: "comp-conv",
      name: "Conveyance Allowance",
      code: "CONVEYANCE",
      type: "EARNING",
      category: "CONVEYANCE",
      calculationType: "FLAT_AMOUNT",
      calculationValue: 1600
    },
    {
      componentId: "comp-spl",
      name: "Special Allowance",
      code: "SPECIAL_ALLOWANCE",
      type: "EARNING",
      category: "SPECIAL_ALLOWANCE",
      calculationType: "FLAT_AMOUNT",
      calculationValue: 0
    },
    {
      componentId: "comp-pfee",
      name: "Provident Fund (Employee)",
      code: "PF_EE",
      type: "DEDUCTION",
      category: "PF",
      calculationType: "PERCENTAGE_OF_BASIC",
      calculationValue: 12
    },
    {
      componentId: "comp-pt",
      name: "Professional Tax",
      code: "PT",
      type: "DEDUCTION",
      category: "PROFESSIONAL_TAX",
      calculationType: "FLAT_AMOUNT",
      calculationValue: 200
    },
    {
      componentId: "comp-pfer",
      name: "Provident Fund (Employer)",
      code: "PF_ER",
      type: "EMPLOYER_CONTRIBUTION",
      category: "PF",
      calculationType: "PERCENTAGE_OF_BASIC",
      calculationValue: 12
    }
  ];

  it("calculates correct salary breakdown for Monthly CTC of 30,000", () => {
    const monthlyCtc = 30000;
    const result = CompensationEngine.calculateBreakdown(monthlyCtc, defaultComponents);

    expect(result.monthlyCtc).toBe(30000);
    expect(result.annualCtc).toBe(360000);

    // Basic = 50% of 30,000 = 15,000
    const basicItem = result.items.find((i) => i.code === "BASIC");
    expect(basicItem?.monthlyAmount).toBe(15000);
    expect(basicItem?.annualAmount).toBe(180000);

    // HRA = 40% of 15,000 = 6,000
    const hraItem = result.items.find((i) => i.code === "HRA");
    expect(hraItem?.monthlyAmount).toBe(6000);

    // Conveyance = 1,600
    const convItem = result.items.find((i) => i.code === "CONVEYANCE");
    expect(convItem?.monthlyAmount).toBe(1600);

    // Employer PF = 12% of 15,000 = 1,800
    const pfErItem = result.items.find((i) => i.code === "PF_ER");
    expect(pfErItem?.monthlyAmount).toBe(1800);

    // Special Allowance = 30000 - (15000 + 6000 + 1600 + 1800) = 5,600
    const splItem = result.items.find((i) => i.code === "SPECIAL_ALLOWANCE");
    expect(splItem?.monthlyAmount).toBe(5600);

    // Employee PF = 12% of 15,000 = 1,800
    const pfEeItem = result.items.find((i) => i.code === "PF_EE");
    expect(pfEeItem?.monthlyAmount).toBe(1800);

    // Total deductions = 1800 (PF) + 200 (PT) = 2,000
    expect(result.totalDeductionsMonthly).toBe(2000);

    // Gross earnings = 15000 + 6000 + 1600 + 5600 = 28,200
    expect(result.grossEarningsMonthly).toBe(28200);

    // Net Take Home = 28,200 - 2,000 = 26,200
    expect(result.netTakeHomeMonthly).toBe(26200);
  });

  it("ensures annual amounts strictly equal monthly amounts multiplied by 12", () => {
    const monthlyCtc = 50000;
    const result = CompensationEngine.calculateBreakdown(monthlyCtc, defaultComponents);

    expect(result.grossEarningsAnnual).toBe(result.grossEarningsMonthly * 12);
    expect(result.totalDeductionsAnnual).toBe(result.totalDeductionsMonthly * 12);
    expect(result.employerContributionsAnnual).toBe(result.employerContributionsMonthly * 12);
    expect(result.netTakeHomeAnnual).toBe(result.netTakeHomeMonthly * 12);

    for (const item of result.items) {
      expect(item.annualAmount).toBe(item.monthlyAmount * 12);
    }
  });

  it("handles custom flat amount basic salary correctly", () => {
    const customComponents: ComponentCalculationInput[] = [
      {
        componentId: "c1",
        name: "Basic",
        code: "BASIC",
        type: "EARNING",
        category: "BASIC",
        calculationType: "FLAT_AMOUNT",
        calculationValue: 20000,
        monthlyAmount: 20000
      },
      {
        componentId: "c2",
        name: "Special Allowance",
        code: "SPECIAL_ALLOWANCE",
        type: "EARNING",
        category: "SPECIAL_ALLOWANCE",
        calculationType: "FLAT_AMOUNT",
        calculationValue: 0
      }
    ];

    const result = CompensationEngine.calculateBreakdown(25000, customComponents);
    const basic = result.items.find((i) => i.code === "BASIC");
    const spl = result.items.find((i) => i.code === "SPECIAL_ALLOWANCE");

    expect(basic?.monthlyAmount).toBe(20000);
    expect(spl?.monthlyAmount).toBe(5000);
    expect(result.grossEarningsMonthly).toBe(25000);
  });

  it("provides comprehensive standard default components", () => {
    const defaults = CompensationEngine.getDefaultComponents();
    expect(defaults.length).toBeGreaterThanOrEqual(7);
    expect(defaults.some((d) => d.code === "BASIC")).toBe(true);
    expect(defaults.some((d) => d.code === "HRA")).toBe(true);
    expect(defaults.some((d) => d.code === "PF_EE")).toBe(true);
    expect(defaults.some((d) => d.code === "PF_ER")).toBe(true);
  });
});
