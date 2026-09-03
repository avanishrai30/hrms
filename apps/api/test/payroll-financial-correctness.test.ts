import { describe, expect, it } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  SalaryProrationEngine,
  type CompensationItemSnapshot
} from "../src/modules/payroll/salary-proration.engine.js";
import { PayrollMoney } from "../src/modules/payroll/engines/payroll-money.js";
import { PfEngine } from "../src/modules/payroll/engines/pf-engine.js";
import { EsiEngine } from "../src/modules/payroll/engines/esi-engine.js";
import { StatutoryPolicyRegistry } from "../src/modules/payroll/engines/statutory-policy.registry.js";

describe("Payroll Financial Arithmetic & Statutory Policy Correctness (Task 05.4)", () => {
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
    it("rejects division by zero at arithmetic primitive level with BadRequestException", () => {
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
        components,
        year: 2026,
        month: 9,
        jurisdiction: "IN"
      });

      expect(result.dailyRate).toBe(0);
      expect(result.grossSalary).toBe(0);
      expect(result.netSalary).toBe(0);
    });
  });

  describe("3. Authoritative Decimal Precision (Blockers 1 & 2)", () => {
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
        components,
        year: 2026,
        month: 9,
        jurisdiction: "IN"
      });

      expect(result.grossSalaryDecimal.toFixed(2)).toBe("41129.03");
      expect(result.grossSalary).toBe(41129.03);
    });

    it("calculates PF with fractional basic wage inputs using Decimal arithmetic", () => {
      const res = PfEngine.calculatePf({
        basicMonthlySalary: new Prisma.Decimal("14999.87"),
        isPfCappedAtStatutoryWageCeiling: true,
        year: 2026,
        month: 9,
        jurisdiction: "IN"
      });

      expect(res.employeePfContributionDecimal.toFixed(2)).toBe("1799.98");
      expect(res.employeePfContribution).toBe(1799.98);
      expect(res.employerEpsContributionDecimal.toFixed(2)).toBe("1249.00");
      expect(res.employerEpfContributionDecimal.toFixed(2)).toBe("550.98");
    });

    it("calculates ESI with fractional gross wages using Decimal arithmetic", () => {
      const res = EsiEngine.calculateEsi({
        grossMonthlyWages: new Prisma.Decimal("20999.75"),
        year: 2026,
        month: 9,
        jurisdiction: "IN"
      });

      expect(res.isEligible).toBe(true);
      expect(res.employeeEsiContributionDecimal.toFixed(2)).toBe("157.50");
      expect(res.employeeEsiContribution).toBe(157.5);
      expect(res.employerEsiContributionDecimal.toFixed(2)).toBe("682.49");
      expect(res.employerEsiContribution).toBe(682.49);
      expect(res.totalMonthlyEsiDepositDecimal.toFixed(2)).toBe("839.99");
    });
  });

  describe("4. Statutory Policy Provenance & Validation (Blockers 1, 2, 3, 4)", () => {
    it("rejects missing or invalid payroll year", () => {
      // @ts-expect-error Testing missing year
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ month: 9, jurisdiction: "IN" })).toThrow(BadRequestException);
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: NaN, month: 9, jurisdiction: "IN" })).toThrow(BadRequestException);
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 1800, month: 9, jurisdiction: "IN" })).toThrow(BadRequestException);
    });

    it("rejects missing or invalid payroll month (outside 1..12)", () => {
      // @ts-expect-error Testing missing month
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 2026, jurisdiction: "IN" })).toThrow(BadRequestException);
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 2026, month: 0, jurisdiction: "IN" })).toThrow(BadRequestException);
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 2026, month: 13, jurisdiction: "IN" })).toThrow(BadRequestException);
    });

    it("rejects missing or empty statutory jurisdiction without defaulting to IN", () => {
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 2026, month: 9, jurisdiction: "" })).toThrow(BadRequestException);
      // @ts-expect-error Testing undefined jurisdiction
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 2026, month: 9 })).toThrow(BadRequestException);
    });

    it("fails cleanly for unsupported statutory jurisdiction", () => {
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 2026, month: 9, jurisdiction: "US" })).toThrow(
        /No statutory policy is configured for jurisdiction "US"/
      );
      expect(() => StatutoryPolicyRegistry.getEsiPolicy({ year: 2026, month: 9, jurisdiction: "GB" })).toThrow(
        /No statutory policy is configured for jurisdiction "GB"/
      );
    });

    it("fails closed when period is before earliest known policy effective date", () => {
      // Earliest PF policy effectiveFrom is 2014-09-01
      expect(() => StatutoryPolicyRegistry.getPfPolicy({ year: 2010, month: 1, jurisdiction: "IN" })).toThrow(
        /No statutory policy is configured for jurisdiction "IN" for period 2010-01/
      );
      // Earliest ESI policy effectiveFrom is 2019-07-01
      expect(() => StatutoryPolicyRegistry.getEsiPolicy({ year: 2015, month: 5, jurisdiction: "IN" })).toThrow(
        /No statutory policy is configured for jurisdiction "IN" for period 2015-05/
      );
    });

    it("resolves the exact effective date correctly", () => {
      const pfPolicy = StatutoryPolicyRegistry.getPfPolicy({ year: 2014, month: 9, jurisdiction: "IN" });
      expect(pfPolicy.version).toBe("IN_EPF_COMMITTED_LEGACY");
      expect(pfPolicy.wageCeiling.toFixed(2)).toBe("15000.00");

      const esiPolicy = StatutoryPolicyRegistry.getEsiPolicy({ year: 2019, month: 7, jurisdiction: "IN" });
      expect(esiPolicy.version).toBe("IN_ESI_COMMITTED_LEGACY");
      expect(esiPolicy.wageCeiling.toFixed(2)).toBe("21000.00");
    });

    it("proves production registry contains only provenance-backed legacy policies", () => {
      const pfPolicy = StatutoryPolicyRegistry.getPfPolicy({ year: 2026, month: 9, jurisdiction: "IN" });
      expect(pfPolicy.version).toBe("IN_EPF_COMMITTED_LEGACY");
      expect(pfPolicy.effectiveFrom).toBe("2014-09-01");

      const esiPolicy = StatutoryPolicyRegistry.getEsiPolicy({ year: 2026, month: 9, jurisdiction: "IN" });
      expect(esiPolicy.version).toBe("IN_ESI_COMMITTED_LEGACY");
      expect(esiPolicy.effectiveFrom).toBe("2019-07-01");
    });
  });

  describe("5. Test-Only Injected Policy Reproducibility (Blocker 5)", () => {
    it("proves policy resolver correctly supersedes earlier policies using synthetic test fixtures", () => {
      const syntheticPolicies = [
        {
          version: "SYNTH_V1",
          effectiveFrom: "2020-01-01",
          jurisdiction: "TEST_REGION",
          rate: new Prisma.Decimal("0.05")
        },
        {
          version: "SYNTH_V2",
          effectiveFrom: "2024-01-01",
          jurisdiction: "TEST_REGION",
          rate: new Prisma.Decimal("0.10")
        }
      ];

      // Period in 2022 resolves V1
      const p2022 = StatutoryPolicyRegistry.resolveEffectivePolicy(syntheticPolicies, {
        year: 2022,
        month: 6,
        jurisdiction: "TEST_REGION"
      });
      expect(p2022.version).toBe("SYNTH_V1");
      expect(p2022.rate.toString()).toBe("0.05");

      // Period in 2025 resolves V2
      const p2025 = StatutoryPolicyRegistry.resolveEffectivePolicy(syntheticPolicies, {
        year: 2025,
        month: 6,
        jurisdiction: "TEST_REGION"
      });
      expect(p2025.version).toBe("SYNTH_V2");
      expect(p2025.rate.toFixed(2)).toBe("0.10");

      // Recalculating 2022 after 2025 still resolves V1 (Historical Reproducibility)
      const p2022Rerun = StatutoryPolicyRegistry.resolveEffectivePolicy(syntheticPolicies, {
        year: 2022,
        month: 6,
        jurisdiction: "TEST_REGION"
      });
      expect(p2022Rerun.version).toBe("SYNTH_V1");
    });
  });

  describe("6. Statutory Audit Snapshot Correctness (Blockers 6, 7, 8)", () => {
    it("distinguishes policy wage ceiling from actual employee wage basis in snapshot", () => {
      // Employee basic = ₹10,000 (below policy ceiling ₹15,000)
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 10000 },
        { name: "PF", code: "PF", type: "DEDUCTION", category: "PF", monthlyAmount: 1200 },
        { name: "ESI", code: "ESI", type: "DEDUCTION", category: "ESI", monthlyAmount: 75 }
      ];

      const result = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 10000,
        workingDays: 30,
        payableDays: 30,
        components,
        year: 2026,
        month: 9,
        jurisdiction: "IN"
      });

      const snap = result.statutoryPolicySnapshot;
      expect(snap.jurisdiction).toBe("IN");
      expect(snap.period).toBe("09/2026");

      // Policy ceiling MUST be the actual policy ceiling (15000.00), NOT employee wage basis (10000.00)
      expect(snap.pfPolicyWageCeiling).toBe("15000.00");
      expect(snap.pfActualWageBasis).toBe("10000.00");

      // ESI
      expect(snap.esiWageCeiling).toBe("21000.00");
      expect(snap.esiActualWageBasis).toBe("10000.00");
      expect(snap.esiContinuationCycleApplied).toBe(false);
    });

    it("verifies ESI continuation state ownership is explicitly tracked or tested as un-wired", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 25000 },
        { name: "ESI", code: "ESI", type: "DEDUCTION", category: "ESI", monthlyAmount: 0 }
      ];

      // With isPreviouslyCoveredInCycle: true
      const covered = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 25000,
        workingDays: 30,
        payableDays: 30,
        components,
        year: 2026,
        month: 9,
        jurisdiction: "IN",
        isPreviouslyCoveredInCycle: true
      });
      expect(covered.statutoryPolicySnapshot.esiContinuationCycleApplied).toBe(true);
      expect(covered.totalDeductions).toBeGreaterThan(0); // covered despite > 21k

      // With isPreviouslyCoveredInCycle: false (standard un-wired state)
      const uncovered = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 25000,
        workingDays: 30,
        payableDays: 30,
        components,
        year: 2026,
        month: 9,
        jurisdiction: "IN",
        isPreviouslyCoveredInCycle: false
      });
      expect(uncovered.statutoryPolicySnapshot.esiContinuationCycleApplied).toBe(false);
      expect(uncovered.totalDeductions).toBe(0); // exempt
    });
  });

  describe("7. Professional Tax Ownership (Blocker 9)", () => {
    it("treats PT as explicitly configured compensation component applying when payable days > 0", () => {
      const components: CompensationItemSnapshot[] = [
        { name: "Basic", code: "BASIC", type: "EARNING", category: "BASIC", monthlyAmount: 40000 },
        { name: "PT", code: "PT", type: "DEDUCTION", category: "PROFESSIONAL_TAX", monthlyAmount: 300 }
      ];

      const zeroDays = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 40000,
        workingDays: 30,
        payableDays: 0,
        components,
        year: 2026,
        month: 9,
        jurisdiction: "IN"
      });
      expect(zeroDays.totalDeductions).toBe(0);

      const activeDays = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: 40000,
        workingDays: 30,
        payableDays: 10,
        components,
        year: 2026,
        month: 9,
        jurisdiction: "IN"
      });
      expect(activeDays.totalDeductions).toBe(300);
    });
  });

  describe("8. Determinism & Serialization Round-Trip (Blocker 16)", () => {
    it("is 100% deterministic across repeated runs", () => {
      const params = {
        baseMonthlyCtc: 50000,
        workingDays: 30,
        payableDays: 25,
        components: [
          { name: "Basic", code: "BASIC", type: "EARNING" as const, category: "BASIC" as const, monthlyAmount: 30000 },
          { name: "HRA", code: "HRA", type: "EARNING" as const, category: "HRA" as const, monthlyAmount: 20000 }
        ],
        year: 2026,
        month: 9,
        jurisdiction: "IN"
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
