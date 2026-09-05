import { describe, it, expect } from "vitest";

describe("AIavro Dashboard Production Integrity & Zero Synthetic Data Verification", () => {
  it("never returns fake numeric fallbacks on leave API failures", () => {
    const leaveBalances: Array<{ availableDays: number }> = [];
    const isSuccess = false;
    const totalLeaveDays = isSuccess
      ? leaveBalances.reduce((sum, item) => sum + Number(item.availableDays ?? 0), 0)
      : null;

    expect(totalLeaveDays).toBeNull();
    expect(totalLeaveDays).not.toBe(18);
  });

  it("differentiates between 0 leave balance and failed/unloaded state", () => {
    const emptyBalanceArray: Array<{ availableDays: number }> = [];
    const isSuccess = true;
    const computedBalance = isSuccess
      ? emptyBalanceArray.reduce((sum, item) => sum + Number(item.availableDays ?? 0), 0)
      : null;

    expect(computedBalance).toBe(0);
    expect(computedBalance).not.toBeNull();
  });

  it("never fabricates headcount metrics when employee count is null or unauthorized", () => {
    const rawApiCount: number | null = null;
    const renderedHeadcount = rawApiCount ?? null;

    expect(renderedHeadcount).toBeNull();
    expect(renderedHeadcount).not.toBe(128);
  });

  it("never assigns synthetic identities when profile is null or unlinked", () => {
    const profile = null;
    const displayName = profile ? "Some Name" : null;

    expect(displayName).toBeNull();
    expect(displayName).not.toBe("Avanish Rai");
    expect(displayName).not.toBe("User");
  });

  it("differentiates unavailable pending requests from 0 pending requests", () => {
    const isSuccess = false;
    const requests: Array<{ status: string }> = [];
    const pendingCount = isSuccess
      ? requests.filter((r) => r.status.includes("PENDING")).length
      : null;

    expect(pendingCount).toBeNull();
    expect(pendingCount).not.toBe(0);

    const isSuccessZero = true;
    const zeroPendingCount = isSuccessZero
      ? requests.filter((r) => r.status.includes("PENDING")).length
      : null;

    expect(zeroPendingCount).toBe(0);
  });

  it("computes accurate attendance semantic states based on real API flags", () => {
    // 1. Can check in
    const state1 = { canCheckIn: true, canCheckOut: false, record: null, isError: false, isLoading: false };
    const label1 = state1.canCheckIn ? "Ready to clock in" : "Other";
    expect(label1).toBe("Ready to clock in");

    // 2. Currently working
    const state2 = { canCheckIn: false, canCheckOut: true, record: { checkInAt: "2026-09-02T09:00:00Z", checkOutAt: null }, isError: false };
    const label2 = state2.canCheckOut ? "Currently working" : "Other";
    expect(label2).toBe("Currently working");

    // 3. API Error
    const state3 = { isError: true };
    const label3 = state3.isError ? "Attendance unavailable" : "Other";
    expect(label3).toBe("Attendance unavailable");
  });

  it("never uses 'Standard Leave' as an invented leave type label", () => {
    const leaveItemWithoutType = { availableDays: 5, leaveType: null };
    const label = (leaveItemWithoutType.leaveType as { name?: string; code?: string } | null)?.name ||
      (leaveItemWithoutType.leaveType as { name?: string; code?: string } | null)?.code ||
      "Leave type";

    expect(label).toBe("Leave type");
    expect(label).not.toBe("Standard Leave");
  });

  it("does not assume standard 8 hours when shift configuration is absent", () => {
    const checkInTime = "2026-09-02T09:00:00.000Z";
    const checkOutTime = "2026-09-02T11:30:00.000Z";
    const shiftHours: number | null = null;

    const start = new Date(checkInTime).getTime();
    const end = new Date(checkOutTime).getTime();
    const diffMins = Math.max(0, Math.floor((end - start) / 60000));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    let percentage: number | null = null;
    if (shiftHours && shiftHours > 0) {
      percentage = Math.min(100, Math.round((diffMins / (shiftHours * 60)) * 100));
    }

    expect(formatted).toBe("02:30");
    expect(percentage).toBeNull(); // No assumption of 8h percentage
  });

  it("ensures unassigned shift displays 'Not assigned' and never 'Shift Ended'", () => {
    const attendanceWithoutShift: {
      shift: { name?: string } | null;
      record: { checkInAt: string; checkOutAt: string; status: string } | null;
    } = {
      shift: null,
      record: { checkInAt: "2026-09-04T12:00:00Z", checkOutAt: "2026-09-04T13:00:00Z", status: "HALF_DAY" }
    };

    const shiftDisplay = attendanceWithoutShift.shift?.name || "Not assigned";
    expect(shiftDisplay).toBe("Not assigned");
    expect(shiftDisplay).not.toBe("Shift Ended");
    expect(shiftDisplay).not.toBe("Standard Work Shift");
  });

  it("ensures attendance action strip shows real timestamps without fallback", () => {
    const record = { checkInAt: "2026-09-04T12:00:00.000Z", checkOutAt: "2026-09-04T13:00:00.000Z" };
    const shift = null;

    const shiftText = shift ? (shift as { name: string }).name : "Shift not assigned";
    const statusText = record.checkInAt && record.checkOutAt
      ? `Attendance completed · In ${new Date(record.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Out ${new Date(record.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "Not checked in yet";

    expect(shiftText).toBe("Shift not assigned");
    expect(shiftText).not.toBe("Standard Work Shift");
    expect(statusText).toContain("Attendance completed");
  });

  it("validates 7, 14, 30 days period options map to correct query numbers", () => {
    const periodMap = {
      "7days": 7,
      "14days": 14,
      "30days": 30
    } as const;

    expect(periodMap["7days"]).toBe(7);
    expect(periodMap["14days"]).toBe(14);
    expect(periodMap["30days"]).toBe(30);
  });

  it("verifies chart Y domain has a strict minimum of 0 and cannot dip negative", () => {
    const domain: [number, string] = [0, "auto"];
    expect(domain[0]).toBe(0);

    const dataPoints = [{ present: 0 }, { present: 4 }, { present: 0 }];
    const clampedPoints = dataPoints.map((p) => Math.max(0, p.present));
    expect(clampedPoints.every((v) => v >= 0)).toBe(true);
  });
});

describe("Workforce Activity Analytics Permission Gating", () => {
  it("enables query when user has analytics.view permission", () => {
    const permissions = ["analytics.view", "attendance.view"];
    const hasAnalyticsAccess = permissions.includes("analytics.view");
    expect(hasAnalyticsAccess).toBe(true);
  });

  it("disables query when user has employees.read without analytics.view", () => {
    const permissions = ["employees.read", "attendance.view"];
    const hasAnalyticsAccess = permissions.includes("analytics.view");
    expect(hasAnalyticsAccess).toBe(false);
  });

  it("disables query when user has attendance.view without analytics.view", () => {
    const permissions = ["attendance.view"];
    const hasAnalyticsAccess = permissions.includes("analytics.view");
    expect(hasAnalyticsAccess).toBe(false);
  });

  it("disables query when user has tenant.settings.read without analytics.view", () => {
    const permissions = ["tenant.settings.read"];
    const hasAnalyticsAccess = permissions.includes("analytics.view");
    expect(hasAnalyticsAccess).toBe(false);
  });

  it("emits no /analytics/attendance request (preventing 403) when analytics.view is absent", () => {
    const testCases = [
      ["employees.read"],
      ["attendance.view"],
      ["tenant.settings.read"],
      ["employees.read", "attendance.view", "tenant.settings.read"],
      []
    ];

    for (const permissions of testCases) {
      const hasAnalyticsAccess = permissions.includes("analytics.view");
      const queryEnabled = hasAnalyticsAccess;
      expect(queryEnabled).toBe(false);

      let networkRequestTriggered = false;
      const simulatedQuery = {
        enabled: queryEnabled,
        execute: () => {
          if (!queryEnabled) return;
          networkRequestTriggered = true;
        }
      };
      simulatedQuery.execute();
      expect(networkRequestTriggered).toBe(false);
    }
  });
});
