import { Injectable } from "@nestjs/common";
import type {
  PtCalculationInput,
  PtCalculationResult
} from "./compliance.interfaces.js";

@Injectable()
export class PtProvider {
  calculate(input: PtCalculationInput): PtCalculationResult {
    const gross = Math.max(0, input.grossWage);
    const state = (input.state || "MH").toUpperCase().trim();
    const month = input.month;

    let deduction = 0;

    switch (state) {
      case "MH":
      case "MAHARASHTRA":
        if (gross <= 7500) {
          deduction = 0;
        } else if (gross <= 10000) {
          deduction = 175;
        } else {
          // ₹200 for 11 months, ₹300 for February (month 2)
          deduction = month === 2 ? 300 : 200;
        }
        break;

      case "KA":
      case "KARNATAKA":
        if (gross < 15000) {
          deduction = 0;
        } else {
          deduction = 200;
        }
        break;

      case "DL":
      case "DELHI":
        deduction = 0;
        break;

      case "TN":
      case "TAMIL NADU":
      case "TAMILNADU":
        if (gross <= 21000) {
          deduction = 0;
        } else if (gross <= 30000) {
          deduction = 100;
        } else if (gross <= 45000) {
          deduction = 235;
        } else {
          deduction = 208;
        }
        break;

      case "TG":
      case "TELANGANA":
      case "AP":
      case "ANDHRA PRADESH":
        if (gross <= 15000) {
          deduction = 0;
        } else if (gross <= 20000) {
          deduction = 150;
        } else {
          deduction = 200;
        }
        break;

      case "WB":
      case "WEST BENGAL":
      case "WESTBENGAL":
        if (gross <= 10000) {
          deduction = 0;
        } else if (gross <= 15000) {
          deduction = 110;
        } else if (gross <= 25000) {
          deduction = 130;
        } else if (gross <= 40000) {
          deduction = 150;
        } else {
          deduction = 200;
        }
        break;

      case "GJ":
      case "GUJARAT":
        if (gross <= 12000) {
          deduction = 0;
        } else {
          deduction = 200;
        }
        break;

      default:
        // Default generic rule
        deduction = gross > 15000 ? 200 : 0;
        break;
    }

    return {
      state,
      monthlyDeduction: deduction,
      isExempt: deduction === 0
    };
  }
}
