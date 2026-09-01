/**
 * TASK 30 — FULL & FINAL (FnF) SETTLEMENT ENGINE
 * Calculates total separation dues: Earned salary, Leave encashment, Gratuity, Notice pay adjustments, Loan recoveries, and Net Payable.
 */

export interface FnfSettlementInput {
  employeeId: string;
  monthlyGrossSalary: number;
  monthlyBasicSalary: number;
  workingDaysInLastMonth: number;
  workedDaysInLastMonth: number;
  remainingPaidLeaveBalanceDays: number;
  noticePeriodRequiredDays: number;
  noticeServedDays: number;
  isNoticeShortfallPayableByEmployee: boolean;
  gratuityAmount?: number;
  variablePayAmount?: number;
  bonusAmount?: number;
  pendingReimbursements?: number;
  outstandingLoanBalance?: number;
  assetDamageRecovery?: number;
  otherEarnings?: number;
  otherDeductions?: number;
}

export interface FnfSettlementResult {
  employeeId: string;
  earnedSalaryLastMonth: number;
  leaveEncashmentAmount: number;
  noticeShortfallDays: number;
  noticeAdjustmentAmount: number; // positive if employee owes company, or company pays
  gratuityAmount: number;
  variablePayAmount: number;
  bonusAmount: number;
  pendingReimbursements: number;
  totalGrossSettlementEarnings: number;
  outstandingLoanRecovery: number;
  assetDamageRecovery: number;
  otherDeductions: number;
  totalSettlementDeductions: number;
  netSettlementPayable: number;
}

export class FnfEngine {
  /**
   * Compute comprehensive Full & Final settlement statement.
   */
  static calculateFnfSettlement(input: FnfSettlementInput): FnfSettlementResult {
    // 1. Partial month earned salary
    const earnedSalaryLastMonth =
      input.workingDaysInLastMonth > 0
        ? Math.round((input.monthlyGrossSalary / input.workingDaysInLastMonth) * input.workedDaysInLastMonth)
        : 0;

    // 2. Leave Encashment: (Basic Salary / 30) * Leave Balance
    const dailyBasicRate = Math.round((input.monthlyBasicSalary / 30) * 100) / 100;
    const leaveEncashmentAmount = Math.round(
      dailyBasicRate * Math.max(0, input.remainingPaidLeaveBalanceDays)
    );

    // 3. Notice Pay shortfall / recovery: (Gross / 30) * Shortfall Days
    const noticeShortfallDays = Math.max(
      0,
      input.noticePeriodRequiredDays - input.noticeServedDays
    );
    const dailyGrossRate = Math.round((input.monthlyGrossSalary / 30) * 100) / 100;
    const noticeAdjustmentAmount = Math.round(dailyGrossRate * noticeShortfallDays);

    const noticeRecovery = input.isNoticeShortfallPayableByEmployee ? noticeAdjustmentAmount : 0;
    const noticePayout = !input.isNoticeShortfallPayableByEmployee ? noticeAdjustmentAmount : 0;

    const gratuity = input.gratuityAmount ?? 0;
    const variablePay = input.variablePayAmount ?? 0;
    const bonus = input.bonusAmount ?? 0;
    const reimbursements = input.pendingReimbursements ?? 0;
    const otherEarnings = input.otherEarnings ?? 0;

    const totalGrossSettlementEarnings =
      earnedSalaryLastMonth +
      leaveEncashmentAmount +
      gratuity +
      variablePay +
      bonus +
      reimbursements +
      otherEarnings +
      noticePayout;

    const loanRecovery = input.outstandingLoanBalance ?? 0;
    const assetRecovery = input.assetDamageRecovery ?? 0;
    const otherDeductions = input.otherDeductions ?? 0;

    const totalSettlementDeductions =
      noticeRecovery + loanRecovery + assetRecovery + otherDeductions;

    const netSettlementPayable = Math.max(
      0,
      totalGrossSettlementEarnings - totalSettlementDeductions
    );

    return {
      employeeId: input.employeeId,
      earnedSalaryLastMonth,
      leaveEncashmentAmount,
      noticeShortfallDays,
      noticeAdjustmentAmount,
      gratuityAmount: gratuity,
      variablePayAmount: variablePay,
      bonusAmount: bonus,
      pendingReimbursements: reimbursements,
      totalGrossSettlementEarnings,
      outstandingLoanRecovery: loanRecovery,
      assetDamageRecovery: assetRecovery,
      otherDeductions,
      totalSettlementDeductions,
      netSettlementPayable
    };
  }
}
