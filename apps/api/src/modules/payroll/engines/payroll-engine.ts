/**
 * TASK 30 — ENTERPRISE PAYROLL PROCESSING ENGINE
 * Calculates Gross CTC, monthly payable days proration, LOP deductions,
 * shift allowances, overtime additions, reimbursements, statutory deductions, and Net Take-Home.
 */

export interface EmployeeSalaryInput {
  employeeId: string;
  monthlyCtc: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyanceAllowance?: number;
  medicalAllowance?: number;
  totalWorkingDaysInMonth: number;
  payableDays: number;
  shiftAllowance?: number;
  overtimeEarnings?: number;
  reimbursementsApproved?: number;
  bonusPayout?: number;
  incentivePayout?: number;
  arrearsAmount?: number;
  pfDeductionEmployee?: number;
  esiDeductionEmployee?: number;
  professionalTax?: number;
  monthlyTdsDeduction?: number;
  loanEmiDeduction?: number;
  otherDeductions?: number;
  employerPfContribution?: number;
  employerEsiContribution?: number;
}

export interface PayrollCalculationBreakdown {
  employeeId: string;
  monthlyCtc: number;
  prorationRatio: number;
  proratedBasic: number;
  proratedHra: number;
  proratedSpecialAllowance: number;
  proratedConveyance: number;
  proratedMedical: number;
  grossEarnedSalary: number;
  totalEarnings: number;
  totalStatutoryDeductions: number;
  totalOtherDeductions: number;
  totalDeductions: number;
  netPayableSalary: number;
  employerTotalCost: number;
}

export class PayrollEngine {
  /**
   * Compute comprehensive monthly pay for an employee.
   */
  static calculateMonthlyPayroll(input: EmployeeSalaryInput): PayrollCalculationBreakdown {
    const prorationRatio =
      input.totalWorkingDaysInMonth > 0
        ? Math.min(1.0, Math.max(0.0, input.payableDays / input.totalWorkingDaysInMonth))
        : 1.0;

    const proratedBasic = Math.round(input.basicSalary * prorationRatio);
    const proratedHra = Math.round(input.hra * prorationRatio);
    const proratedSpecialAllowance = Math.round(input.specialAllowance * prorationRatio);
    const proratedConveyance = Math.round((input.conveyanceAllowance ?? 0) * prorationRatio);
    const proratedMedical = Math.round((input.medicalAllowance ?? 0) * prorationRatio);

    const grossEarnedSalary =
      proratedBasic +
      proratedHra +
      proratedSpecialAllowance +
      proratedConveyance +
      proratedMedical;

    const totalEarnings =
      grossEarnedSalary +
      (input.shiftAllowance ?? 0) +
      (input.overtimeEarnings ?? 0) +
      (input.reimbursementsApproved ?? 0) +
      (input.bonusPayout ?? 0) +
      (input.incentivePayout ?? 0) +
      (input.arrearsAmount ?? 0);

    const totalStatutoryDeductions =
      (input.pfDeductionEmployee ?? 0) +
      (input.esiDeductionEmployee ?? 0) +
      (input.professionalTax ?? 0) +
      (input.monthlyTdsDeduction ?? 0);

    const totalOtherDeductions =
      (input.loanEmiDeduction ?? 0) +
      (input.otherDeductions ?? 0);

    const totalDeductions = totalStatutoryDeductions + totalOtherDeductions;
    const netPayableSalary = Math.max(0, totalEarnings - totalDeductions);

    const employerTotalCost =
      totalEarnings +
      (input.employerPfContribution ?? 0) +
      (input.employerEsiContribution ?? 0);

    return {
      employeeId: input.employeeId,
      monthlyCtc: input.monthlyCtc,
      prorationRatio,
      proratedBasic,
      proratedHra,
      proratedSpecialAllowance,
      proratedConveyance,
      proratedMedical,
      grossEarnedSalary,
      totalEarnings,
      totalStatutoryDeductions,
      totalOtherDeductions,
      totalDeductions,
      netPayableSalary,
      employerTotalCost
    };
  }
}
