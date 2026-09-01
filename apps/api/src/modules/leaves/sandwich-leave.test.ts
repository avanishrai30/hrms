import { describe, expect, it } from "vitest";
import { SandwichLeaveEngine } from "./sandwich-leave.engine.js";
import { SandwichPolicyType } from "@prisma/client";

describe("SandwichLeaveEngine", () => {
  // Friday 2026-10-02 to Monday 2026-10-05 (4 calendar days: Fri, Sat, Sun, Mon)
  const fri = new Date("2026-10-02T00:00:00Z");
  const mon = new Date("2026-10-05T00:00:00Z");

  it("handles standard calculation with NO sandwich policy (only working days deducted)", () => {
    const result = SandwichLeaveEngine.calculate({
      startDate: fri,
      endDate: mon,
      sandwichPolicy: SandwichPolicyType.NONE
    });

    expect(result.totalCalendarDays).toBe(4);
    expect(result.workingDays).toBe(2); // Friday and Monday
    expect(result.sandwichPenaltyDays).toBe(0);
    expect(result.deductedDays).toBe(2);
  });

  it("applies WEEKENDS_ONLY sandwich policy (deducts intervening Saturday and Sunday)", () => {
    const result = SandwichLeaveEngine.calculate({
      startDate: fri,
      endDate: mon,
      sandwichPolicy: SandwichPolicyType.WEEKENDS_ONLY
    });

    expect(result.totalCalendarDays).toBe(4);
    expect(result.workingDays).toBe(2);
    expect(result.sandwichPenaltyDays).toBe(2); // Sat & Sun penalty
    expect(result.deductedDays).toBe(4); // 2 working + 2 weekend sandwich = 4 days
  });

  it("applies HOLIDAYS_ONLY sandwich policy with public holiday between leave days", () => {
    // Tuesday to Thursday with Wednesday as a public holiday
    const tue = new Date("2026-10-06T00:00:00Z");
    const thu = new Date("2026-10-08T00:00:00Z");
    const wedHoliday = new Date("2026-10-07T00:00:00Z");

    const result = SandwichLeaveEngine.calculate({
      startDate: tue,
      endDate: thu,
      sandwichPolicy: SandwichPolicyType.HOLIDAYS_ONLY,
      holidays: [{ date: wedHoliday, name: "Gandhi Jayanti" }]
    });

    expect(result.totalCalendarDays).toBe(3);
    expect(result.workingDays).toBe(2); // Tue and Thu
    expect(result.sandwichPenaltyDays).toBe(1); // Wed holiday penalty
    expect(result.deductedDays).toBe(3);
  });

  it("applies WEEKENDS_AND_HOLIDAYS sandwich policy spanning weekends and public holidays", () => {
    // Thursday to Tuesday with Friday holiday and Sat/Sun weekend
    const thu = new Date("2026-10-01T00:00:00Z");
    const tue = new Date("2026-10-06T00:00:00Z");
    const friHoliday = new Date("2026-10-02T00:00:00Z");

    const result = SandwichLeaveEngine.calculate({
      startDate: thu,
      endDate: tue,
      sandwichPolicy: SandwichPolicyType.WEEKENDS_AND_HOLIDAYS,
      holidays: [{ date: friHoliday, name: "Special Holiday" }]
    });

    expect(result.totalCalendarDays).toBe(6);
    expect(result.workingDays).toBe(3); // Thu, Mon, Tue
    expect(result.sandwichPenaltyDays).toBe(3); // Fri (holiday) + Sat + Sun (weekend)
    expect(result.deductedDays).toBe(6);
  });

  it("handles half-day leave directly as 0.5 days without sandwich", () => {
    const result = SandwichLeaveEngine.calculate({
      startDate: fri,
      endDate: fri,
      isHalfDay: true,
      sandwichPolicy: SandwichPolicyType.WEEKENDS_AND_HOLIDAYS
    });

    expect(result.totalCalendarDays).toBe(1);
    expect(result.deductedDays).toBe(0.5);
    expect(result.sandwichPenaltyDays).toBe(0);
  });
});
