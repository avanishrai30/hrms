import { describe, expect, it } from "vitest";
import {
  assignEmployeeCompensationSchema,
  createCompensationTemplateSchema,
  createSalaryComponentSchema,
  reviseEmployeeCompensationSchema
} from "./compensation.schemas.js";

describe("Compensation Schemas", () => {
  it("validates valid salary component creation", () => {
    const valid = {
      name: "House Rent Allowance",
      code: "HRA",
      type: "EARNING",
      category: "HRA",
      isTaxable: true,
      isFixed: true,
      calculationType: "PERCENTAGE_OF_BASIC",
      calculationValue: 40
    };

    const parsed = createSalaryComponentSchema.parse(valid);
    expect(parsed.code).toBe("HRA");
    expect(parsed.calculationValue).toBe(40);
  });

  it("rejects invalid component codes or negative values", () => {
    expect(() =>
      createSalaryComponentSchema.parse({
        name: "Test",
        code: "T",
        type: "EARNING",
        category: "CUSTOM",
        calculationValue: -5
      })
    ).toThrow();
  });

  it("validates template creation with items", () => {
    const valid = {
      name: "Factory Standard",
      code: "FACTORY_STD",
      jobRole: "Operator",
      currency: "INR",
      items: [
        {
          componentId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          calculationType: "PERCENTAGE_OF_BASIC",
          calculationValue: 50,
          monthlyAmount: 0,
          annualAmount: 0,
          order: 1
        }
      ]
    };

    const parsed = createCompensationTemplateSchema.parse(valid);
    expect(parsed.code).toBe("FACTORY_STD");
    expect(parsed.items.length).toBe(1);
  });

  it("validates employee compensation assignment", () => {
    const valid = {
      employeeId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      effectiveFrom: "2026-04-01",
      monthlyCtc: 35000,
      currency: "INR",
      reason: "JOINING_SALARY"
    };

    const parsed = assignEmployeeCompensationSchema.parse(valid);
    expect(parsed.monthlyCtc).toBe(35000);
    expect(parsed.effectiveFrom).toBe("2026-04-01");
  });

  it("validates salary revision with mandatory notes", () => {
    const valid = {
      newMonthlyCtc: 42000,
      effectiveFrom: "2026-05-01",
      reason: "PROMOTION_INCREASE",
      notes: "Promoted to Senior Warehouse Operator"
    };

    const parsed = reviseEmployeeCompensationSchema.parse(valid);
    expect(parsed.newMonthlyCtc).toBe(42000);
    expect(parsed.reason).toBe("PROMOTION_INCREASE");
  });

  it("requires explicit compensation currency", () => {
    expect(() =>
      assignEmployeeCompensationSchema.parse({
        employeeId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        effectiveFrom: "2026-04-01",
        monthlyCtc: 35000,
        reason: "JOINING_SALARY"
      })
    ).toThrow();
  });
});
