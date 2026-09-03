import { describe, expect, it } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  SalaryProrationEngine,
  type CompensationItemSnapshot,
  type AdjustmentSnapshot
} from "../src/modules/payroll/salary-proration.engine.js";
import { PayrollMoney } from "../src/modules/payroll/engines/payroll-money.js";
import { PfEngine } from "../src/modules/payroll/engines/pf-engine.js";
import { EsiEngine } from "../src/modules/payroll/engines/esi-engine.js";
import { StatutoryPolicyRegistry } from "../src/modules/payroll/engines/statutory-policy.registry.js";

describe("Payroll Financial Arithmetic & Statutory Policy Correctness (Task 05.3)", () => {
  describe("1. Strict Money Parsing & Deliberate Zero (Blockers 5 & 14)", () => {
    it("rejects null, undefined, empty string, non-numeric strings, and NaN with BadRequestException", () => {
      expect(() => PayrollMoney.requireDecimal(null, "amount")).toThrow(BadRequestException);
      expect(() => PayrollMoney.requireDecimal(undefined, "amount")).toThrow(BadRequestException);
      expect(() => PayrollMoney.requireDecimal("", "amount")).toThrow(BadRequestException);
      expect(() => PayrollMoney.requireDecimal("abc", "amount")).toThrow(BadRequestException);
      expect(() => PayrollMoney.requireDecimal(NaN, "amount")).toThrow(BadRequestException);
    });

    it("accepts deliberate zero values without treating them as missing", () => {
      const zNum = PayrollMoney.requireDecimal(0, "zero number");
      const zStr = PayrollMoney.requireDecimal("0", "zero string");
      const zDec = PayrollMoney.requireDecimal("0.00", "zero two decimals");
      const zInit = PayrollMoney.zero();

      expect(zNum.toFixed(2)).toBe("0.00");
      expect(zStr.toFixed(2)).toBe("0.00");
      expect(zDec.toFixed(2)).toBe("0.00");
      expect(zInit.toFixed(2)).toBe("0.00");
    });
  });

  describe("2. Division by Zero Safety (Blocker 6)", () => {
    it("rejects division by zero at the arithmetic primitive level with BadRequestException", () => {
      expect(() => PayrollMoney.div(100, 0)).toThrow(BadRequestException);
      expect(() => PayrollMoney.div("5000", "0.00")).toThrow(BadRequestException);
      expect(() => PayrollMoney.div(new Prisma.Decimal("123.45"), new Prisma.Decimal(0))).toThrow(BadRequestException);
    });

    it("handles workingDays === 0 at business level without throwing division by zero", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 30000 }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 30000,
        workingDays: 0,
        payableDays: 0,
        components
      });

      expect(result.dailyRate).toBe(0);
      expect(result.grossSalary).toBe(0);
      expect(result.netSalary).toBe(0);
    });
  });

  describe("3. Authoritative Decimal Precision (Blockers 1, 2, 4, 15)", () => {
    it("proves 0.1 + 0.2 precision class without floating-point error", () => {
      const result = PayrollMoney.add("0.1", "0.2");
      expect(result.toString()).toBe("0.3");
      expect(result.toNumber()).toBe(0.3);
      expect(0.1 + 0.2).not.toBe(0.3);
    });

    it("evaluates repeating proration ratios (17/31) with rational precision before rounding", () => {
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

      // Basic: 40000 * 17 / 31 = 21935.48
      // HRA: 20000 * 17 / 31 = 10967.74
      // Special: 15000 * 17 / 31 = 8225.81
      expect(result.grossSalaryDecimal.toFixed(2)).toBe("41129.03");
      expect(result.grossSalary).toBe(41129.03);
    });

    it("calculates PF with fractional basic wage inputs using Decimal arithmetic", () => {
      // Basic ₹14,999.87 (< ₹15,000 ceiling)
      const res = PfEngine.calculatePf({
        basicMonthlySalary: new Prisma.Decimal("14999.87"),
        isPfCappedAtStatutoryWageCeiling: true
      });

      // 14999.87 * 0.12 = 1799.9844 -> 1799.98
      expect(res.employeePfContributionDecimal.toFixed(2)).toBe("1799.98");
      expect(res.employeePfContribution).toBe(1799.98);
      // EPS: 14999.87 * 0.0833 = 1249.489 -> rounded to rupee = 1249.00
      expect(res.employerEpsContributionDecimal.toFixed(2)).toBe("1249.00");
      // EPF: 1799.98 - 1249.00 = 550.98
      expect(res.employerEpfContributionDecimal.toFixed(2)).toBe("550.98");
    });

    it("calculates ESI with fractional gross wages using Decimal arithmetic", () => {
      // Gross ₹20,999.75 (<= ₹21,000 ceiling)
      const res = EsiEngine.calculateEsi({
        grossMonthlyWages: new Prisma.Decimal("20999.75")
      });

      expect(res.isEligible).toBe(true);
      // 20999.75 * 0.0075 = 157.498125 -> 157.50
      expect(res.employeeEsiContributionDecimal.toFixed(2)).toBe("157.50");
      expect(res.employeeEsiContribution).toBe(157.5);
      // 20999.75 * 0.0325 = 682.491875 -> 682.49
      expect(res.employerEsiContributionDecimal.toFixed(2)).toBe("682.49");
      expect(res.employerEsiContribution).toBe(682.49);
      // Total = 157.50 + 682.49 = 839.99
      expect(res.totalMonthlyEsiDepositDecimal.toFixed(2)).toBe("839.99");
    });
  });

  describe("4. Versioned Statutory Policy & Historical Reproducibility (Blockers 3, 4, 13)", () => {
    it("resolves historical Policy A for period 2018-05 and statutory Policy B for period 2026-09", () => {
      const policy2018 = StatutoryPolicyRegistry.getEsiPolicy(2018, 5);
      const policy2026 = StatutoryPolicyRegistry.getEsiPolicy(2026, 9);

      expect(policy2018.version).toBe("IN_ESI_HISTORICAL_2016");
      expect(policy2018.employeeRate.toString()).toBe("0.0175"); // 1.75%
      expect(policy2018.employerRate.toString()).toBe("0.0475"); // 4.75%

      expect(policy2026.version).toBe("IN_ESI_STATUTORY_2019");
      expect(policy2026.employeeRate.toString()).toBe("0.0075"); // 0.75%
      expect(policy2026.employerRate.toString()).toBe("0.0325"); // 3.25%
    });

    it("recalculates historical period A after period B without leakage or wall-clock dependence", () => {
      // Calculate Period A (2018-05)
      const resA1 = EsiEngine.calculateEsi({
        grossMonthlyWages: 20000,
        year: 2018,
        month: 5
      });
      expect(resA1.policyVersion).toBe("IN_ESI_HISTORICAL_2016");
      expect(resA1.employeeEsiContribution).toBe(350); // 20000 * 1.75% = 350

      // Calculate Period B (2026-09)
      const resB = EsiEngine.calculateEsi({
        grossMonthlyWages: 20000,
        year: 2026,
        month: 9
      });
      expect(resB.policyVersion).toBe("IN_ESI_STATUTORY_2019");
      expect(resB.employeeEsiContribution).toBe(150); // 20000 * 0.75% = 150

      // Recalculate Period A (2018-05) — MUST still match Policy A!
      const resA2 = EsiEngine.calculateEsi({
        grossMonthlyWages: 20000,
        year: 2018,
        month: 5
      });
      expect(resA2.policyVersion).toBe("IN_ESI_HISTORICAL_2016");
      expect(resA2.employeeEsiContribution).toBe(350);
      expect(resA2.employeeEsiContributionDecimal.equals(resA1.employeeEsiContributionDecimal)).toBe(true);
    });

    it("captures policy version snapshot in ProrationResult", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 20000 },
        { name: "PF", code: "PF", type: "DEDUCTION", category: "PF", monthlyAmount: 1800 },
        { name: "ESI", code: "ESI", type: "DEDUCTION", category: "ESI", monthlyAmount: 150 }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 20000,
        workingDays: 30,
        payableDays: 30,
        components,
        year: 2026,
        month: 9
      });

      expect(result.statutoryPolicySnapshot).toBeDefined();
      expect(result.statutoryPolicySnapshot.pfPolicyVersion).toBe("IN_EPF_STATUTORY_2014");
      expect(result.statutoryPolicySnapshot.esiPolicyVersion).toBe("IN_ESI_STATUTORY_2019");
      expect(result.statutoryPolicySnapshot.period).toBe("09/2026");
    });
  });

  describe("5. Adjustments & Negative Net Pay Policy (Blockers 4 & 11)", () => {
    it("aggregates adjustments using Decimal arithmetic", () => {
      const adjustments: AdjustmentSnapshot[] = [
        { type: "BONUS", title: "Spot Award", amount: "5000.50" },
        { type: "PENALTY", title: "Late Recovery", amount: "-1000.75" }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 30000,
        workingDays: 30,
        payableDays: 30,
        components: [
          { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 30000 }
        ],
        adjustments
      });

      expect(result.totalAdjustmentsDecimal.toFixed(2)).toBe("3999.75");
      expect(result.netSalaryDecimal.toFixed(2)).toBe("33999.75");
    });

    it("throws BadRequestException when negative adjustments cause net salary to become negative", () => {
      const adjustments: AdjustmentSnapshot[] = [
        { type: "PENALTY", title: "Asset Damage", amount: "-40000.00" }
      ];

      expect(() =>
        SalaryProrationEngine.calculateProration({
          baseMonthlyCtc: 30000,
          workingDays: 30,
          payableDays: 30,
          components: [
            { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 30000 }
          ],
          adjustments
        })
      ).toThrow(BadRequestException);
    });
  });

  describe("6. Professional Tax Jurisdiction Policy (Blocker 12)", () => {
    it("treats PT as configured component applying when payable days > 0, zero when payable days = 0", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 40000 },
        { name: "PT", code: "PT", type: "DEDUCTION", category: "PROFESSIONAL_TAX", monthlyAmount: 300 }
      ];

      const zeroDays = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 40000,
        workingDays: 30,
        payableDays: 0,
        components
      });
      expect(zeroDays.totalDeductions).toBe(0);

      const activeDays = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 40000,
        workingDays: 30,
        payableDays: 10,
        components
      });
      expect(activeDays.totalDeductions).toBe(300);
    });
  });

  describe("7. Determinism & Accurately Labeled Persistence Evidence (Blocker 16)", () => {
    it("is 100% deterministic across repeated runs", () => {
      const params = {
        baseMonthlyCtc: 50000,
        workingDays: 30,
        payableDays: 25,
        components: [
          { name: "Basic", code: "BASIC", type: "EARNING" as const, category: "BASIC" as const, monthlyAmount: 30000 },
          { name: "HRA", code: "HRA", type: "EARNING" as const, category: "HRA" as const, monthlyAmount: 20000 }
        ]
      };

      const res1 = SalaryProrationEngine.calculateProration(params);
      const res2 = SalaryProrationEngine.calculateProration(params);

      expect(res1.grossSalaryDecimal.equals(res2.grossSalaryDecimal)).toBe(true);
      expect(res1.netSalaryDecimal.equals(res2.netSalaryDecimal)).toBe(true);
    });

    it("Database Decimal round-trip not executed (PostgreSQL offline); Decimal serialization round-trip verified instead", () => {
      const exactAmount = new Prisma.Decimal("1234567.89");
      const serialized = exactAmount.toFixed(2);
      const restored = new Prisma.Decimal(serialized);

      expect(restored.equals(exactAmount)).toBe(true);
      expect(restored.toString()).toBe("1234567.89");
    });
  });
});
