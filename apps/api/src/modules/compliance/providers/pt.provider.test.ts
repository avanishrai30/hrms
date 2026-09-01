import { describe, expect, it } from "vitest";
import { PtProvider } from "./pt.provider.js";

describe("PtProvider", () => {
  const provider = new PtProvider();

  it("calculates Maharashtra PT correctly for normal months vs February", () => {
    // Normal month (e.g. August, month 8)
    const augResult = provider.calculate({
      grossWage: 30000,
      state: "MH",
      month: 8
    });
    expect(augResult.monthlyDeduction).toBe(200);

    // February (month 2)
    const febResult = provider.calculate({
      grossWage: 30000,
      state: "MH",
      month: 2
    });
    expect(febResult.monthlyDeduction).toBe(300);

    // Low income in MH (<= 7500)
    const lowResult = provider.calculate({
      grossWage: 6000,
      state: "MH",
      month: 8
    });
    expect(lowResult.monthlyDeduction).toBe(0);
    expect(lowResult.isExempt).toBe(true);
  });

  it("calculates Karnataka PT correctly", () => {
    const highResult = provider.calculate({
      grossWage: 25000,
      state: "KA",
      month: 5
    });
    expect(highResult.monthlyDeduction).toBe(200);

    const lowResult = provider.calculate({
      grossWage: 12000,
      state: "KA",
      month: 5
    });
    expect(lowResult.monthlyDeduction).toBe(0);
  });

  it("calculates Delhi PT as zero (exempt)", () => {
    const dlResult = provider.calculate({
      grossWage: 100000,
      state: "DL",
      month: 8
    });
    expect(dlResult.monthlyDeduction).toBe(0);
    expect(dlResult.isExempt).toBe(true);
  });
});
