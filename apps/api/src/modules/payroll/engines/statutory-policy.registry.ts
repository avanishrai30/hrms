import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

export interface PfPolicy {
  version: string;
  effectiveFrom: string | null;
  provenance: "LEGACY_COMMITTED_ENGINE";
  historicalValidity: "UNVERIFIED";
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
  effectiveFrom: string | null;
  provenance: "LEGACY_COMMITTED_ENGINE";
  historicalValidity: "UNVERIFIED";
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
 * Statutory Policy Registry (Task 05.5)
 *
 * Provides provenanced statutory calculation rules.
 * All calculation constants are sourced from legacy committed engine implementations (commit 35606c2).
 * Historical effective dates were NOT defined in the legacy source files and are explicitly
 * recorded as null with historicalValidity: "UNVERIFIED".
 * Historical periods prior to product adoption boundary fail closed.
 */
export class StatutoryPolicyRegistry {
  /**
   * Authoritative production PF policy.
   * PROVENANCE: Calculation constants sourced from legacy committed PfEngine (Task 30 / commit 35606c2).
   * Note: The legacy source did NOT define an effective date or explicit jurisdiction metadata field.
   */
  private static readonly PF_POLICIES: PfPolicy[] = [
    {
      version: "IN_EPF_COMMITTED_LEGACY",
      effectiveFrom: null,
      provenance: "LEGACY_COMMITTED_ENGINE",
      historicalValidity: "UNVERIFIED",
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
   * Authoritative production ESI policy.
   * PROVENANCE: Calculation constants sourced from legacy committed EsiEngine (Task 30 / commit 35606c2).
   * Note: The legacy source did NOT define an effective date or explicit jurisdiction metadata field.
   */
  private static readonly ESI_POLICIES: EsiPolicy[] = [
    {
      version: "IN_ESI_COMMITTED_LEGACY",
      effectiveFrom: null,
      provenance: "LEGACY_COMMITTED_ENGINE",
      historicalValidity: "UNVERIFIED",
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
   * Fails closed if jurisdiction is missing/unsupported or period has unverified history.
   */
  static resolveEffectivePolicy<
    T extends {
      effectiveFrom?: string | null;
      jurisdiction: string;
      version: string;
      historicalValidity?: string;
    }
  >(policies: T[], params: PolicyResolutionParams): T {
    const { year, month, jurisdiction } = params;
    this.validatePeriod(year, month);

    if (!jurisdiction || typeof jurisdiction !== "string" || jurisdiction.trim() === "") {
      throw new BadRequestException("Payroll statutory jurisdiction is required.");
    }

    const normalizedJurisdiction = jurisdiction.trim().toUpperCase();
    const periodIso = `${year}-${String(month).padStart(2, "0")}-01`;

    const forJurisdiction = policies.filter((p) => p.jurisdiction === normalizedJurisdiction);

    if (forJurisdiction.length === 0) {
      throw new BadRequestException(
        `No statutory policy is configured for jurisdiction "${normalizedJurisdiction}".`
      );
    }

    // If policies define explicit historical effective dates (e.g. synthetic test fixtures):
    const datedPolicies = forJurisdiction
      .filter((p): p is T & { effectiveFrom: string } => typeof p.effectiveFrom === "string" && p.effectiveFrom.length > 0)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

    if (datedPolicies.length > 0) {
      const matched = datedPolicies.find((p) => p.effectiveFrom <= periodIso);
      if (!matched) {
        throw new BadRequestException(
          `No statutory policy is configured for jurisdiction "${normalizedJurisdiction}" for period ${year}-${String(month).padStart(2, "0")}.`
        );
      }
      return matched;
    }

    // For unverified legacy policies without provenanced historical effective dates:
    // Fail closed if period precedes product adoption boundary (year < 2026)
    if (year < 2026) {
      throw new BadRequestException(
        `Statutory policy history is not configured for this payroll period (${year}-${String(month).padStart(2, "0")}).`
      );
    }

    const fallback = forJurisdiction[0];
    if (!fallback) {
      throw new BadRequestException(
        `No statutory policy is configured for jurisdiction "${normalizedJurisdiction}".`
      );
    }

    return fallback;
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
