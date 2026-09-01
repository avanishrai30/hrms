import { describe, expect, it } from "vitest";
import { EsiProvider } from "./esi.provider.js";

describe("EsiProvider", () => {
  const provider = new EsiProvider();

  it("calculates ESI for eligible employees within ₹21,000 ceiling", () => {
    const result = provider.calculate({
      grossWage: 20000
    });

    expect(result.isCovered).toBe(true);
    expect(result.wageBasis).toBe(20000);
    expect(result.employeeEsi).toBe(150); // 0.75% of 20000
    expect(result.employerEsi).toBe(650); // 3.25% of 20000
    expect(result.totalContribution).toBe(800);
  });

  it("exempts employees when gross wage exceeds ₹21,000 threshold", () => {
    const result = provider.calculate({
      grossWage: 25000
    });

    expect(result.isCovered).toBe(false);
    expect(result.wageBasis).toBe(0);
    expect(result.employeeEsi).toBe(0);
    expect(result.employerEsi).toBe(0);
    expect(result.totalContribution).toBe(0);
  });
});
