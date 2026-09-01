/**
 * TASK 28 — EXECUTIVE WORKFORCE INTELLIGENCE ENGINE
 * Aggregates CEO & CHRO dashboard telemetry, revenue per employee, vacancy rates,
 * and talent risk heatmaps.
 */

export interface ExecutiveMetricsInput {
  totalHeadcount: number;
  totalAnnualRevenue: number;
  totalAnnualWorkforceCost: number;
  openPositionsCount: number;
  criticalRolesCount: number;
  successorsCoveredCount: number;
  highFlightRiskCount: number;
  annualAttritionRate: number;
  averageTimeToFillDays: number;
  learningHoursPerEmployee: number;
}

export interface ExecutiveDashboardTelemetry {
  revenuePerEmployee: number;
  workforceCostRatioPercent: number; // Workforce Cost / Revenue
  vacancyRatePercent: number;
  successionCoverageRatePercent: number;
  talentRiskScore: number; // 0 - 100
  ceoSummary: {
    totalHeadcount: number;
    annualWorkforceCost: number;
    annualAttritionRatePercent: number;
    productivityIndex: number;
  };
  chroSummary: {
    criticalRolesCount: number;
    successorsCoveredCount: number;
    benchStrengthHealth: "HEALTHY" | "MODERATE" | "AT_RISK";
    highFlightRiskEmployees: number;
    averageTimeToFillDays: number;
    learningRoiHours: number;
  };
}

export class ExecutiveIntelligenceEngine {
  /**
   * Aggregate high-level executive strategic metrics for leadership reviews.
   */
  static computeExecutiveTelemetry(input: ExecutiveMetricsInput): ExecutiveDashboardTelemetry {
    const revenuePerEmployee =
      input.totalHeadcount > 0 ? Math.round(input.totalAnnualRevenue / input.totalHeadcount) : 0;

    const workforceCostRatioPercent =
      input.totalAnnualRevenue > 0
        ? Math.round((input.totalAnnualWorkforceCost / input.totalAnnualRevenue) * 1000) / 10
        : 0;

    const totalPositions = input.totalHeadcount + input.openPositionsCount;
    const vacancyRatePercent =
      totalPositions > 0
        ? Math.round((input.openPositionsCount / totalPositions) * 1000) / 10
        : 0;

    const successionCoverageRatePercent =
      input.criticalRolesCount > 0
        ? Math.round((input.successorsCoveredCount / input.criticalRolesCount) * 1000) / 10
        : 100;

    // Talent Risk Score: Attrition (40%) + Uncovered Critical Roles (35%) + Flight Risk Pool (25%)
    const uncoveredRoles = Math.max(0, input.criticalRolesCount - input.successorsCoveredCount);
    const uncoveredRatio = input.criticalRolesCount > 0 ? uncoveredRoles / input.criticalRolesCount : 0;
    const flightRiskRatio = input.totalHeadcount > 0 ? input.highFlightRiskCount / input.totalHeadcount : 0;

    const rawTalentRisk =
      input.annualAttritionRate * 100 * 0.4 + uncoveredRatio * 100 * 0.35 + flightRiskRatio * 100 * 0.25;
    const talentRiskScore = Math.min(100, Math.round(rawTalentRisk * 10) / 10);

    let benchHealth: "HEALTHY" | "MODERATE" | "AT_RISK";
    if (successionCoverageRatePercent >= 80) {
      benchHealth = "HEALTHY";
    } else if (successionCoverageRatePercent >= 50) {
      benchHealth = "MODERATE";
    } else {
      benchHealth = "AT_RISK";
    }

    const productivityIndex = Math.min(100, Math.round((revenuePerEmployee / 100000) * 10) / 10);

    return {
      revenuePerEmployee,
      workforceCostRatioPercent,
      vacancyRatePercent,
      successionCoverageRatePercent,
      talentRiskScore,
      ceoSummary: {
        totalHeadcount: input.totalHeadcount,
        annualWorkforceCost: input.totalAnnualWorkforceCost,
        annualAttritionRatePercent: Math.round(input.annualAttritionRate * 1000) / 10,
        productivityIndex
      },
      chroSummary: {
        criticalRolesCount: input.criticalRolesCount,
        successorsCoveredCount: input.successorsCoveredCount,
        benchStrengthHealth: benchHealth,
        highFlightRiskEmployees: input.highFlightRiskCount,
        averageTimeToFillDays: input.averageTimeToFillDays,
        learningRoiHours: input.learningHoursPerEmployee
      }
    };
  }
}
