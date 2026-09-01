import { describe, it, expect } from "vitest";
import { AssetLifecycleEngine } from "../src/modules/assets/engines/asset-lifecycle.engine.js";

describe("Asset Lifecycle & Depreciation Engine (Task 33)", () => {
  it("calculates straight-line asset depreciation correctly", () => {
    const valuation = AssetLifecycleEngine.computeStraightLineDepreciation({
      assetId: "ast-01",
      purchaseCost: 100000,
      salvageValue: 10000,
      usefulLifeYears: 5,
      purchaseDate: new Date("2024-09-01"),
      currentDate: new Date("2026-09-01") // 2 years later
    });

    expect(valuation.originalCostInr).toBe(100000);
    expect(valuation.annualDepreciationInr).toBe(18000); // (100k - 10k) / 5
    expect(valuation.accumulatedDepreciationInr).toBe(36000); // 18k * 2
    expect(valuation.currentBookValueInr).toBe(64000); // 100k - 36k
    expect(valuation.depreciationPercent).toBe(36.0);
  });

  it("calculates asset health overview summary", () => {
    const now = new Date("2026-09-01T00:00:00.000Z");
    const summary = AssetLifecycleEngine.calculateAssetHealthSummary(
      [
        { id: "1", cost: 100000, status: "ASSIGNED", warrantyExpiry: new Date("2027-01-01") },
        { id: "2", cost: 80000, status: "AVAILABLE", warrantyExpiry: new Date("2025-01-01") }, // expired
        { id: "3", cost: 50000, status: "MAINTENANCE" }
      ],
      now
    );

    expect(summary.totalAssets).toBe(3);
    expect(summary.totalBookValueInr).toBe(230000);
    expect(summary.allocatedCount).toBe(1);
    expect(summary.availableCount).toBe(1);
    expect(summary.inMaintenanceCount).toBe(1);
    expect(summary.warrantyExpiredCount).toBe(1);
  });
});
