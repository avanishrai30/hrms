/**
 * TASK 28 — WORKFORCE FORECASTING ENGINE
 * Generates 6-month, 12-month, and 24-month hiring, attrition, and cost trajectories.
 */

export interface WorkforceForecastHorizonInput {
  currentHeadcount: number;
  annualizedAttritionRate: number; // e.g. 0.12 (12%)
  plannedGrowthRate: number; // e.g. 0.15 (15%)
  averageCostPerHeadAnnual: number;
  timeHorizonMonths: 6 | 12 | 24;
}

export interface HorizonForecastResult {
  horizonMonths: number;
  startingHeadcount: number;
  projectedOrganicAttrition: number;
  projectedNewHiringDemand: number;
  projectedEndingHeadcount: number;
  netHeadcountChange: number;
  estimatedTotalWorkforceCost: number;
  recruitmentCapacityRequiredMonthly: number;
}

export class WorkforceForecastingEngine {
  /**
   * Forecast hiring and attrition across multiple planning horizons.
   */
  static generateHorizonForecast(input: WorkforceForecastHorizonInput): HorizonForecastResult {
    const fractionOfYear = input.timeHorizonMonths / 12.0;

    // Projected Attrition = Starting Headcount * Annual Attrition * Fraction
    const projectedOrganicAttrition = Math.round(
      input.currentHeadcount * input.annualizedAttritionRate * fractionOfYear
    );

    // Projected Expansion Hires = Starting Headcount * Planned Growth * Fraction
    const plannedExpansionHires = Math.round(
      input.currentHeadcount * input.plannedGrowthRate * fractionOfYear
    );

    // Total Hiring Demand = Backfill Replacement + Expansion
    const projectedNewHiringDemand = projectedOrganicAttrition + plannedExpansionHires;
    const projectedEndingHeadcount = input.currentHeadcount + plannedExpansionHires;
    const netHeadcountChange = plannedExpansionHires;

    const avgActiveHeadcount = (input.currentHeadcount + projectedEndingHeadcount) / 2.0;
    const estimatedTotalWorkforceCost = Math.round(
      avgActiveHeadcount * input.averageCostPerHeadAnnual * fractionOfYear
    );

    const recruitmentCapacityRequiredMonthly =
      Math.round((projectedNewHiringDemand / input.timeHorizonMonths) * 10) / 10;

    return {
      horizonMonths: input.timeHorizonMonths,
      startingHeadcount: input.currentHeadcount,
      projectedOrganicAttrition,
      projectedNewHiringDemand,
      projectedEndingHeadcount,
      netHeadcountChange,
      estimatedTotalWorkforceCost,
      recruitmentCapacityRequiredMonthly
    };
  }

  /**
   * Compute 3-way Growth Case Scenarios (Best Case, Expected Case, Worst Case).
   */
  static generateScenarioTriad(
    currentHeadcount: number,
    baseAnnualCostPerHead: number
  ): {
    bestCase: HorizonForecastResult;
    expectedCase: HorizonForecastResult;
    worstCase: HorizonForecastResult;
  } {
    const bestCase = this.generateHorizonForecast({
      currentHeadcount,
      annualizedAttritionRate: 0.08,
      plannedGrowthRate: 0.25,
      averageCostPerHeadAnnual: baseAnnualCostPerHead,
      timeHorizonMonths: 12
    });

    const expectedCase = this.generateHorizonForecast({
      currentHeadcount,
      annualizedAttritionRate: 0.12,
      plannedGrowthRate: 0.15,
      averageCostPerHeadAnnual: baseAnnualCostPerHead,
      timeHorizonMonths: 12
    });

    const worstCase = this.generateHorizonForecast({
      currentHeadcount,
      annualizedAttritionRate: 0.20,
      plannedGrowthRate: 0.05,
      averageCostPerHeadAnnual: baseAnnualCostPerHead,
      timeHorizonMonths: 12
    });

    return { bestCase, expectedCase, worstCase };
  }
}
