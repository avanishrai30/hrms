/**
 * TASK 29 — OVERTIME MANAGEMENT & PAYROLL INTEGRATION ENGINE
 * Computes Daily OT, Weekly Off OT, Holiday OT, and Night Shift OT with statutory wage multipliers.
 */

export interface OvertimeCalculationInput {
  overtimeType: "DAILY_OT" | "WEEKLY_OFF_OT" | "HOLIDAY_OT" | "NIGHT_SHIFT_OT";
  workedOvertimeMinutes: number;
  monthlyBaseSalary: number; // For hourly rate derivation
  standardWorkingHoursPerMonth?: number; // default 208 (26 days * 8 hrs)
}

export interface OvertimeCalculationResult {
  overtimeMinutes: number;
  overtimeHours: number;
  baseHourlyRate: number;
  overtimeMultiplier: number;
  effectiveHourlyRate: number;
  totalOvertimePayout: number;
}

export class OvertimeEngine {
  /**
   * Calculate statutory overtime wages based on labor standards (e.g. Factories Act 2x for holiday/weekly off).
   */
  static calculateOvertimePay(input: OvertimeCalculationInput): OvertimeCalculationResult {
    const hoursPerMonth = input.standardWorkingHoursPerMonth ?? 208;
    const baseHourlyRate = Math.round((input.monthlyBaseSalary / hoursPerMonth) * 100) / 100;
    const overtimeHours = Math.round((input.workedOvertimeMinutes / 60) * 100) / 100;

    let overtimeMultiplier = 1.5; // Standard daily OT = 1.5x

    switch (input.overtimeType) {
      case "DAILY_OT":
        overtimeMultiplier = 1.5;
        break;
      case "NIGHT_SHIFT_OT":
        overtimeMultiplier = 1.75;
        break;
      case "WEEKLY_OFF_OT":
        overtimeMultiplier = 2.0;
        break;
      case "HOLIDAY_OT":
        overtimeMultiplier = 2.0;
        break;
    }

    const effectiveHourlyRate = Math.round(baseHourlyRate * overtimeMultiplier * 100) / 100;
    const totalOvertimePayout = Math.round(overtimeHours * effectiveHourlyRate);

    return {
      overtimeMinutes: input.workedOvertimeMinutes,
      overtimeHours,
      baseHourlyRate,
      overtimeMultiplier,
      effectiveHourlyRate,
      totalOvertimePayout
    };
  }
}
