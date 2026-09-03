import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats backend-owned values with their explicit currency", () => {
    expect(formatMoney(1250, "USD")).toBe("$1,250.00");
    expect(formatMoney("1250", "EUR")).toBe("€1,250.00");
    expect(formatMoney(50000, "INR")).toBe("₹50,000.00");
  });

  it("formats real zero values correctly instead of returning unavailable em-dash", () => {
    expect(formatMoney(0, "USD")).toBe("$0.00");
    expect(formatMoney("0", "USD")).toBe("$0.00");
    expect(formatMoney(0, "INR")).toBe("₹0.00");
    expect(formatMoney("0", "INR")).toBe("₹0.00");
  });

  it("does not convert unavailable financial data into zero", () => {
    expect(formatMoney(null, "USD")).toBe("—");
    expect(formatMoney(undefined, "USD")).toBe("—");
    expect(formatMoney("", "USD")).toBe("—");
    expect(formatMoney(NaN, "USD")).toBe("—");
  });

  it("does not default missing currency to INR", () => {
    expect(formatMoney(1250, null)).toBe("—");
    expect(formatMoney(1250, undefined)).toBe("—");
    expect(formatMoney(1250, "")).toBe("—");
  });
});
