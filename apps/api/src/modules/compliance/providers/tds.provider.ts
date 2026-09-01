import { Injectable } from "@nestjs/common";
import type {
  TdsCalculationInput,
  TdsCalculationResult
} from "./compliance.interfaces.js";

@Injectable()
export class TdsProvider {
  calculate(input: TdsCalculationInput): TdsCalculationResult {
    const annualGross = Math.max(0, input.annualEstimatedGross);
    const regime = input.regime || "NEW";

    let standardDeduction = 0;
    let totalExemptions = 0;
    let taxableIncome = 0;
    let taxBeforeRebate = 0;
    let rebate87A = 0;

    if (regime === "OLD") {
      standardDeduction = 50000;
      const dec80C = Math.min(150000, Math.max(0, input.declarations80C || 0));
      const dec80D = Math.min(25000, Math.max(0, input.declarations80D || 0));
      const otherDec = Math.max(0, input.otherDeductions || 0);

      totalExemptions = dec80C + dec80D + otherDec;
      taxableIncome = Math.max(0, annualGross - standardDeduction - totalExemptions);

      // Old Regime Slabs
      if (taxableIncome <= 250000) {
        taxBeforeRebate = 0;
      } else if (taxableIncome <= 500000) {
        taxBeforeRebate = (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        taxBeforeRebate = 12500 + (taxableIncome - 500000) * 0.2;
      } else {
        taxBeforeRebate = 112500 + (taxableIncome - 1000000) * 0.3;
      }

      // Sec 87A Rebate for Old Regime (Taxable income <= 5L)
      if (taxableIncome <= 500000) {
        rebate87A = Math.min(12500, taxBeforeRebate);
      }
    } else {
      // NEW REGIME (FY 2024-25 / FY 2025-26 Default)
      standardDeduction = 75000;
      totalExemptions = 0; // Not eligible for 80C/80D in New Regime
      taxableIncome = Math.max(0, annualGross - standardDeduction);

      // New Regime Slabs
      if (taxableIncome <= 300000) {
        taxBeforeRebate = 0;
      } else if (taxableIncome <= 700000) {
        taxBeforeRebate = (taxableIncome - 300000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        taxBeforeRebate = 20000 + (taxableIncome - 700000) * 0.1;
      } else if (taxableIncome <= 1200000) {
        taxBeforeRebate = 50000 + (taxableIncome - 1000000) * 0.15;
      } else if (taxableIncome <= 1500000) {
        taxBeforeRebate = 80000 + (taxableIncome - 1200000) * 0.2;
      } else {
        taxBeforeRebate = 140000 + (taxableIncome - 1500000) * 0.3;
      }

      // Sec 87A Rebate for New Regime (Taxable income <= 7L)
      if (taxableIncome <= 700000) {
        rebate87A = Math.min(25000, taxBeforeRebate);
      }
    }

    const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A);
    const cess = Math.round(taxAfterRebate * 0.04);
    const totalAnnualTax = Math.round(taxAfterRebate + cess);
    const monthlyTds = Math.round(totalAnnualTax / 12);

    return {
      regime,
      annualGross,
      standardDeduction,
      totalExemptions,
      taxableIncome,
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebate87A: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      cess,
      totalAnnualTax,
      monthlyTds
    };
  }
}
