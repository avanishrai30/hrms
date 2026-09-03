import { Prisma } from "@prisma/client";

export interface PfPolicy {
  version: string;
  effectiveFrom: string; // "YYYY-MM-DD"
  jurisdiction: string;  // "IN"
  wageCeiling: Prisma.Decimal;
  employeeRate: Prisma.Decimal;       // e.g. 0.12
  employerTotalRate: Prisma.Decimal;  // e.g. 0.12
  epsRate: Prisma.Decimal;            // e.g. 0.0833
  maxEpsContribution: Prisma.Decimal; // e.g. 1250
  edliRate: Prisma.Decimal;           // e.g. 0.005
  maxEdliContribution: Prisma.Decimal;// e.g. 75
  adminRate: Prisma.Decimal;          // e.g. 0.005
}

export interface EsiPolicy {
  version: string;
  effectiveFrom: string; // "YYYY-MM-DD"
  jurisdiction: string;  // "IN"
  wageCeiling: Prisma.Decimal;        // e.g. 21000
  disabilityCeiling: Prisma.Decimal;  // e.g. 25000
  employeeRate: Prisma.Decimal;       // e.g. 0.0075
  employerRate: Prisma.Decimal;       // e.g. 0.0325
}

/**
 * Statutory Policy Registry (Task 05.3)
 *
 * Provides versioned, effective-dated statutory rule sets.
 * Historical payroll calculations remain reproducible by evaluating the policy
 * effective for the given payroll period (month/year), without dependence on
 * wall-clock execution date.
 */
export class StatutoryPolicyRegistry {
  private static readonly PF_POLICIES: PfPolicy[] = [
    {
      version: "IN_EPF_STATUTORY_2014",
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
    },
    {
      version: "IN_EPF_HISTORICAL_2001",
      effectiveFrom: "2001-06-01",
      jurisdiction: "IN",
      wageCeiling: new Prisma.Decimal("6500.00"),
      employeeRate: new Prisma.Decimal("0.12"),
      employerTotalRate: new Prisma.Decimal("0.12"),
      epsRate: new Prisma.Decimal("0.0833"),
      maxEpsContribution: new Prisma.Decimal("541.00"),
      edliRate: new Prisma.Decimal("0.005"),
      maxEdliContribution: new Prisma.Decimal("32.50"),
      adminRate: new Prisma.Decimal("0.005")
    }
  ];

  private static readonly ESI_POLICIES: EsiPolicy[] = [
    {
      version: "IN_ESI_STATUTORY_2019",
      effectiveFrom: "2019-07-01",
      jurisdiction: "IN",
      wageCeiling: new Prisma.Decimal("21000.00"),
      disabilityCeiling: new Prisma.Decimal("25000.00"),
      employeeRate: new Prisma.Decimal("0.0075"),
      employerRate: new Prisma.Decimal("0.0325")
    },
    {
      version: "IN_ESI_HISTORICAL_2016",
      effectiveFrom: "2016-12-01",
      jurisdiction: "IN",
      wageCeiling: new Prisma.Decimal("21000.00"),
      disabilityCeiling: new Prisma.Decimal("25000.00"),
      employeeRate: new Prisma.Decimal("0.0175"),
      employerRate: new Prisma.Decimal("0.0475")
    }
  ];

  /**
   * Resolves the authoritative PF statutory policy in effect for the given payroll period.
   */
  static getPfPolicy(year = 2026, month = 1, jurisdiction = "IN"): PfPolicy {
    const periodIso = `${year}-${String(month).padStart(2, "0")}-01`;
    const sorted = [...this.PF_POLICIES]
      .filter((p) => p.jurisdiction === jurisdiction)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

    const matched = sorted.find((p) => p.effectiveFrom <= periodIso);
    return matched ?? sorted[sorted.length - 1]!;
  }

  /**
   * Resolves the authoritative ESI statutory policy in effect for the given payroll period.
   */
  static getEsiPolicy(year = 2026, month = 1, jurisdiction = "IN"): EsiPolicy {
    const periodIso = `${year}-${String(month).padStart(2, "0")}-01`;
    const sorted = [...this.ESI_POLICIES]
      .filter((p) => p.jurisdiction === jurisdiction)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

    const matched = sorted.find((p) => p.effectiveFrom <= periodIso);
    return matched ?? sorted[sorted.length - 1]!;
  }
}
