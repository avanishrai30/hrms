import { describe, expect, it } from "vitest";
import { IncrementRecommendationEngine } from "../src/modules/performance/engines/increment-recommendation.engine.js";

describe("Increment Planning & Salary Recommendation Engine (Task 21)", () => {
  const engine = new IncrementRecommendationEngine();

  it("calculates individual salary increment recommendations according to rating matrix", () => {
    // Outstanding -> 18%
    const outstandingEmp = engine.calculateEmployeeIncrement({
      employeeId: "emp-1",
      employeeName: "Aarav Sharma",
      currentAnnualCtc: 2000000,
      ratingLabel: "OUTSTANDING"
    });

    expect(outstandingEmp.recommendedIncrementPct).toBe(18);
    expect(outstandingEmp.incrementAmount).toBe(360000);
    expect(outstandingEmp.newAnnualCtc).toBe(2360000);

    // Meets -> 8%
    const meetsEmp = engine.calculateEmployeeIncrement({
      employeeId: "emp-2",
      employeeName: "Sneha Patel",
      currentAnnualCtc: 1500000,
      ratingLabel: "MEETS_EXPECTATIONS"
    });

    expect(meetsEmp.recommendedIncrementPct).toBe(8);
    expect(meetsEmp.incrementAmount).toBe(120000);
    expect(meetsEmp.newAnnualCtc).toBe(1620000);
  });

  it("simulates departmental increment budget modeling accurately", () => {
    const employees = [
      { employeeId: "e1", employeeName: "E1", currentAnnualCtc: 2000000, ratingLabel: "OUTSTANDING" as const }, // +360k
      { employeeId: "e2", employeeName: "E2", currentAnnualCtc: 2000000, ratingLabel: "EXCEEDS_EXPECTATIONS" as const }, // +240k
      { employeeId: "e3", employeeName: "E3", currentAnnualCtc: 2000000, ratingLabel: "MEETS_EXPECTATIONS" as const }, // +160k
      { employeeId: "e4", employeeName: "E4", currentAnnualCtc: 2000000, ratingLabel: "NEEDS_IMPROVEMENT" as const } // +60k
    ];

    // Total Current: 8,000,000
    // Total Increment: 360k + 240k + 160k + 60k = 820,000
    const simulation = engine.simulateIncrements(employees, 1000000);

    expect(simulation.totalEmployees).toBe(4);
    expect(simulation.totalCurrentCtc).toBe(8000000);
    expect(simulation.totalIncrementCost).toBe(820000);
    expect(simulation.totalNewCtc).toBe(8820000);
    expect(simulation.overallAverageIncrementPct).toBe(10.25);
    expect(simulation.budgetUtilizationPct).toBe(82);
  });
});
