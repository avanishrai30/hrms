import { describe, expect, it } from "vitest";
import { PfProvider, STATUTORY_PF_CEILING } from "./pf.provider.js";

describe("PfProvider", () => {
  const provider = new PfProvider();

  it("calculates PF with statutory ₹15,000 ceiling enforced", () => {
    const result = provider.calculate({
      basicWage: 30000,
      enforceCeiling: true
    });

    expect(result.wageBasis).toBe(STATUTORY_PF_CEILING);
    expect(result.employeePf).toBe(1800); // 12% of 15000
    expect(result.totalEmployeePf).toBe(1800);
    expect(result.employerEps).toBe(1250); // 8.33% of 15000 = 1250
    expect(result.employerEpf).toBe(550); // 1800 - 1250 = 550
    expect(result.totalEmployerPf).toBe(1800);
    expect(result.adminCharges).toBe(75); // 0.5% of 15000
    expect(result.edliCharges).toBe(75); // 0.5% of 15000
  });

  it("calculates PF on actual basic wage when ceiling is not enforced", () => {
    const result = provider.calculate({
      basicWage: 20000,
      enforceCeiling: false
    });

    expect(result.wageBasis).toBe(20000);
    expect(result.employeePf).toBe(2400); // 12% of 20000
    expect(result.employerEps).toBe(1250); // capped at 15000 ceiling
    expect(result.employerEpf).toBe(1150); // 2400 - 1250
    expect(result.totalEmployerPf).toBe(2400);
  });

  it("supports Voluntary PF (VPF) additional contribution", () => {
    const result = provider.calculate({
      basicWage: 15000,
      enforceCeiling: true,
      isVpfEnabled: true,
      vpfRate: 5 // 5% additional VPF
    });

    expect(result.employeePf).toBe(1800);
    expect(result.employeeVpf).toBe(750); // 5% of 15000
    expect(result.totalEmployeePf).toBe(2550);
  });
});
