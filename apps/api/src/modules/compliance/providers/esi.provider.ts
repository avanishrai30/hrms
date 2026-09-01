import { Injectable } from "@nestjs/common";
import type {
  EsiCalculationInput,
  EsiCalculationResult
} from "./compliance.interfaces.js";

export const STATUTORY_ESI_CEILING = 21000;

@Injectable()
export class EsiProvider {
  calculate(input: EsiCalculationInput): EsiCalculationResult {
    const grossWage = Math.max(0, input.grossWage);

    // If gross wage exceeds ceiling or eligibility is explicitly false, exempt
    if (grossWage > STATUTORY_ESI_CEILING || input.isEligible === false) {
      return {
        isCovered: false,
        wageBasis: 0,
        employeeEsi: 0,
        employerEsi: 0,
        totalContribution: 0
      };
    }

    // Employee Share (0.75%)
    const employeeEsi = Math.round(grossWage * 0.0075);

    // Employer Share (3.25%)
    const employerEsi = Math.round(grossWage * 0.0325);

    const totalContribution = employeeEsi + employerEsi;

    return {
      isCovered: true,
      wageBasis: grossWage,
      employeeEsi,
      employerEsi,
      totalContribution
    };
  }
}
