import { describe, expect, it } from "vitest";
import { createExpenseClaimSchema, createTravelRequestSchema, reportExportSchema } from "./finance.schemas.js";

describe("finance schemas", () => {
  it("validates expense claims with GST and receipt metadata", () => {
    const result = createExpenseClaimSchema.safeParse({
      employeeId: "00000000-0000-0000-0000-000000000001",
      title: "Client visit",
      items: [{
        category: "TRAVEL",
        description: "Airport cab",
        amount: 1200,
        taxAmount: 60,
        gstNumber: "29ABCDE1234F1Z5",
        expenseDate: "2026-09-01",
        receipts: [{ fileUrl: "tenants/t1/receipts/r1.png", fileName: "r1.png", fileType: "PNG", contentHash: "hash-123456" }]
      }]
    });

    expect(result.success).toBe(true);
  });

  it("validates multi-city travel requests", () => {
    const result = createTravelRequestSchema.safeParse({
      employeeId: "00000000-0000-0000-0000-000000000001",
      title: "Sales tour",
      purpose: "Client meetings",
      travelType: "DOMESTIC",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      segments: [
        { origin: "Kochi", destination: "Bengaluru", departureDate: "2026-09-01", travelMode: "FLIGHT", estimatedCost: 6000 },
        { origin: "Bengaluru", destination: "Mumbai", departureDate: "2026-09-03", travelMode: "FLIGHT", estimatedCost: 8000 }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("validates finance report exports", () => {
    expect(reportExportSchema.safeParse({ report: "POLICY_VIOLATION", format: "PDF" }).success).toBe(true);
  });
});
