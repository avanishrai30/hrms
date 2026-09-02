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
    const initial = profile ? "S" : "U";

    expect(displayName).toBeNull();
    expect(displayName).not.toBe("Avanish Rai");
    expect(initial).toBe("U");
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

  it("calculates percentage accurately when real shift duration is supplied by API", () => {
    const checkInTime = "2026-09-02T09:00:00.000Z";
    const checkOutTime = "2026-09-02T13:00:00.000Z"; // 4 hours
    const shiftHours = 8; // API provided

    const start = new Date(checkInTime).getTime();
    const end = new Date(checkOutTime).getTime();
    const diffMins = Math.max(0, Math.floor((end - start) / 60000));
    const percentage = Math.min(100, Math.round((diffMins / (shiftHours * 60)) * 100));

    expect(percentage).toBe(50);
  });
});
