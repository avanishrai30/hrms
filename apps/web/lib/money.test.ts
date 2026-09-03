import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats backend-owned values with their explicit currency", () => {
    expect(formatMoney(1250, "USD")).toBe("$1,250.00");
    expect(formatMoney("1250", "EUR")).toBe("€1,250.00");
  });

  it("does not convert unavailable financial data into zero", () => {
    expect(formatMoney(null, "USD")).toBe("—");
    expect(formatMoney(undefined, "USD")).toBe("—");
    expect(formatMoney("", "USD")).toBe("—");
  });

  it("does not default missing currency to INR", () => {
    expect(formatMoney(1250, null)).toBe("—");
    expect(formatMoney(1250, undefined)).toBe("—");
  });
});
