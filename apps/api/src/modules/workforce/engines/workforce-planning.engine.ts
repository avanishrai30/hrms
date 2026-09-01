/**
 * TASK 28 — WORKFORCE PLANNING ENGINE
 * Calculates headcount gaps, scenario costs, vacancy rates, and salary/benefits breakdowns.
 */

export interface HeadcountScenarioInput {
  baseHeadcount: number;
  baseAnnualBudget: number;
  averageAnnualSalaryPerHead: number;
  benefitsRatio: number; // e.g. 0.20 for 20%
  taxesAndContributionsRatio: number; // e.g. 0.12 for 12%
  headcountDelta: number; // e.g. +20 or -5
  trainingCostPerHire: number; // e.g. 25,000
  recruitmentCostPerHire: number; // e.g. 50,000
  assetCostPerHire: number; // e.g. 75,000
}

export interface HeadcountScenarioOutput {
  projectedHeadcount: number;
  headcountDelta: number;
  projectedAnnualSalaryCost: number;
  projectedAnnualBenefitsCost: number;
  projectedAnnualContributionsCost: number;
  oneTimeOnboardingCost: number;
  totalProjectedWorkforceCost: number;
  costDelta: number;
  percentageCostChange: number;
}

export class WorkforcePlanningEngine {
  /**
   * Simulate a headcount growth scenario and return comprehensive workforce cost impact.
   */
  static simulateHeadcountScenario(input: HeadcountScenarioInput): HeadcountScenarioOutput {
    const projectedHeadcount = Math.max(0, input.baseHeadcount + input.headcountDelta);
    const fullyLoadedPerHead =
      input.averageAnnualSalaryPerHead * (1 + input.benefitsRatio + input.taxesAndContributionsRatio);

    const projectedAnnualSalaryCost = projectedHeadcount * input.averageAnnualSalaryPerHead;
    const projectedAnnualBenefitsCost = projectedAnnualSalaryCost * input.benefitsRatio;
    const projectedAnnualContributionsCost = projectedAnnualSalaryCost * input.taxesAndContributionsRatio;

    const newHiresCount = Math.max(0, input.headcountDelta);
    const oneTimeOnboardingCost =
      newHiresCount * (input.trainingCostPerHire + input.recruitmentCostPerHire + input.assetCostPerHire);

    const totalProjectedWorkforceCost =
      projectedAnnualSalaryCost +
      projectedAnnualBenefitsCost +
      projectedAnnualContributionsCost +
      oneTimeOnboardingCost;

    const baseFullyLoaded = input.baseAnnualBudget > 0 ? input.baseAnnualBudget : input.baseHeadcount * fullyLoadedPerHead;
    const costDelta = totalProjectedWorkforceCost - baseFullyLoaded;
    const percentageCostChange = baseFullyLoaded > 0 ? Math.round((costDelta / baseFullyLoaded) * 1000) / 10 : 0;

    return {
      projectedHeadcount,
      headcountDelta: input.headcountDelta,
      projectedAnnualSalaryCost: Math.round(projectedAnnualSalaryCost),
      projectedAnnualBenefitsCost: Math.round(projectedAnnualBenefitsCost),
      projectedAnnualContributionsCost: Math.round(projectedAnnualContributionsCost),
      oneTimeOnboardingCost: Math.round(oneTimeOnboardingCost),
      totalProjectedWorkforceCost: Math.round(totalProjectedWorkforceCost),
      costDelta: Math.round(costDelta),
      percentageCostChange
    };
  }

  /**
   * Calculate position vacancy and open requisition fill ratios.
   */
  static calculatePositionMetrics(
    approvedCount: number,
    filledCount: number
  ): { openCount: number; vacancyRatePercent: number; fillRatePercent: number } {
    const openCount = Math.max(0, approvedCount - filledCount);
    const vacancyRatePercent =
      approvedCount > 0 ? Math.min(100, Math.round((openCount / approvedCount) * 1000) / 10) : 0;
    const fillRatePercent =
      approvedCount > 0 ? Math.min(100, Math.round((filledCount / approvedCount) * 1000) / 10) : 100;

    return { openCount, vacancyRatePercent, fillRatePercent };
  }
}
