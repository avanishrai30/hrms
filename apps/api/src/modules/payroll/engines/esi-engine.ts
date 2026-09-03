import { Prisma } from "@prisma/client";
import { PayrollMoney } from "./payroll-money.js";
import {
  StatutoryPolicyRegistry,
  type EsiPolicy
} from "./statutory-policy.registry.js";

/**
 * EMPLOYEES' STATE INSURANCE (ESI) ENGINE (Task 05.4)
 * Calculates configured statutory ESI contributions using authoritative Decimal arithmetic
 * and period-effective statutory policy.
 */
export interface EsiCalculationInput {
  grossMonthlyWages: Prisma.Decimal | number | string;
  isDisabilityCovered?: boolean;
  isPreviouslyCoveredInCycle?: boolean;
  policy?: EsiPolicy;
  year?: number;
  month?: number;
  jurisdiction?: string;
}

export interface EsiCalculationResult {
  isEligible: boolean;
  grossWageBasis: number;
  employeeEsiContribution: number;
  employerEsiContribution: number;
  totalMonthlyEsiDeposit: number;
  // Authoritative Decimal fields
  grossWageBasisDecimal: Prisma.Decimal;
  employeeEsiContributionDecimal: Prisma.Decimal;
  employerEsiContributionDecimal: Prisma.Decimal;
  totalMonthlyEsiDepositDecimal: Prisma.Decimal;
  policy: EsiPolicy;
  policyVersion: string;
}

export class EsiEngine {
  /**
   * Evaluate ESI eligibility and calculate exact contribution shares using Decimal arithmetic.
   */
  static calculateEsi(input: EsiCalculationInput): EsiCalculationResult {
    const policy =
      input.policy ??
      StatutoryPolicyRegistry.getEsiPolicy({
        year: input.year!,
        month: input.month!,
        jurisdiction: input.jurisdiction!
      });

    const grossDecimal = PayrollMoney.requireDecimal(input.grossMonthlyWages, "Gross Monthly Wages");

    const ceiling = input.isDisabilityCovered
      ? policy.disabilityCeiling
      : policy.wageCeiling;

    const isEligible =
      grossDecimal.lessThanOrEqualTo(ceiling) || (input.isPreviouslyCoveredInCycle ?? false);

    if (!isEligible) {
      return {
        isEligible: false,
        grossWageBasis: grossDecimal.toNumber(),
        employeeEsiContribution: 0,
        employerEsiContribution: 0,
        totalMonthlyEsiDeposit: 0,
        grossWageBasisDecimal: grossDecimal,
        employeeEsiContributionDecimal: PayrollMoney.zero(),
        employerEsiContributionDecimal: PayrollMoney.zero(),
        totalMonthlyEsiDepositDecimal: PayrollMoney.zero(),
        policy,
        policyVersion: policy.version
      };
    }

    const employeeEsiContributionDecimal = PayrollMoney.round(
      grossDecimal.mul(policy.employeeRate)
    );
    const employerEsiContributionDecimal = PayrollMoney.round(
      grossDecimal.mul(policy.employerRate)
    );
    const totalMonthlyEsiDepositDecimal = employeeEsiContributionDecimal.add(
      employerEsiContributionDecimal
    );

    return {
      isEligible: true,
      grossWageBasis: grossDecimal.toNumber(),
      employeeEsiContribution: employeeEsiContributionDecimal.toNumber(),
      employerEsiContribution: employerEsiContributionDecimal.toNumber(),
      totalMonthlyEsiDeposit: totalMonthlyEsiDepositDecimal.toNumber(),
      grossWageBasisDecimal: grossDecimal,
      employeeEsiContributionDecimal,
      employerEsiContributionDecimal,
      totalMonthlyEsiDepositDecimal,
      policy,
      policyVersion: policy.version
    };
  }
}
