/**
 * TASK 30 — INDIAN INCOME TAX & TDS COMPUTATION ENGINE
 * Computes Annual Taxable Gross, Old vs New Regime Slabs, 80C/80D/HRA/NPS Exemptions, Rebate 87A, 4% Cess, and Monthly TDS.
 */

export interface TaxComputationInput {
  regime: "OLD" | "NEW";
  grossAnnualSalary: number;
  basicAnnualSalary: number;
  hraReceivedAnnual: number;
  rentPaidAnnual?: number;
  isMetroCity?: boolean;
  section80C?: number; // max 1,50,000 (Old regime only)
  section80D?: number; // max 25,000 / 50,000 (Old regime only)
  section24HomeLoanInterest?: number; // max 2,00,000 (Old regime only)
  section80CCD_NPS?: number; // max 50,000
  otherExemptions?: number;
  tdsDeductedSoFar?: number;
  remainingMonthsInFY?: number; // default 12 or remaining months (1 to 12)
}

export interface TaxComputationResult {
  regime: "OLD" | "NEW";
  grossAnnualSalary: number;
  standardDeduction: number;
  hraExemption: number;
  totalSection80CDeductions: number;
  totalExemptionsAndDeductions: number;
  netTaxableIncome: number;
  baseTaxBeforeCess: number;
  rebate87A: number;
  taxAfterRebate: number;
  healthAndEducationCess: number;
  totalAnnualTaxPayable: number;
  monthlyTdsDeduction: number;
}

export class TaxEngine {
  /**
   * Calculate HRA exemption under Section 10(13A) for Old Regime.
   * Least of:
   * 1. Actual HRA received
   * 2. Rent paid - 10% of Basic salary
   * 3. 50% of Basic (Metro) or 40% of Basic (Non-Metro)
   */
  static calculateHraExemption(
    basicAnnual: number,
    hraReceivedAnnual: number,
    rentPaidAnnual = 0,
    isMetro = false
  ): number {
    if (rentPaidAnnual <= 0) return 0;

    const rentMinusTenPercentBasic = Math.max(0, rentPaidAnnual - 0.10 * basicAnnual);
    const basicPercentageCap = isMetro ? 0.50 * basicAnnual : 0.40 * basicAnnual;

    return Math.round(
      Math.min(hraReceivedAnnual, rentMinusTenPercentBasic, basicPercentageCap)
    );
  }

  /**
   * Calculate tax liability under the New Tax Regime (Section 115BAC).
   */
  static calculateNewRegimeTax(taxableIncome: number): { baseTax: number; rebate87A: number } {
    let tax = 0;

    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
      tax += 300000 * 0.20; // 12L to 15L
      tax += 200000 * 0.15; // 10L to 12L
      tax += 300000 * 0.10; // 7L to 10L
      tax += 400000 * 0.05; // 3L to 7L
    } else if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.20;
      tax += 200000 * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 700000) {
      tax += (taxableIncome - 700000) * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }

    // Rebate u/s 87A: Full rebate if taxable income <= 7,00,000 in New Regime
    let rebate87A = 0;
    if (taxableIncome <= 700000) {
      rebate87A = tax;
    }

    return { baseTax: Math.round(tax), rebate87A: Math.round(rebate87A) };
  }

  /**
   * Calculate tax liability under the Old Tax Regime.
   */
  static calculateOldRegimeTax(taxableIncome: number): { baseTax: number; rebate87A: number } {
    let tax = 0;

    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.30;
      tax += 500000 * 0.20; // 5L to 10L
      tax += 250000 * 0.05; // 2.5L to 5L
    } else if (taxableIncome > 500000) {
      tax += (taxableIncome - 500000) * 0.20;
      tax += 250000 * 0.05;
    } else if (taxableIncome > 250000) {
      tax += (taxableIncome - 250000) * 0.05;
    }

    // Rebate u/s 87A: Max ₹12,500 if taxable income <= 5,00,000 in Old Regime
    let rebate87A = 0;
    if (taxableIncome <= 500000) {
      rebate87A = Math.min(tax, 12500);
    }

    return { baseTax: Math.round(tax), rebate87A: Math.round(rebate87A) };
  }

  /**
   * Compute comprehensive tax and monthly TDS deduction.
   */
  static computeIncomeTaxAndTds(input: TaxComputationInput): TaxComputationResult {
    let standardDeduction = 75000; // New Regime Standard Deduction
    let hraExemption = 0;
    let section80CAllowed = 0;
    let section80DAllowed = 0;
    let homeLoanInterestAllowed = 0;
    let npsAllowed = 0;
    let otherExemptions = 0;

    if (input.regime === "OLD") {
      standardDeduction = 50000;
      hraExemption = this.calculateHraExemption(
        input.basicAnnualSalary,
        input.hraReceivedAnnual,
        input.rentPaidAnnual,
        input.isMetroCity
      );
      section80CAllowed = Math.min(150000, input.section80C ?? 0);
      section80DAllowed = Math.min(50000, input.section80D ?? 0);
      homeLoanInterestAllowed = Math.min(200000, input.section24HomeLoanInterest ?? 0);
      npsAllowed = Math.min(50000, input.section80CCD_NPS ?? 0);
      otherExemptions = input.otherExemptions ?? 0;
    }

    const totalSection80CDeductions =
      section80CAllowed + section80DAllowed + homeLoanInterestAllowed + npsAllowed;

    const totalExemptionsAndDeductions =
      standardDeduction + hraExemption + totalSection80CDeductions + otherExemptions;

    const netTaxableIncome = Math.max(
      0,
      input.grossAnnualSalary - totalExemptionsAndDeductions
    );

    const { baseTax, rebate87A } =
      input.regime === "NEW"
        ? this.calculateNewRegimeTax(netTaxableIncome)
        : this.calculateOldRegimeTax(netTaxableIncome);

    const taxAfterRebate = Math.max(0, baseTax - rebate87A);
    const healthAndEducationCess = Math.round(taxAfterRebate * 0.04);
    const totalAnnualTaxPayable = taxAfterRebate + healthAndEducationCess;

    const remainingMonths = Math.max(1, input.remainingMonthsInFY ?? 12);
    const tdsDeducted = input.tdsDeductedSoFar ?? 0;
    const remainingTax = Math.max(0, totalAnnualTaxPayable - tdsDeducted);
    const monthlyTdsDeduction = Math.round(remainingTax / remainingMonths);

    return {
      regime: input.regime,
      grossAnnualSalary: input.grossAnnualSalary,
      standardDeduction,
      hraExemption,
      totalSection80CDeductions,
      totalExemptionsAndDeductions,
      netTaxableIncome,
      baseTaxBeforeCess: baseTax,
      rebate87A,
      taxAfterRebate,
      healthAndEducationCess,
      totalAnnualTaxPayable,
      monthlyTdsDeduction
    };
  }
}
