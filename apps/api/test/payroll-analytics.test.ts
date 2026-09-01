import { describe, expect, it } from "vitest";
import { PayrollAnalyticsEngine } from "../src/modules/payroll/engines/payroll-analytics.engine.js";
import { RevisionEngine } from "../src/modules/payroll/engines/revision-engine.js";
import { BonusEngine } from "../src/modules/payroll/engines/bonus-engine.js";
import { IncentiveEngine } from "../src/modules/payroll/engines/incentive-engine.js";

describe("Payroll Analytics, Revisions, Bonus & Incentive Engines (Task 30)", () => {
  it("should synthesize executive payroll metrics across departments", () => {
    const res = PayrollAnalyticsEngine.synthesizePayrollAnalytics([
      {
        departmentId: "d1",
        departmentName: "Operations",
        headcount: 50,
        totalGrossPay: 2000000,
        totalOvertimePay: 100000,
        totalIncentivesPay: 50000,
        totalEmployerContributions: 240000,
        averageMonthlyCtc: 40000
      },
      {
        departmentId: "d2",
        departmentName: "Engineering",
        headcount: 20,
        totalGrossPay: 2000000,
        totalOvertimePay: 20000,
        totalIncentivesPay: 100000,
        totalEmployerContributions: 240000,
        averageMonthlyCtc: 100000
      }
    ]);

    expect(res.totalHeadcount).toBe(70);
    expect(res.totalMonthlyGrossCost).toBe(4000000);
    expect(res.totalOvertimeSpend).toBe(120000);
    expect(res.overtimeToGrossRatio).toBe(3.0); // 120,000 / 4,000,000 = 3.0%
    expect(res.totalEmployerStatutoryCost).toBe(480000);
  });

  it("should simulate salary revisions with merit matrix and compa-ratios", () => {
    // Rating 5 (Outstanding) & below-market compa-ratio (85%) => 18% hike
    const res = RevisionEngine.simulateRevision({
      currentMonthlyCtc: 100000,
      performanceRating: 5,
      compaRatioPercent: 85
    });

    expect(res.meritHikePercentage).toBe(18.0);
    expect(res.newMonthlyCtc).toBe(118000);
    expect(res.monthlyIncrementAmount).toBe(18000);
  });

  it("should compute statutory bonus within 8.33% to 20% limits", () => {
    const res = BonusEngine.calculateBonus({
      annualBasicSalary: 360000,
      bonusType: "ANNUAL_STATUTORY",
      statutoryBonusPercentage: 8.33
    });

    expect(res.isStatutoryCompliant).toBe(true);
    expect(res.bonusAmount).toBe(29988); // 360,000 * 8.33%
  });

  it("should calculate tiered sales commission accurately", () => {
    const res = IncentiveEngine.calculateIncentive({
      targetAmount: 1000000,
      achievedAmount: 1100000, // 110% achievement
      baseIncentivePool: 50000
    });

    expect(res.achievementPercent).toBe(110.0);
    expect(res.appliedMultiplier).toBe(1.0);
    expect(res.totalIncentivePayout).toBe(50000);
  });
});
