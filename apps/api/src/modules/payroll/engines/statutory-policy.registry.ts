import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

export interface PfPolicy {
  version: string;
  effectiveFrom: string; // "YYYY-MM-DD"
  jurisdiction: string;  // e.g. "IN"
  wageCeiling: Prisma.Decimal;
  employeeRate: Prisma.Decimal;
  employerTotalRate: Prisma.Decimal;
  epsRate: Prisma.Decimal;
  maxEpsContribution: Prisma.Decimal;
  edliRate: Prisma.Decimal;
  maxEdliContribution: Prisma.Decimal;
  adminRate: Prisma.Decimal;
}

export interface EsiPolicy {
  version: string;
  effectiveFrom: string; // "YYYY-MM-DD"
  jurisdiction: string;  // e.g. "IN"
  wageCeiling: Prisma.Decimal;
  disabilityCeiling: Prisma.Decimal;
  employeeRate: Prisma.Decimal;
  employerRate: Prisma.Decimal;
}

export interface PolicyResolutionParams {
  year: number;
  month: number;
  jurisdiction: string;
}

/**
 * Statutory Policy Registry (Task 05.4)
 *
 * Provides provenanced, effective-dated statutory calculation rules.
 * All production policies are derived strictly from legacy committed engine constants.
 * Historical and unsupported periods fail closed without synthetic defaults.
 */
export class StatutoryPolicyRegistry {
  /**
   * Authoritative production PF policies.
   * PROVENANCE: Legacy committed constants in PfEngine (Task 30 / commit 35606c2).
   */
  private static readonly PF_POLICIES: PfPolicy[] = [
    {
      version: "IN_EPF_COMMITTED_LEGACY",
      effectiveFrom: "2014-09-01",
      jurisdiction: "IN",
      wageCeiling: new Prisma.Decimal("15000.00"),
      employeeRate: new Prisma.Decimal("0.12"),
      employerTotalRate: new Prisma.Decimal("0.12"),
      epsRate: new Prisma.Decimal("0.0833"),
      maxEpsContribution: new Prisma.Decimal("1250.00"),
      edliRate: new Prisma.Decimal("0.005"),
      maxEdliContribution: new Prisma.Decimal("75.00"),
      adminRate: new Prisma.Decimal("0.005")
    }
  ];

  /**
   * Authoritative production ESI policies.
   * PROVENANCE: Legacy committed constants in EsiEngine (Task 30 / commit 35606c2).
   */
  private static readonly ESI_POLICIES: EsiPolicy[] = [
    {
      version: "IN_ESI_COMMITTED_LEGACY",
      effectiveFrom: "2019-07-01",
      jurisdiction: "IN",
      wageCeiling: new Prisma.Decimal("21000.00"),
      disabilityCeiling: new Prisma.Decimal("25000.00"),
      employeeRate: new Prisma.Decimal("0.0075"),
      employerRate: new Prisma.Decimal("0.0325")
    }
  ];

  /**
   * Validates period input strictly without synthetic defaults.
   */
  static validatePeriod(year: number, month: number): void {
    if (
      year === undefined ||
      year === null ||
      typeof year !== "number" ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > 2100
    ) {
      throw new BadRequestException("Invalid or missing payroll year.");
    }
    if (
      month === undefined ||
      month === null ||
      typeof month !== "number" ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      throw new BadRequestException("Invalid or missing payroll month. Month must be between 1 and 12.");
    }
  }

  /**
   * Pure policy resolver helper for testing and custom injection.
   * Resolves the effective rule set in effect for the given period.
   * Fails closed if jurisdiction is missing/unsupported or period precedes earliest effectiveFrom.
   */
  static resolveEffectivePolicy<T extends { effectiveFrom: string; jurisdiction: string; version: string }>(
    policies: T[],
    params: PolicyResolutionParams
  ): T {
    const { year, month, jurisdiction } = params;
    this.validatePeriod(year, month);

    if (!jurisdiction || typeof jurisdiction !== "string" || jurisdiction.trim() === "") {
      throw new BadRequestException("Payroll statutory jurisdiction is required.");
    }

    const normalizedJurisdiction = jurisdiction.trim().toUpperCase();
    const periodIso = `${year}-${String(month).padStart(2, "0")}-01`;

    const forJurisdiction = policies
      .filter((p) => p.jurisdiction === normalizedJurisdiction)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

    if (forJurisdiction.length === 0) {
      throw new BadRequestException(
        `No statutory policy is configured for jurisdiction "${normalizedJurisdiction}".`
      );
    }

    const matched = forJurisdiction.find((p) => p.effectiveFrom <= periodIso);
    if (!matched) {
      throw new BadRequestException(
        `No statutory policy is configured for jurisdiction "${normalizedJurisdiction}" for period ${year}-${String(month).padStart(2, "0")}.`
      );
    }

    return matched;
  }

  /**
   * Resolves the authoritative PF statutory policy in effect for the given payroll period and jurisdiction.
   */
  static getPfPolicy(params: PolicyResolutionParams): PfPolicy {
    return this.resolveEffectivePolicy(this.PF_POLICIES, params);
  }

  /**
   * Resolves the authoritative ESI statutory policy in effect for the given payroll period and jurisdiction.
   */
  static getEsiPolicy(params: PolicyResolutionParams): EsiPolicy {
    return this.resolveEffectivePolicy(this.ESI_POLICIES, params);
  }
}
