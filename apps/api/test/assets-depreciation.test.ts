import { describe, expect, it } from "vitest";
import { DepreciationEngine } from "../src/modules/assets/engines/depreciation.engine.js";

describe("Asset Depreciation Engine (Task 22)", () => {
  it("calculates Straight Line Method (SLM) depreciation accurately", () => {
    // Purchase Cost = 60,000, Salvage = 6,000, Useful Life = 3 years (36 months)
    // Depreciable Amount = 54,000, Monthly Dep = 1,500, Annual = 18,000
    const result = DepreciationEngine.calculate({
      assetId: "asset-1",
      assetCode: "AST-001",
      purchaseCost: 60000,
      purchaseDate: new Date("2024-01-01"),
      salvageValue: 6000,
      usefulLifeYears: 3,
      method: "STRAIGHT_LINE",
      asOfDate: new Date("2025-01-01") // 12 months elapsed
    });

    expect(result.method).toBe("STRAIGHT_LINE");
    expect(result.monthlyDepreciation).toBe(1500);
    expect(result.accumulatedDepreciation).toBe(18000);
    expect(result.currentBookValue).toBe(42000);
    expect(result.schedule.length).toBe(3);
    expect(result.schedule[0].beginningValue).toBe(60000);
    expect(result.schedule[0].endingValue).toBe(42000);
    expect(result.schedule[2].endingValue).toBe(6000);
  });

  it("caps Straight Line accumulated depreciation at depreciable amount", () => {
    const result = DepreciationEngine.calculate({
      assetId: "asset-2",
      assetCode: "AST-002",
      purchaseCost: 50000,
      purchaseDate: new Date("2020-01-01"),
      salvageValue: 5000,
      usefulLifeYears: 3,
      method: "STRAIGHT_LINE",
      asOfDate: new Date("2026-01-01") // 6 years elapsed (exceeds useful life)
    });

    expect(result.accumulatedDepreciation).toBe(45000);
    expect(result.currentBookValue).toBe(5000); // Equal to salvage value
  });

  it("calculates Written Down Value (WDV) depreciation correctly", () => {
    const result = DepreciationEngine.calculate({
      assetId: "asset-3",
      assetCode: "AST-003",
      purchaseCost: 100000,
      purchaseDate: new Date("2024-01-01"),
      salvageValue: 10000,
      usefulLifeYears: 3,
      method: "WRITTEN_DOWN_VALUE",
      asOfDate: new Date("2025-01-01")
    });

    expect(result.method).toBe("WRITTEN_DOWN_VALUE");
    expect(result.currentBookValue).toBeLessThan(100000);
    expect(result.currentBookValue).toBeGreaterThan(10000);
    expect(result.accumulatedDepreciation).toBeGreaterThan(0);
    expect(result.schedule.length).toBe(3);
  });
});
