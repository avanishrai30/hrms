/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PredictionEngine } from "../src/modules/ai/engines/prediction.engine.js";

describe("Workforce Prediction Engine Tests (Task 19)", () => {
  let predictionEngine: PredictionEngine;
  let mockPrisma: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const employeeId = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findFirst: vi.fn().mockResolvedValue({
          id: employeeId,
          tenantId,
          fullName: "Rohan Verma",
          employeeCode: "EMP042",
          joiningDate: new Date("2023-01-15"),
          department: { name: "Operations" },
          designation: { name: "Senior Executive" }
        }),
        count: vi.fn().mockResolvedValue(120)
      },
      attendance: {
        findMany: vi.fn().mockResolvedValue([
          { status: "PRESENT", workedMinutes: 540, date: new Date("2026-08-01") },
          { status: "PRESENT", workedMinutes: 600, date: new Date("2026-08-02") },
          { status: "ABSENT", workedMinutes: 0, date: new Date("2026-08-03") },
          { status: "ABSENT", workedMinutes: 0, date: new Date("2026-08-04") },
          { status: "PRESENT", workedMinutes: 520, date: new Date("2026-08-05") }
        ])
      },
      leaveRequest: {
        findMany: vi.fn().mockResolvedValue([
          { status: "APPROVED", days: 2 },
          { status: "APPROVED", days: 3 }
        ])
      },
      employeeCompensationHistory: {
        findMany: vi.fn().mockResolvedValue([
          { effectiveFrom: new Date("2024-01-01") } // ~32 months ago -> high stagnation
        ])
      }
    };

    predictionEngine = new PredictionEngine(mockPrisma);
  });

  it("should calculate Attrition Risk score between 0 and 100 with contributing signals", async () => {
    const result = await predictionEngine.calculateEmployeeAttritionRisk(tenantId, employeeId);

    expect(result.predictionType).toBe("ATTRITION_RISK");
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.employeeName).toBe("Rohan Verma");
    expect(result.signals.factors.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("should calculate Burnout Risk score evaluating overtime hours and working patterns", async () => {
    const result = await predictionEngine.calculateEmployeeBurnoutRisk(tenantId, employeeId);

    expect(result.predictionType).toBe("BURNOUT_RISK");
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.signals).toHaveProperty("avgDailyHours");
  });

  it("should project 30, 90, and 180 day Headcount Forecasts based on hiring velocity", async () => {
    const forecast = await predictionEngine.calculateHeadcountForecast(tenantId);

    expect(forecast.predictionType).toBe("HEADCOUNT_FORECAST");
    expect(forecast.currentHeadcount).toBe(120);
    expect(forecast.forecastHorizon.thirtyDays).toBeGreaterThan(0);
    expect(forecast.forecastHorizon.ninetyDays).toBeGreaterThan(0);
    expect(forecast.forecastHorizon.oneEightyDays).toBeGreaterThan(0);
  });
});
