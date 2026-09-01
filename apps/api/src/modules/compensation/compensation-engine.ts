import type {
  CompensationBreakdownResult,
  CompensationCalculationType,
  SalaryComponentCategory,
  SalaryComponentType
} from "@vc-wms/shared-types";

export interface ComponentCalculationInput {
  componentId: string;
  name: string;
  code: string;
  type: SalaryComponentType;
  category: SalaryComponentCategory;
  calculationType: CompensationCalculationType;
  calculationValue: number;
  monthlyAmount?: number;
}

export class CompensationEngine {
  /**
   * Calculates monthly and annual component breakdowns from monthly CTC and component rules.
   */
  static calculateBreakdown(
    monthlyCtc: number,
    components: ComponentCalculationInput[]
  ): CompensationBreakdownResult {
    const annualCtc = Math.round(monthlyCtc * 12 * 100) / 100;

    // Step 1: Calculate Basic Salary
    const basicComp = components.find((c) => c.category === "BASIC");
    let basicMonthly = 0;
    if (basicComp) {
      if (basicComp.calculationType === "PERCENTAGE_OF_BASIC" || basicComp.calculationType === "PERCENTAGE_OF_GROSS") {
        basicMonthly = Math.round((monthlyCtc * (basicComp.calculationValue || 50)) / 100);
      } else if (basicComp.calculationType === "FLAT_AMOUNT" && basicComp.monthlyAmount && basicComp.monthlyAmount > 0) {
        basicMonthly = basicComp.monthlyAmount;
      } else {
        // Default: 50% of CTC
        basicMonthly = Math.round(monthlyCtc * 0.5);
      }
    } else {
      basicMonthly = Math.round(monthlyCtc * 0.5);
    }

    const calculatedItems: CompensationBreakdownResult["items"] = [];

    // Step 2: Compute initial amounts for each component
    let totalFixedEarnings = 0;
    let employerContributionsMonthly = 0;
    let specialAllowanceItemIndex = -1;

    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      if (!comp) continue;

      let itemMonthly = 0;

      if (comp.category === "BASIC") {
        itemMonthly = basicMonthly;
      } else if (comp.category === "SPECIAL_ALLOWANCE") {
        // Will be computed as balancing figure later
        specialAllowanceItemIndex = i;
        itemMonthly = 0;
      } else if (comp.calculationType === "PERCENTAGE_OF_BASIC") {
        itemMonthly = Math.round((basicMonthly * comp.calculationValue) / 100);
      } else if (comp.calculationType === "PERCENTAGE_OF_GROSS") {
        itemMonthly = Math.round((monthlyCtc * comp.calculationValue) / 100);
      } else if (comp.calculationType === "FLAT_AMOUNT") {
        itemMonthly = comp.monthlyAmount ?? comp.calculationValue ?? 0;
      }

      if (comp.type === "EARNING" && comp.category !== "SPECIAL_ALLOWANCE") {
        totalFixedEarnings += itemMonthly;
      } else if (comp.type === "EMPLOYER_CONTRIBUTION") {
        employerContributionsMonthly += itemMonthly;
      }

      calculatedItems.push({
        componentId: comp.componentId,
        name: comp.name,
        code: comp.code,
        type: comp.type,
        category: comp.category,
        monthlyAmount: itemMonthly,
        annualAmount: Math.round(itemMonthly * 12 * 100) / 100,
        calculationType: comp.calculationType,
        calculationValue: comp.calculationValue
      });
    }

    // Step 3: Compute Special Allowance as balancing figure
    // Monthly CTC = Total Earnings + Employer Contributions
    // Therefore: Special Allowance = Monthly CTC - (Total Fixed Earnings + Employer Contributions)
    if (specialAllowanceItemIndex >= 0) {
      const balancingAmount = Math.max(0, monthlyCtc - (totalFixedEarnings + employerContributionsMonthly));
      const targetItem = calculatedItems[specialAllowanceItemIndex];
      if (targetItem) {
        targetItem.monthlyAmount = balancingAmount;
        targetItem.annualAmount = Math.round(balancingAmount * 12 * 100) / 100;
      }
    }

    // Step 4: Aggregate Totals
    let grossEarningsMonthly = 0;
    let totalDeductionsMonthly = 0;
    let totalEmployerContributions = 0;

    for (const item of calculatedItems) {
      if (item.type === "EARNING") {
        grossEarningsMonthly += item.monthlyAmount;
      } else if (item.type === "DEDUCTION") {
        totalDeductionsMonthly += item.monthlyAmount;
      } else if (item.type === "EMPLOYER_CONTRIBUTION") {
        totalEmployerContributions += item.monthlyAmount;
      }
    }

    const netTakeHomeMonthly = Math.max(0, grossEarningsMonthly - totalDeductionsMonthly);

    return {
      monthlyCtc,
      annualCtc,
      grossEarningsMonthly: Math.round(grossEarningsMonthly * 100) / 100,
      grossEarningsAnnual: Math.round(grossEarningsMonthly * 12 * 100) / 100,
      totalDeductionsMonthly: Math.round(totalDeductionsMonthly * 100) / 100,
      totalDeductionsAnnual: Math.round(totalDeductionsMonthly * 12 * 100) / 100,
      employerContributionsMonthly: Math.round(totalEmployerContributions * 100) / 100,
      employerContributionsAnnual: Math.round(totalEmployerContributions * 12 * 100) / 100,
      netTakeHomeMonthly: Math.round(netTakeHomeMonthly * 100) / 100,
      netTakeHomeAnnual: Math.round(netTakeHomeMonthly * 12 * 100) / 100,
      items: calculatedItems
    };
  }

  /**
   * Generates standard default Indian salary components suitable for factory/office workers.
   */
  static getDefaultComponents(): Array<Omit<ComponentCalculationInput, "componentId">> {
    return [
      {
        name: "Basic Salary",
        code: "BASIC",
        type: "EARNING",
        category: "BASIC",
        calculationType: "PERCENTAGE_OF_BASIC",
        calculationValue: 50
      },
      {
        name: "House Rent Allowance",
        code: "HRA",
        type: "EARNING",
        category: "HRA",
        calculationType: "PERCENTAGE_OF_BASIC",
        calculationValue: 40
      },
      {
        name: "Conveyance Allowance",
        code: "CONVEYANCE",
        type: "EARNING",
        category: "CONVEYANCE",
        calculationType: "FLAT_AMOUNT",
        calculationValue: 1600
      },
      {
        name: "Medical Allowance",
        code: "MEDICAL",
        type: "EARNING",
        category: "MEDICAL",
        calculationType: "FLAT_AMOUNT",
        calculationValue: 1250
      },
      {
        name: "Special Allowance",
        code: "SPECIAL_ALLOWANCE",
        type: "EARNING",
        category: "SPECIAL_ALLOWANCE",
        calculationType: "FLAT_AMOUNT",
        calculationValue: 0
      },
      {
        name: "Provident Fund (Employee)",
        code: "PF_EE",
        type: "DEDUCTION",
        category: "PF",
        calculationType: "PERCENTAGE_OF_BASIC",
        calculationValue: 12
      },
      {
        name: "Professional Tax",
        code: "PT",
        type: "DEDUCTION",
        category: "PROFESSIONAL_TAX",
        calculationType: "FLAT_AMOUNT",
        calculationValue: 200
      },
      {
        name: "Provident Fund (Employer)",
        code: "PF_ER",
        type: "EMPLOYER_CONTRIBUTION",
        category: "PF",
        calculationType: "PERCENTAGE_OF_BASIC",
        calculationValue: 12
      }
    ];
  }
}
