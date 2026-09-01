export interface PfCalculationInput {
  basicWage: number;
  enforceCeiling?: boolean; // Cap at statutory ₹15,000 ceiling
  isVpfEnabled?: boolean;
  vpfRate?: number; // e.g. 5 for additional 5%
}

export interface PfCalculationResult {
  wageBasis: number;
  employeePf: number; // 12%
  employeeVpf: number;
  totalEmployeePf: number;
  employerEpf: number; // 3.67%
  employerEps: number; // 8.33% (capped at 1250)
  totalEmployerPf: number; // 12%
  adminCharges: number; // 0.5%
  edliCharges: number; // 0.5%
  totalContribution: number;
}

export interface EsiCalculationInput {
  grossWage: number;
  isEligible?: boolean;
}

export interface EsiCalculationResult {
  isCovered: boolean;
  wageBasis: number;
  employeeEsi: number; // 0.75%
  employerEsi: number; // 3.25%
  totalContribution: number;
}

export interface PtCalculationInput {
  grossWage: number;
  state: string; // "MH", "KA", "DL", "TN", "WB", "TG", "GJ", etc.
  month: number; // 1-12 (for February adjustment)
}

export interface PtCalculationResult {
  state: string;
  monthlyDeduction: number;
  isExempt: boolean;
}

export interface TdsCalculationInput {
  annualEstimatedGross: number;
  regime: "OLD" | "NEW";
  declarations80C?: number;
  declarations80D?: number;
  otherDeductions?: number;
}

export interface TdsCalculationResult {
  regime: "OLD" | "NEW";
  annualGross: number;
  standardDeduction: number;
  totalExemptions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalAnnualTax: number;
  monthlyTds: number;
}
