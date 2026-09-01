import { describe, expect, it } from "vitest";
import {
  calculatePreviewSchema,
  complianceReportFilterSchema,
  createComplianceRuleSchema,
  createRuleVersionSchema
} from "./compliance.schemas.js";

describe("Compliance Schemas", () => {
  it("validates createComplianceRuleSchema", () => {
    const valid = createComplianceRuleSchema.safeParse({
      type: "PF",
      name: "Provident Fund Rule",
      code: "PF_RULE_01",
      description: "Standard statutory PF",
      configuration: { ceiling: 15000, rate: 12 }
    });
    expect(valid.success).toBe(true);

    const invalid = createComplianceRuleSchema.safeParse({
      type: "INVALID_TYPE",
      name: "P",
      code: "P"
    });
    expect(invalid.success).toBe(false);
  });

  it("validates createRuleVersionSchema", () => {
    const valid = createRuleVersionSchema.safeParse({
      configuration: { rate: 12.5 },
      effectiveFrom: "2026-04-01"
    });
    expect(valid.success).toBe(true);
  });

  it("validates calculatePreviewSchema", () => {
    const valid = calculatePreviewSchema.safeParse({
      basicWage: "25000",
      grossWage: "50000",
      state: "MH",
      month: "8",
      year: "2026",
      taxRegime: "NEW"
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.basicWage).toBe(25000);
      expect(valid.data.grossWage).toBe(50000);
      expect(valid.data.state).toBe("MH");
    }
  });

  it("validates complianceReportFilterSchema", () => {
    const valid = complianceReportFilterSchema.safeParse({
      month: "8",
      year: "2026"
    });
    expect(valid.success).toBe(true);
  });
});
