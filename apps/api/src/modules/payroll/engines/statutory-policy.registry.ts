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
  policyVersion?: string;
  policyAppliesFrom?: string;
}

/**
 * Statutory Policy Registry (Task 05.6)
 *
 * Provides provenanced statutory calculation rules.
 * All calculation constants are sourced from legacy committed engine implementations (commit 35606c2).
 * Historical effective dates were NOT defined in the legacy source files and are explicitly
 * recorded as null with historicalValidity: "UNVERIFIED".
 *
 * Policy applicability is explicitly owned by tenant configuration (statutoryJurisdiction,
 * pfPolicyVersion, esiPolicyVersion, policyAppliesFrom). No synthetic year boundaries or
 * implicit first-policy fallbacks exist.
 */
export class StatutoryPolicyRegistry {
  /**
   * Authoritative production PF policy.
   * PROVENANCE: Calculation constants sourced from legacy committed PfEngine (commit 35606c2).
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
   * PROVENANCE: Calculation constants sourced from legacy committed EsiEngine (commit 35606c2).
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
   * Explicitly resolves the tenant-configured policy version.
   * NEVER selects policies[0] or forJurisdiction[0].
   * Enforces tenant policy applicability period (policyAppliesFrom).
   */
  static resolveConfiguredPolicy<
    T extends {
      effectiveFrom?: string | null;
      jurisdiction: string;
      version: string;
      historicalValidity?: string;
    }
  >(
    policies: T[],
    params: {
      year: number;
      month: number;
      jurisdiction: string;
      policyVersion: string;
      policyAppliesFrom?: string;
    }
  ): T {
    const { year, month, jurisdiction, policyVersion, policyAppliesFrom } = params;
    this.validatePeriod(year, month);

    if (!jurisdiction || typeof jurisdiction !== "string" || jurisdiction.trim() === "") {
      throw new BadRequestException("Payroll statutory jurisdiction is required.");
    }
    if (!policyVersion || typeof policyVersion !== "string" || policyVersion.trim() === "") {
      throw new BadRequestException("Statutory policy version is required.");
    }

    const normalizedJurisdiction = jurisdiction.trim().toUpperCase();
    const periodIso = `${year}-${String(month).padStart(2, "0")}`;

    // Tenant product configuration applicability check (Task 05.6 Blocker 3)
    if (policyAppliesFrom) {
      if (periodIso < policyAppliesFrom) {
        throw new BadRequestException(
          `Payroll period ${periodIso} precedes configured statutory policy applicability period (${policyAppliesFrom}).`
        );
      }
    }

    const forJurisdiction = policies.filter((p) => p.jurisdiction === normalizedJurisdiction);
    if (forJurisdiction.length === 0) {
      throw new BadRequestException(
        `No statutory policy is configured for jurisdiction "${normalizedJurisdiction}".`
      );
    }

    // Explicit policy version matching — never policies[0] or forJurisdiction[0]
    const matched = forJurisdiction.find((p) => p.version === policyVersion);
    if (!matched) {
      throw new BadRequestException(
        `Statutory policy version "${policyVersion}" is not registered for jurisdiction "${normalizedJurisdiction}".`
      );
    }

    // If the policy has an explicit legal effectiveFrom date (e.g. synthetic test fixtures):
    if (typeof matched.effectiveFrom === "string" && matched.effectiveFrom.length > 0) {
      const fullPeriodIso = `${periodIso}-01`;
      if (matched.effectiveFrom > fullPeriodIso) {
        throw new BadRequestException(
          `Statutory policy "${policyVersion}" is not effective for period ${periodIso} (effectiveFrom: ${matched.effectiveFrom}).`
        );
      }
    }

    return matched;
  }

  /**
   * Pure policy resolver helper for testing and custom injection with dated policies.
   */
  static resolveEffectivePolicy<
    T extends {
      effectiveFrom?: string | null;
      jurisdiction: string;
      version: string;
      historicalValidity?: string;
    }
  >(policies: T[], params: PolicyResolutionParams): T {
    const { year, month, jurisdiction, policyVersion, policyAppliesFrom } = params;

    if (policyVersion) {
      return this.resolveConfiguredPolicy(policies, {
        year,
        month,
        jurisdiction,
        policyVersion,
        policyAppliesFrom
      });
    }

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

    const datedPolicies = forJurisdiction
      .filter((p): p is T & { effectiveFrom: string } => typeof p.effectiveFrom === "string" && p.effectiveFrom.length > 0)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

    if (datedPolicies.length === 0) {
      throw new BadRequestException(
        `Explicit policyVersion is required for unverified statutory policies in jurisdiction "${normalizedJurisdiction}".`
      );
    }

    const matched = datedPolicies.find((p) => p.effectiveFrom <= periodIso);
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
  static getPfPolicy(params: {
    year: number;
    month: number;
    jurisdiction: string;
    policyVersion: string;
    policyAppliesFrom?: string;
  }): PfPolicy {
    return this.resolveConfiguredPolicy(this.PF_POLICIES, params);
  }

  /**
   * Resolves the authoritative ESI statutory policy in effect for the given payroll period and jurisdiction.
   */
  static getEsiPolicy(params: {
    year: number;
    month: number;
    jurisdiction: string;
    policyVersion: string;
    policyAppliesFrom?: string;
  }): EsiPolicy {
    return this.resolveConfiguredPolicy(this.ESI_POLICIES, params);
  }
}
