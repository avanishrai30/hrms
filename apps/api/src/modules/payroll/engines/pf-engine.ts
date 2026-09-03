import { Prisma } from "@prisma/client";
import { PayrollMoney } from "./payroll-money.js";
import {
  StatutoryPolicyRegistry,
  type PfPolicy
} from "./statutory-policy.registry.js";

/**
 * EMPLOYEES' PROVIDENT FUND (EPF & EPS) ENGINE (Task 05.6)
 * Calculates configured statutory PF contributions using authoritative Decimal arithmetic
 * and tenant-configured statutory policy.
 */
export interface PfCalculationInput {
  basicMonthlySalary: Prisma.Decimal | number | string;
  daMonthlySalary?: Prisma.Decimal | number | string;
  isPfCappedAtStatutoryWageCeiling?: boolean;
  policy?: PfPolicy;
  year?: number;
  month?: number;
  jurisdiction?: string;
  policyVersion?: string;
  policyAppliesFrom?: string;
}

export interface PfCalculationResult {
  pfWage: number;
  employeePfContribution: number;
  employerEpsContribution: number;
  employerEpfContribution: number;
  employerEdliContribution: number;
  employerAdminCharges: number;
  totalEmployerPfCost: number;
  totalMonthlyPfDeposit: number;
  // Authoritative Decimal fields
  pfWageDecimal: Prisma.Decimal;
  employeePfContributionDecimal: Prisma.Decimal;
  employerEpsContributionDecimal: Prisma.Decimal;
  employerEpfContributionDecimal: Prisma.Decimal;
  employerEdliContributionDecimal: Prisma.Decimal;
  employerAdminChargesDecimal: Prisma.Decimal;
  totalEmployerPfCostDecimal: Prisma.Decimal;
  totalMonthlyPfDepositDecimal: Prisma.Decimal;
  policy: PfPolicy;
  policyVersion: string;
}

export class PfEngine {
  /**
   * Calculate monthly PF breakdown for employee and employer using authoritative Decimal arithmetic.
   */
  static calculatePf(input: PfCalculationInput): PfCalculationResult {
    const policy =
      input.policy ??
      StatutoryPolicyRegistry.getPfPolicy({
        year: input.year!,
        month: input.month!,
        jurisdiction: input.jurisdiction!,
        policyVersion: input.policyVersion!,
        policyAppliesFrom: input.policyAppliesFrom
      });

    const basicDecimal = PayrollMoney.requireDecimal(input.basicMonthlySalary, "Basic Salary");
    const daDecimal = input.daMonthlySalary !== undefined && input.daMonthlySalary !== null
      ? PayrollMoney.requireDecimal(input.daMonthlySalary, "DA")
      : PayrollMoney.zero();

    const rawPfWage = basicDecimal.add(daDecimal);
    const pfWageDecimal = input.isPfCappedAtStatutoryWageCeiling
      ? (rawPfWage.greaterThan(policy.wageCeiling) ? policy.wageCeiling : rawPfWage)
      : rawPfWage;

    // Employee PF contribution: pfWage * employeeRate
    const employeePfContributionDecimal = PayrollMoney.round(
      pfWageDecimal.mul(policy.employeeRate)
    );

    // EPS contribution: wage capped at wage ceiling * epsRate, capped at maxEpsContribution
    const epsWageBasis = pfWageDecimal.greaterThan(policy.wageCeiling)
      ? policy.wageCeiling
      : pfWageDecimal;

    const rawEps = epsWageBasis.mul(policy.epsRate).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
    const employerEpsContributionDecimal = rawEps.greaterThan(policy.maxEpsContribution)
      ? policy.maxEpsContribution
      : rawEps;

    // Employer EPF contribution: Total Employer matching - EPS share
    const totalEmployerTwelvePercent = PayrollMoney.round(
      pfWageDecimal.mul(policy.employerTotalRate)
    );
    const diffEpf = totalEmployerTwelvePercent.sub(employerEpsContributionDecimal);
    const employerEpfContributionDecimal = diffEpf.isNegative()
      ? PayrollMoney.zero()
      : diffEpf;

    // EDLI: epsWageBasis * edliRate, capped at maxEdliContribution
    const rawEdli = epsWageBasis.mul(policy.edliRate).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
    const employerEdliContributionDecimal = rawEdli.greaterThan(policy.maxEdliContribution)
      ? policy.maxEdliContribution
      : rawEdli;

    // Admin charges: epsWageBasis * adminRate
    const employerAdminChargesDecimal = epsWageBasis
      .mul(policy.adminRate)
      .toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);

    // Total Employer institutional PF cost
    const totalEmployerPfCostDecimal = employerEpfContributionDecimal
      .add(employerEpsContributionDecimal)
      .add(employerEdliContributionDecimal)
      .add(employerAdminChargesDecimal);

    // Total combined deposit
    const totalMonthlyPfDepositDecimal = employeePfContributionDecimal.add(
      totalEmployerPfCostDecimal
    );

    return {
      pfWage: pfWageDecimal.toNumber(),
      employeePfContribution: employeePfContributionDecimal.toNumber(),
      employerEpsContribution: employerEpsContributionDecimal.toNumber(),
      employerEpfContribution: employerEpfContributionDecimal.toNumber(),
      employerEdliContribution: employerEdliContributionDecimal.toNumber(),
      employerAdminCharges: employerAdminChargesDecimal.toNumber(),
      totalEmployerPfCost: totalEmployerPfCostDecimal.toNumber(),
      totalMonthlyPfDeposit: totalMonthlyPfDepositDecimal.toNumber(),
      pfWageDecimal,
      employeePfContributionDecimal,
      employerEpsContributionDecimal,
      employerEpfContributionDecimal,
      employerEdliContributionDecimal,
      employerAdminChargesDecimal,
      totalEmployerPfCostDecimal,
      totalMonthlyPfDepositDecimal,
      policy,
      policyVersion: policy.version
    };
  }
}
