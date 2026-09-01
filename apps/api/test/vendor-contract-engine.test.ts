import { describe, it, expect } from "vitest";
import { VendorContractEngine } from "../src/modules/vendors/engines/vendor-contract.engine.js";

describe("Vendor Contract Engine (Task 33)", () => {
  it("computes vendor scorecard accurately", () => {
    const now = new Date("2026-09-01T00:00:00.000Z");
    const scorecard = VendorContractEngine.evaluateVendor({
      vendorId: "v-1",
      vendorName: "Apex Logistics",
      contracts: [
        { id: "c-1", valueInInr: 500000, status: "ACTIVE", slaRating: 4.8, endDate: new Date("2027-01-01") }
      ],
      compliances: [
        { id: "cmp-1", status: "COMPLIANT", isVerified: true },
        { id: "cmp-2", status: "COMPLIANT", isVerified: true }
      ],
      now
    });

    expect(scorecard.vendorName).toBe("Apex Logistics");
    expect(scorecard.totalContractValueInr).toBe(500000);
    expect(scorecard.complianceRatePercent).toBe(100.0);
    expect(scorecard.averageSlaRating).toBe(4.8);
    expect(scorecard.riskLevel).toBe("LOW");
  });

  it("identifies contracts expiring within 60 days", () => {
    const now = new Date("2026-09-01T00:00:00.000Z");
    const alerts = VendorContractEngine.getExpiringContractAlerts(
      [
        {
          id: "c-1",
          contractNumber: "CNT-001",
          vendor: { name: "Apex Logistics" },
          endDate: new Date("2026-09-20T00:00:00.000Z"), // 19 days
          valueInInr: 250000
        },
        {
          id: "c-2",
          contractNumber: "CNT-002",
          vendor: { name: "Prime Staffing" },
          endDate: new Date("2027-08-01T00:00:00.000Z"), // far
          valueInInr: 800000
        }
      ],
      60,
      now
    );

    expect(alerts.length).toBe(1);
    expect(alerts[0]?.contractNumber).toBe("CNT-001");
    expect(alerts[0]?.daysToExpiry).toBeLessThanOrEqual(20);
  });
});
