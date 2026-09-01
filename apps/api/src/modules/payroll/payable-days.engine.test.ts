import { describe, expect, it } from "vitest";
import { PayableDaysEngine } from "./payable-days.engine.js";

describe("PayableDaysEngine", () => {
  it("calculates full payable days when employee is present every working day", () => {
    // 2026 April (30 days, 26 working days standard)
    const attendances = [];
    for (let day = 1; day <= 26; day++) {
      attendances.push({
        date: `2026-04-${String(day).padStart(2, "0")}`,
        status: "PRESENT"
      });
    }

    const result = PayableDaysEngine.calculatePayableDays({
      month: 4,
      year: 2026,
      workingDaysOverride: 26,
      attendances,
      approvedLeaves: [],
      holidays: []
    });

    expect(result.workingDays).toBe(26);
    expect(result.presentDays).toBe(26);
    expect(result.payableDays).toBe(26);
    expect(result.absentDays).toBe(0);
  });

  it("calculates payable days with a mix of Present, Paid Leaves, Holidays, and Half-Days", () => {
    const attendances = [
      { date: "2026-04-01", status: "PRESENT" },
      { date: "2026-04-02", status: "PRESENT", lateMinutes: 15 },
      { date: "2026-04-03", status: "HALF_DAY" },
      { date: "2026-04-06", status: "PRESENT" },
      { date: "2026-04-07", status: "PRESENT", earlyDepartureMinutes: 30 }
    ];

    const approvedLeaves = [
      {
        startDate: "2026-04-08",
        endDate: "2026-04-09", // 2 paid leave days
        isPaid: true,
        totalDays: 2
      },
      {
        startDate: "2026-04-10",
        endDate: "2026-04-10", // 1 unpaid leave day
        isPaid: false,
        totalDays: 1
      }
    ];

    const holidays = [
      { date: "2026-04-14", name: "Ambedkar Jayanti" } // 1 holiday
    ];

    const result = PayableDaysEngine.calculatePayableDays({
      month: 4,
      year: 2026,
      workingDaysOverride: 26,
      attendances,
      approvedLeaves,
      holidays
    });

    expect(result.presentDays).toBe(4); // 4 full days
    expect(result.halfDays).toBe(1); // 1 half day
    expect(result.paidLeaveDays).toBe(2); // 2 paid leaves
    expect(result.unpaidLeaveDays).toBe(1); // 1 unpaid leave
    expect(result.holidayDays).toBe(1); // 1 holiday
    expect(result.lateDays).toBe(1); // 1 late
    expect(result.earlyExitDays).toBe(1); // 1 early exit

    // Formula: 4 + 2 + 1 + (0.5 * 1) = 7.5
    expect(result.payableDays).toBe(7.5);
  });

  it("caps payable days at working days", () => {
    const attendances = [];
    for (let day = 1; day <= 30; day++) {
      attendances.push({
        date: `2026-04-${String(day).padStart(2, "0")}`,
        status: "PRESENT"
      });
    }

    const result = PayableDaysEngine.calculatePayableDays({
      month: 4,
      year: 2026,
      workingDaysOverride: 26,
      attendances,
      approvedLeaves: [],
      holidays: []
    });

    expect(result.payableDays).toBe(26);
  });
});
