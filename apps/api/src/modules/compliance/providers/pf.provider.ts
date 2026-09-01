import { Injectable } from "@nestjs/common";
import type {
  PfCalculationInput,
  PfCalculationResult
} from "./compliance.interfaces.js";

export const STATUTORY_PF_CEILING = 15000;

@Injectable()
export class PfProvider {
  calculate(input: PfCalculationInput): PfCalculationResult {
    const basicWage = Math.max(0, input.basicWage);

    // Apply ceiling if enforced or default
    const wageBasis = input.enforceCeiling
      ? Math.min(basicWage, STATUTORY_PF_CEILING)
      : basicWage;

    // Employee Share (12%)
    const employeePf = Math.round(wageBasis * 0.12);

    // Voluntary PF (VPF)
    const employeeVpf =
      input.isVpfEnabled && input.vpfRate && input.vpfRate > 0
        ? Math.round(wageBasis * (input.vpfRate / 100))
        : 0;

    const totalEmployeePf = employeePf + employeeVpf;

    // Employer Share (12% split: 8.33% EPS capped at ₹15k, remaining to EPF)
    const epsWageBasis = Math.min(wageBasis, STATUTORY_PF_CEILING);
    const employerEps = Math.round(epsWageBasis * 0.0833);
    const totalEmployerPf = Math.round(wageBasis * 0.12);
    const employerEpf = Math.max(0, totalEmployerPf - employerEps);

    // Statutory Admin & EDLI charges (0.5% each)
    const adminCharges = Math.round(wageBasis * 0.005);
    const edliCharges = Math.round(epsWageBasis * 0.005);

    const totalContribution =
      totalEmployeePf + employerEpf + employerEps + adminCharges + edliCharges;

    return {
      wageBasis,
      employeePf,
      employeeVpf,
      totalEmployeePf,
      employerEpf,
      employerEps,
      totalEmployerPf,
      adminCharges,
      edliCharges,
      totalContribution
    };
  }
}
