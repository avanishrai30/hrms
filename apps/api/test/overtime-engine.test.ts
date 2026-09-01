import { describe, expect, it } from "vitest";
import { OvertimeEngine } from "../src/modules/workforce-operations/engines/overtime-engine.js";

describe("TASK 29 — Overtime Engine & Statutory Wage Calculation", () => {
  it("should calculate 1.5x daily overtime wages correctly", () => {
    const result = OvertimeEngine.calculateOvertimePay({
      overtimeType: "DAILY_OT",
      workedOvertimeMinutes: 120, // 2 hours
      monthlyBaseSalary: 41600, // 41600 / 208 = ₹200/hr
      standardWorkingHoursPerMonth: 208
    });

    expect(result.overtimeHours).toBe(2);
    expect(result.baseHourlyRate).toBe(200);
    expect(result.overtimeMultiplier).toBe(1.5);
    expect(result.effectiveHourlyRate).toBe(300);
    expect(result.totalOvertimePayout).toBe(600); // 2 * 300 = 600
  });

  it("should calculate 2.0x holiday and weekly off overtime wages", () => {
    const result = OvertimeEngine.calculateOvertimePay({
      overtimeType: "HOLIDAY_OT",
      workedOvertimeMinutes: 240, // 4 hours
      monthlyBaseSalary: 52000, // 52000 / 208 = ₹250/hr
      standardWorkingHoursPerMonth: 208
    });

    expect(result.overtimeHours).toBe(4);
    expect(result.overtimeMultiplier).toBe(2.0);
    expect(result.effectiveHourlyRate).toBe(500); // 250 * 2.0
    expect(result.totalOvertimePayout).toBe(2000); // 4 * 500 = 2000
  });

  it("should calculate 1.75x night shift overtime premium", () => {
    const result = OvertimeEngine.calculateOvertimePay({
      overtimeType: "NIGHT_SHIFT_OT",
      workedOvertimeMinutes: 180, // 3 hours
      monthlyBaseSalary: 41600,
      standardWorkingHoursPerMonth: 208
    });

    expect(result.overtimeMultiplier).toBe(1.75);
    expect(result.effectiveHourlyRate).toBe(350);
    expect(result.totalOvertimePayout).toBe(1050);
  });
});
