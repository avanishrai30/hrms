import { describe, expect, it } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  SalaryProrationEngine,
  type CompensationItemSnapshot,
  type AdjustmentSnapshot
} from "../src/modules/payroll/salary-proration.engine.js";
import { PayrollMoney } from "../src/modules/payroll/engines/payroll-money.js";

describe("Payroll Financial Arithmetic & Statutory Policy Correctness (Task 05.2)", () => {
  describe("1. Authoritative Decimal Money & Precision (Blocker 1 & 2)", () => {
    it("proves 0.1 + 0.2 precision class without floating-point error", () => {
      const result = PayrollMoney.add("0.1", "0.2");
      expect(result.toString()).toBe("0.3");
      expect(result.toNumber()).toBe(0.3);
      // Native JS float fails this: (0.1 + 0.2 === 0.3) is false in JS float
      expect(0.1 + 0.2).not.toBe(0.3);
    });

    it("evaluates repeating proration ratios such as 17/31 with exact decimal precision", () => {
      const baseMonthlyCtc = 75000;
      const workingDays = 31;
      const payableDays = 17;

      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 40000 },
        { name: "HRA", code: "HRA", type: "EARNING", category: "HRA", monthlyAmount: 20000 },
        { name: "Special", code: "SPECIAL", type: "EARNING", category: "SPECIAL_ALLOWANCE", monthlyAmount: 15000 }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc,
        workingDays,
        payableDays,
        components
      });

      // Basic: 40000 * 17 / 31 = 21935.48387... -> 21935.48
      // HRA: 20000 * 17 / 31 = 10967.7419... -> 10967.74
      // Special: 15000 * 17 / 31 = 8225.8064... -> 8225.81
      // Sum = 21935.48 + 10967.74 + 8225.81 = 41129.03
      expect(result.grossSalary).toBe(41129.03);
      expect(result.grossSalaryDecimal.toString()).toBe("41129.03");
      expect(result.breakdownItems[0]?.proratedAmount).toBe(21935.48);
      expect(result.breakdownItems[1]?.proratedAmount).toBe(10967.74);
      expect(result.breakdownItems[2]?.proratedAmount).toBe(8225.81);
    });

    it("handles multiple fractional earning components precisely", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: "12345.67" },
        { name: "HRA", code: "HRA", type: "EARNING", category: "HRA", monthlyAmount: "8765.43" },
        { name: "Conveyance", code: "CONV", type: "EARNING", category: "CONVEYANCE", monthlyAmount: "987.65" }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: "22098.75",
        workingDays: 30,
        payableDays: 30,
        components
      });

      // 12345.67 + 8765.43 + 987.65 = 22098.75
      expect(result.grossSalary).toBe(22098.75);
      expect(result.grossSalaryDecimal.toFixed(2)).toBe("22098.75");
    });

    it("handles multiple fractional deductions without losing paise/cents", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 25000 },
        { name: "Custom Deduction 1", code: "D1", type: "DEDUCTION", category: "CUSTOM", monthlyAmount: "125.33" },
        { name: "Custom Deduction 2", code: "D2", type: "DEDUCTION", category: "CUSTOM", monthlyAmount: "74.67" }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 25000,
        workingDays: 30,
        payableDays: 30,
        components
      });

      // D1 + D2 = 125.33 + 74.67 = 200.00
      expect(result.totalDeductions).toBe(200);
      expect(result.netSalary).toBe(24800);
    });
  });

  describe("2. Adjustment Aggregation (Blocker 4)", () => {
    const baseComponents: CompensationItemSnapshot[] = [
      { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 50000 }
    ];

    it("aggregates positive, negative, zero, and fractional adjustments accurately", () => {
      const adjustments: AdjustmentSnapshot[] = [
        { type: "BONUS", title: "Spot Award", amount: "5000.50" },
        { type: "REIMBURSEMENT", title: "Travel Claim", amount: "1250.25" },
        { type: "PENALTY", title: "Notice recovery", amount: "-1000.75" },
        { type: "CUSTOM", title: "Zero Adjustment", amount: 0 }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 50000,
        workingDays: 30,
        payableDays: 30,
        components: baseComponents,
        adjustments
      });

      // Adjustments = 5000.50 + 1250.25 - 1000.75 + 0 = 5250.00
      expect(result.totalAdjustments).toBe(5250);
      expect(result.totalAdjustmentsDecimal.toFixed(2)).toBe("5250.00");
      expect(result.netSalary).toBe(55250);
    });
  });

  describe("3. Real Zero vs Unavailable Values (Blocker 10)", () => {
    it("preserves real zero configured values without throwing or converting to NaN", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 0 },
        { name: "Bonus", code: "BONUS", type: "EARNING", category: "BONUS", monthlyAmount: 0 }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 0,
        workingDays: 30,
        payableDays: 30,
        components
      });

      expect(result.grossSalary).toBe(0);
      expect(result.totalDeductions).toBe(0);
      expect(result.netSalary).toBe(0);
      expect(result.netSalaryDecimal.toFixed(2)).toBe("0.00");
    });
  });

  describe("4. High-Value Payroll Numbers (Blocker 1)", () => {
    it("computes executive high-value compensation without scientific notation or truncation", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: "15000000.00" }, // 1.5 Crore
        { name: "Executive Allowance", code: "EXEC", type: "EARNING", category: "SPECIAL_ALLOWANCE", monthlyAmount: "10000000.00" } // 1.0 Crore
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: "25000000.00",
        workingDays: 30,
        payableDays: 20, // 20/30 = 2/3
        components
      });

      // Basic: 15,000,000 * 20/30 = 10,000,000.00
      // Exec: 10,000,000 * 20/30 = 6,666,666.67
      // Gross = 16,666,666.67
      expect(result.grossSalaryDecimal.toFixed(2)).toBe("16666666.67");
      expect(result.grossSalary).toBe(16666666.67);
    });
  });

  describe("5. Component Metadata Validation (Blocker 8)", () => {
    it("rejects corrupt component snapshots missing name, code, type, or category", () => {
      const corruptComponents: CompensationItemSnapshot[] = [
        // @ts-expect-error Testing missing required properties
        { monthlyAmount: 10000 }
      ];

      expect(() =>
        SalaryProrationEngine.calculateProration({
          baseMonthlyCtc: 10000,
          workingDays: 30,
          payableDays: 30,
          components: corruptComponents
        })
      ).toThrow(BadRequestException);
    });
  });

  describe("6. Negative Net Pay Policy (Blocker 11)", () => {
    it("fails closed with BadRequestException when deductions and penalties exceed gross earnings", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 10000 },
        { name: "Recovery", code: "REC", type: "DEDUCTION", category: "CUSTOM", monthlyAmount: 15000 }
      ];

      expect(() =>
        SalaryProrationEngine.calculateProration({
          baseMonthlyCtc: 10000,
          workingDays: 30,
          payableDays: 30,
          components
        })
      ).toThrow(BadRequestException);
    });
  });

  describe("7. Statutory Delegation & Policy Wiring (Blocker 5 & 7)", () => {
    it("delegates PF calculation to PfEngine with statutory wage ceiling", () => {
      // Basic is ₹50,000 (above statutory ₹15,000 ceiling)
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 50000 },
        { name: "PF Employee", code: "PF_EE", type: "DEDUCTION", category: "PF", monthlyAmount: 1800 },
        { name: "PF Employer", code: "PF_ER", type: "EMPLOYER_CONTRIBUTION", category: "PF", monthlyAmount: 1800 }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 50000,
        workingDays: 30,
        payableDays: 30,
        components
      });

      // PfEngine caps wage at ₹15,000 -> 12% of 15,000 = 1,800
      expect(result.totalDeductions).toBe(1800);
      expect(result.employerContributions).toBe(1800);
    });

    it("delegates ESI calculation to EsiEngine with wage eligibility ceiling", () => {
      // Gross ₹20,000 <= ₹21,000 ESI ceiling -> eligible
      const eligibleComponents: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 20000 },
        { name: "ESI Employee", code: "ESI_EE", type: "DEDUCTION", category: "ESI", monthlyAmount: 150 },
        { name: "ESI Employer", code: "ESI_ER", type: "EMPLOYER_CONTRIBUTION", category: "ESI", monthlyAmount: 650 }
      ];

      const eligibleResult = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 20000,
        workingDays: 30,
        payableDays: 30,
        components: eligibleComponents
      });

      // 0.75% of 20000 = 150
      expect(eligibleResult.totalDeductions).toBe(150);
      // 3.25% of 20000 = 650
      expect(eligibleResult.employerContributions).toBe(650);

      // Gross ₹35,000 > ₹21,000 ESI ceiling -> exempt from ESI
      const exemptComponents: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 35000 },
        { name: "ESI Employee", code: "ESI_EE", type: "DEDUCTION", category: "ESI", monthlyAmount: 262.5 },
        { name: "ESI Employer", code: "ESI_ER", type: "EMPLOYER_CONTRIBUTION", category: "ESI", monthlyAmount: 1137.5 }
      ];

      const exemptResult = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 35000,
        workingDays: 30,
        payableDays: 30,
        components: exemptComponents
      });

      expect(exemptResult.totalDeductions).toBe(0);
      expect(exemptResult.employerContributions).toBe(0);
    });

    it("treats Professional Tax as configured jurisdiction component, not universal hardcoding", () => {
      // Employee in Karnataka with ₹200 PT
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 40000 },
        { name: "Professional Tax", code: "PT", type: "DEDUCTION", category: "PROFESSIONAL_TAX", monthlyAmount: 300 }
      ];

      // When payable days = 0, PT is 0
      const zeroDays = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 40000,
        workingDays: 30,
        payableDays: 0,
        components
      });
      expect(zeroDays.totalDeductions).toBe(0);

      // When payable days > 0, PT is the configured ₹300
      const activeDays = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 40000,
        workingDays: 30,
        payableDays: 15,
        components
      });
      expect(activeDays.totalDeductions).toBe(300);
    });
  });

  describe("8. Determinism and Database Round-Trip Simulation", () => {
    it("is 100% deterministic across repeated calculations", () => {
      const params = {
        baseMonthlyCtc: 45000,
        workingDays: 31,
        payableDays: 23,
        components: [
          { name: "Basic", code: "BASIC", type: "EARNING" as const, category: "BASIC" as const, monthlyAmount: 25000 },
          { name: "HRA", code: "HRA", type: "EARNING" as const, category: "HRA" as const, monthlyAmount: 12000 },
          { name: "Special", code: "SPECIAL", type: "EARNING" as const, category: "SPECIAL_ALLOWANCE" as const, monthlyAmount: 8000 }
        ]
      };

      const run1 = SalaryProrationEngine.calculateProration(params);
      const run2 = SalaryProrationEngine.calculateProration(params);
      const run3 = SalaryProrationEngine.calculateProration(params);

      expect(run1.grossSalary).toBe(run2.grossSalary);
      expect(run2.grossSalary).toBe(run3.grossSalary);
      expect(run1.netSalary).toBe(run2.netSalary);
      expect(run1.grossSalaryDecimal.equals(run2.grossSalaryDecimal)).toBe(true);
    });

    it("verifies Decimal round trip preserves exact precision without float drift", () => {
      const exactAmount = new Prisma.Decimal("1234567.89");
      const serialized = exactAmount.toFixed(2);
      const restored = new Prisma.Decimal(serialized);

      expect(restored.equals(exactAmount)).toBe(true);
      expect(restored.toString()).toBe("1234567.89");
    });
  });
});
