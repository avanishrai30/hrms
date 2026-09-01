import { Injectable } from "@nestjs/common";
import type { ReviewRatingLabel } from "@prisma/client";

export interface EmployeeIncrementInput {
  employeeId: string;
  employeeName: string;
  currentAnnualCtc: number;
  ratingLabel: ReviewRatingLabel;
  customIncrementPct?: number;
}

export interface EmployeeIncrementOutput {
  employeeId: string;
  employeeName: string;
  currentAnnualCtc: number;
  ratingLabel: ReviewRatingLabel;
  recommendedIncrementPct: number;
  incrementAmount: number;
  newAnnualCtc: number;
}

export interface IncrementSimulationResult {
  totalEmployees: number;
  totalCurrentCtc: number;
  totalNewCtc: number;
  totalIncrementCost: number;
  overallAverageIncrementPct: number;
  budgetUtilizationPct: number;
  employeeRecommendations: EmployeeIncrementOutput[];
}

@Injectable()
export class IncrementRecommendationEngine {
  private readonly DEFAULT_RATES: Record<ReviewRatingLabel, number> = {
    OUTSTANDING: 18.0,
    EXCEEDS_EXPECTATIONS: 12.0,
    MEETS_EXPECTATIONS: 8.0,
    NEEDS_IMPROVEMENT: 3.0,
    UNSATISFACTORY: 0.0
  };

  /**
   * Calculates salary increment recommendation for a single employee
   */
  calculateEmployeeIncrement(
    employee: EmployeeIncrementInput,
    customRateMap?: Partial<Record<ReviewRatingLabel, number>>
  ): EmployeeIncrementOutput {
    const rateMap = { ...this.DEFAULT_RATES, ...customRateMap };
    const pct = employee.customIncrementPct ?? rateMap[employee.ratingLabel] ?? 8.0;
    const incrementAmount = Number(((employee.currentAnnualCtc * pct) / 100).toFixed(2));
    const newAnnualCtc = Number((employee.currentAnnualCtc + incrementAmount).toFixed(2));

    return {
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      currentAnnualCtc: employee.currentAnnualCtc,
      ratingLabel: employee.ratingLabel,
      recommendedIncrementPct: pct,
      incrementAmount,
      newAnnualCtc
    };
  }

  /**
   * Simulates increment planning across an entire organization or department pool
   */
  simulateIncrements(
    employees: EmployeeIncrementInput[],
    totalBudgetAmount?: number,
    customRateMap?: Partial<Record<ReviewRatingLabel, number>>
  ): IncrementSimulationResult {
    const recommendations = employees.map((emp) => this.calculateEmployeeIncrement(emp, customRateMap));

    const totalCurrentCtc = recommendations.reduce((acc, r) => acc + r.currentAnnualCtc, 0);
    const totalNewCtc = recommendations.reduce((acc, r) => acc + r.newAnnualCtc, 0);
    const totalIncrementCost = recommendations.reduce((acc, r) => acc + r.incrementAmount, 0);

    const overallAverageIncrementPct =
      totalCurrentCtc > 0 ? Number(((totalIncrementCost / totalCurrentCtc) * 100).toFixed(2)) : 0;

    const budgetUtilizationPct =
      totalBudgetAmount && totalBudgetAmount > 0
        ? Number(((totalIncrementCost / totalBudgetAmount) * 100).toFixed(2))
        : 100;

    return {
      totalEmployees: employees.length,
      totalCurrentCtc,
      totalNewCtc,
      totalIncrementCost,
      overallAverageIncrementPct,
      budgetUtilizationPct,
      employeeRecommendations: recommendations
    };
  }
}
