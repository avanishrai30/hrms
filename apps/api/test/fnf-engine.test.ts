import { describe, expect, it } from "vitest";
import { FnfEngine } from "../src/modules/payroll/engines/fnf-engine.js";

describe("FnfEngine (Task 30 - Full & Final Settlement)", () => {
  it("should calculate complete separation dues and recoveries", () => {
    const res = FnfEngine.calculateFnfSettlement({
      employeeId: "emp-exit-1",
      monthlyGrossSalary: 90000,
      monthlyBasicSalary: 45000,
      workingDaysInLastMonth: 30,
      workedDaysInLastMonth: 15,
      remainingPaidLeaveBalanceDays: 10,
      noticePeriodRequiredDays: 30,
      noticeServedDays: 30,
      isNoticeShortfallPayableByEmployee: true,
      gratuityAmount: 180000,
      bonusAmount: 25000,
      outstandingLoanBalance: 15000
    });

    expect(res.earnedSalaryLastMonth).toBe(45000); // (90000/30)*15
    expect(res.leaveEncashmentAmount).toBe(15000); // (45000/30)*10
    expect(res.noticeShortfallDays).toBe(0);
    expect(res.totalGrossSettlementEarnings).toBe(45000 + 15000 + 180000 + 25000); // 265,000
    expect(res.totalSettlementDeductions).toBe(15000);
    expect(res.netSettlementPayable).toBe(250000);
  });

  it("should calculate notice shortfall deduction when employee exits early without serving notice", () => {
    const res = FnfEngine.calculateFnfSettlement({
      employeeId: "emp-exit-2",
      monthlyGrossSalary: 60000,
      monthlyBasicSalary: 30000,
      workingDaysInLastMonth: 30,
      workedDaysInLastMonth: 30,
      remainingPaidLeaveBalanceDays: 0,
      noticePeriodRequiredDays: 30,
      noticeServedDays: 10, // 20 days shortfall
      isNoticeShortfallPayableByEmployee: true
    });

    expect(res.noticeShortfallDays).toBe(20);
    expect(res.noticeAdjustmentAmount).toBe(40000); // (60000/30)*20
    expect(res.totalSettlementDeductions).toBe(40000);
    expect(res.netSettlementPayable).toBe(20000); // 60000 - 40000
  });
});
