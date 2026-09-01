export interface CeoMetrics {
  totalEmployees: number;
  revenuePerEmployee: number;
  totalWorkforceCostInr: number;
  hiringVelocityDays: number;
  attritionRiskPercent: number;
  productivityIndex: number; // 0 - 100
  growthForecastPercent: number;
}

export interface ChroMetrics {
  averageEngagementScore: number; // 0 - 5
  highPerformersPercent: number;
  learningRoiIndex: number;
  successionReadinessPercent: number;
  benchStrengthScore: number;
  flightRiskCount: number;
}

export interface CfoMetrics {
  monthlyPayrollSpendInr: number;
  annualBudgetConsumptionPercent: number;
  pendingReimbursementsInr: number;
  statutoryDuesInr: number;
  projectedAnnualRunRateInr: number;
  costTrend: "INCREASING" | "STABLE" | "OPTIMIZED";
}

export interface AiWorkforceRisk {
  category: "TALENT" | "COST" | "COMPLIANCE" | "ATTRITION" | "OPERATIONS";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  impact: string;
  recommendedAction: string;
}

export class ExecutiveAiEngine {
  static computeCeoMetrics(params: {
    totalEmployees: number;
    annualRevenueInr: number;
    totalPayrollAnnualInr: number;
    avgOpenDays: number;
    attritionCount: number;
    completedGoalsPercent: number;
  }): CeoMetrics {
    const totalEmployees = Math.max(1, params.totalEmployees);
    const revenuePerEmployee = Math.round(params.annualRevenueInr / totalEmployees);
    const attritionRiskPercent = parseFloat(((params.attritionCount / totalEmployees) * 100).toFixed(1));
    const productivityIndex = Math.min(100, Math.round((params.completedGoalsPercent * 0.7) + (30 * (1 - (attritionRiskPercent / 100)))));
    const growthForecastPercent = parseFloat((((params.annualRevenueInr - params.totalPayrollAnnualInr) / Math.max(1, params.annualRevenueInr)) * 25).toFixed(1));

    return {
      totalEmployees,
      revenuePerEmployee,
      totalWorkforceCostInr: params.totalPayrollAnnualInr,
      hiringVelocityDays: Math.round(params.avgOpenDays),
      attritionRiskPercent,
      productivityIndex,
      growthForecastPercent
    };
  }

  static computeChroMetrics(params: {
    avgHappinessScore: number; // 0 - 5
    performanceRatingAvg: number; // 0 - 5
    completedTrainings: number;
    enrolledTrainings: number;
    readySuccessors: number;
    keyPositions: number;
    flightRisks: number;
  }): ChroMetrics {
    const keyPositions = Math.max(1, params.keyPositions);
    const successionReadinessPercent = parseFloat(((params.readySuccessors / keyPositions) * 100).toFixed(1));
    const learningRatio = params.enrolledTrainings > 0 ? (params.completedTrainings / params.enrolledTrainings) : 1;
    const learningRoiIndex = parseFloat((learningRatio * 85 + 15).toFixed(1));
    const highPerformersPercent = parseFloat(((params.performanceRatingAvg / 5) * 35 + 40).toFixed(1));
    const benchStrengthScore = parseFloat(((successionReadinessPercent * 0.6) + (learningRoiIndex * 0.4)).toFixed(1));

    return {
      averageEngagementScore: parseFloat(params.avgHappinessScore.toFixed(2)),
      highPerformersPercent,
      learningRoiIndex,
      successionReadinessPercent,
      benchStrengthScore,
      flightRiskCount: params.flightRisks
    };
  }

  static computeCfoMetrics(params: {
    monthlyPayrollInr: number;
    allocatedAnnualBudgetInr: number;
    spentToDateInr: number;
    pendingClaimsInr: number;
    statutoryTaxesInr: number;
  }): CfoMetrics {
    const budget = Math.max(1, params.allocatedAnnualBudgetInr);
    const annualBudgetConsumptionPercent = parseFloat(((params.spentToDateInr / budget) * 100).toFixed(1));
    const projectedAnnualRunRateInr = (params.monthlyPayrollInr * 12) + params.pendingClaimsInr + params.statutoryTaxesInr;
    
    let costTrend: "INCREASING" | "STABLE" | "OPTIMIZED" = "STABLE";
    if (annualBudgetConsumptionPercent > 90) costTrend = "INCREASING";
    else if (annualBudgetConsumptionPercent < 60) costTrend = "OPTIMIZED";

    return {
      monthlyPayrollSpendInr: params.monthlyPayrollInr,
      annualBudgetConsumptionPercent,
      pendingReimbursementsInr: params.pendingClaimsInr,
      statutoryDuesInr: params.statutoryTaxesInr,
      projectedAnnualRunRateInr,
      costTrend
    };
  }

  static generateAiRiskInsights(params: {
    ceo: CeoMetrics;
    chro: ChroMetrics;
    cfo: CfoMetrics;
  }): AiWorkforceRisk[] {
    const risks: AiWorkforceRisk[] = [];

    if (params.ceo.attritionRiskPercent > 12) {
      risks.push({
        category: "ATTRITION",
        severity: params.ceo.attritionRiskPercent > 20 ? "CRITICAL" : "HIGH",
        title: "Elevated Organizational Attrition Velocity",
        impact: `Current projected annual attrition is ${params.ceo.attritionRiskPercent}%, risking knowledge loss in key operations.`,
        recommendedAction: "Initiate proactive stay-interviews and review salary benchmark calibration for critical designations."
      });
    }

    if (params.chro.flightRiskCount > 0) {
      risks.push({
        category: "TALENT",
        severity: "HIGH",
        title: `${params.chro.flightRiskCount} Key Personnel Identified with High Flight Risk`,
        impact: "Key talent turnover could stall ongoing quarterly deliverable roadmaps.",
        recommendedAction: "Deploy retention grants, immediate manager 1-on-1s, and clear career path progression ladders."
      });
    }

    if (params.cfo.annualBudgetConsumptionPercent > 85) {
      risks.push({
        category: "COST",
        severity: "HIGH",
        title: "Workforce Budget Consumption Approaching Ceiling",
        impact: `Annual budget consumption has reached ${params.cfo.annualBudgetConsumptionPercent}%.`,
        recommendedAction: "Freeze non-critical lateral replacement requisitions and optimize overtime approvals."
      });
    }

    if (params.chro.successionReadinessPercent < 60) {
      risks.push({
        category: "OPERATIONS",
        severity: "MEDIUM",
        title: "Succession Gap in Tier-1 Leadership Roles",
        impact: `Only ${params.chro.successionReadinessPercent}% of critical positions have ready successors.`,
        recommendedAction: "Fast-track High-Potential (HiPo) leadership mentorship paths and internal leadership rotation."
      });
    }

    if (risks.length === 0) {
      risks.push({
        category: "TALENT",
        severity: "LOW",
        title: "Workforce Operations & Health Stabilized",
        impact: "All operational, cost, and retention KPIs are within optimal enterprise tolerance levels.",
        recommendedAction: "Continue monitoring pulse surveys and maintain quarterly performance check-ins."
      });
    }

    return risks;
  }
}
