import { DepreciationCalculationResult } from "@vc-wms/shared-types";

export interface AssetDepreciationInput {
  assetId: string;
  assetCode: string;
  purchaseCost: number;
  purchaseDate: Date | string;
  salvageValue?: number;
  usefulLifeYears?: number;
  method?: "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE";
  asOfDate?: Date | string;
}

export class DepreciationEngine {
  /**
   * Calculates straight line or written down value depreciation schedule and current book value.
   */
  public static calculate(input: AssetDepreciationInput): DepreciationCalculationResult {
    const purchaseCost = Math.max(0, Number(input.purchaseCost) || 0);
    const salvageValue = Math.max(0, Math.min(purchaseCost, Number(input.salvageValue) || 0));
    const usefulLifeYears = Math.max(1, Number(input.usefulLifeYears) || 3);
    const method = input.method || "STRAIGHT_LINE";
    const purchaseDate = new Date(input.purchaseDate);
    const asOf = input.asOfDate ? new Date(input.asOfDate) : new Date();

    const diffMonths = Math.max(
      0,
      (asOf.getFullYear() - purchaseDate.getFullYear()) * 12 +
        (asOf.getMonth() - purchaseDate.getMonth())
    );

    const totalMonths = usefulLifeYears * 12;
    const schedule: DepreciationCalculationResult["schedule"] = [];

    if (method === "STRAIGHT_LINE") {
      const depreciableAmount = Math.max(0, purchaseCost - salvageValue);
      const monthlyDepreciation = depreciableAmount / totalMonths;
      const effectiveMonths = Math.min(diffMonths, totalMonths);
      const accumulatedDepreciation = Math.min(depreciableAmount, monthlyDepreciation * effectiveMonths);
      const currentBookValue = Math.max(salvageValue, purchaseCost - accumulatedDepreciation);

      // Generate annual/milestone schedule
      let currentVal = purchaseCost;
      let accDep = 0;
      for (let y = 1; y <= usefulLifeYears; y++) {
        const expense = y === usefulLifeYears ? (currentVal - salvageValue) : (depreciableAmount / usefulLifeYears);
        accDep += expense;
        const ending = Math.max(salvageValue, purchaseCost - accDep);
        schedule.push({
          period: `Year ${y}`,
          beginningValue: Math.round(currentVal * 100) / 100,
          depreciationExpense: Math.round(expense * 100) / 100,
          accumulatedDepreciation: Math.round(accDep * 100) / 100,
          endingValue: Math.round(ending * 100) / 100
        });
        currentVal = ending;
      }

      return {
        assetId: input.assetId,
        assetCode: input.assetCode,
        purchaseCost,
        purchaseDate: purchaseDate.toISOString(),
        salvageValue,
        usefulLifeYears,
        method: "STRAIGHT_LINE",
        accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
        currentBookValue: Math.round(currentBookValue * 100) / 100,
        monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
        schedule
      };
    } else {
      // WRITTEN_DOWN_VALUE Method
      const effectiveSalvage = salvageValue > 0 ? salvageValue : purchaseCost * 0.05;
      const annualRate = Math.min(0.99, Math.max(0.01, 1 - Math.pow(effectiveSalvage / purchaseCost, 1 / usefulLifeYears)));
      const monthlyRate = 1 - Math.pow(1 - annualRate, 1 / 12);

      let currentBook = purchaseCost;
      let accumulated = 0;

      for (let m = 0; m < diffMonths; m++) {
        if (currentBook <= effectiveSalvage) break;
        const expense = currentBook * monthlyRate;
        const actualExpense = Math.min(expense, currentBook - effectiveSalvage);
        accumulated += actualExpense;
        currentBook -= actualExpense;
      }

      // Generate Year-wise schedule
      let tempBook = purchaseCost;
      let tempAcc = 0;
      for (let y = 1; y <= usefulLifeYears; y++) {
        const expense = tempBook * annualRate;
        const actualExpense = Math.min(expense, tempBook - effectiveSalvage);
        tempAcc += actualExpense;
        const ending = Math.max(effectiveSalvage, tempBook - actualExpense);
        schedule.push({
          period: `Year ${y}`,
          beginningValue: Math.round(tempBook * 100) / 100,
          depreciationExpense: Math.round(actualExpense * 100) / 100,
          accumulatedDepreciation: Math.round(tempAcc * 100) / 100,
          endingValue: Math.round(ending * 100) / 100
        });
        tempBook = ending;
      }

      const currentMonthlyDep = currentBook * monthlyRate;

      return {
        assetId: input.assetId,
        assetCode: input.assetCode,
        purchaseCost,
        purchaseDate: purchaseDate.toISOString(),
        salvageValue,
        usefulLifeYears,
        method: "WRITTEN_DOWN_VALUE",
        accumulatedDepreciation: Math.round(accumulated * 100) / 100,
        currentBookValue: Math.round(currentBook * 100) / 100,
        monthlyDepreciation: Math.round(currentMonthlyDep * 100) / 100,
        schedule
      };
    }
  }
}
