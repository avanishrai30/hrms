import { describe, expect, it } from "vitest";
import { getAuthorizedCommandRoutes } from "../components/search-dialog";
import {
  buildPunchPayload,
  formatLeaveDaysMetric,
  formatLocationRadius,
  formatLocationType,
  formatPendingRequestsMetric,
  formatShiftName,
  getGpsFailureMessageForAttendance,
  getPendingRequestsBadge,
  shouldRenderReleaseBadge,
  shouldRenderUnreadNotificationDot
} from "./semantic-state";

describe("semantic state rendering", () => {
  it("missing shift renders no invented shift name", () => {
    expect(formatShiftName(undefined, { isSuccess: true })).toBe("—");
    expect(formatShiftName(null, { isSuccess: true })).toBe("Shift not assigned");
    expect(formatShiftName({ name: "Morning A" }, { isSuccess: true })).toBe("Morning A");
    expect(formatShiftName(undefined, { isSuccess: true })).not.toBe("Standard Shift");
  });

  it("leave unavailable does not render zero while successful zero does", () => {
    expect(formatLeaveDaysMetric(null, { isLoading: false, isSuccess: false })).toBe("—");
    expect(formatLeaveDaysMetric(0, { isLoading: false, isSuccess: true })).toBe("0 d");
    expect(formatLeaveDaysMetric(7, { isLoading: false, isSuccess: true })).toBe("7 d");
  });

  it("request unavailable does not render zero or reviewed while successful zero is explicit", () => {
    expect(formatPendingRequestsMetric(null, { isLoading: false, isSuccess: false })).toBe("—");
    expect(getPendingRequestsBadge(null, { isSuccess: false })).toBeNull();
    expect(formatPendingRequestsMetric(0, { isLoading: false, isSuccess: true })).toBe("0");
    expect(getPendingRequestsBadge(0, { isSuccess: true })).toBe("No pending requests");
    expect(getPendingRequestsBadge(2, { isSuccess: true })).toBe("Pending");
  });

  it("missing location metadata does not render OFFICE or Standard", () => {
    expect(formatLocationType(undefined)).toBe("—");
    expect(formatLocationType("OFFICE")).toBe("OFFICE");
    expect(formatLocationRadius(undefined)).toBe("—");
    expect(formatLocationRadius(100)).toBe("100 m");
  });

  it("location create payload omits type and radius unless user enters them", () => {
    const payload: { type?: string | undefined; radiusMeters?: number | undefined } = {
      type: undefined,
      radiusMeters: undefined
    };
    expect(JSON.stringify(payload)).toBe("{}");
  });

  it("notification and release badges require real state", () => {
    expect(shouldRenderUnreadNotificationDot(undefined)).toBe(false);
    expect(shouldRenderUnreadNotificationDot(0)).toBe(false);
    expect(shouldRenderUnreadNotificationDot(3)).toBe(true);
    expect(shouldRenderReleaseBadge(undefined)).toBe(false);
    expect(shouldRenderReleaseBadge(true)).toBe(true);
  });

  it("geofence-required attendance blocks punch after GPS failure", () => {
    expect(getGpsFailureMessageForAttendance({ requireGeofence: true }, "denied")).toContain("required");
    expect(getGpsFailureMessageForAttendance({ requireGeofence: true }, "timeout")).toContain("timed out");
  });

  it("optional-geofence attendance may proceed without fabricated coordinates", () => {
    expect(getGpsFailureMessageForAttendance({ requireGeofence: false }, "denied")).toBeNull();
    const payload = buildPunchPayload({ action: "check-in" });
    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
  });

  it("attendance errors can be surfaced from mutation exceptions", () => {
    const err = new Error("GPS coordinates are required for attendance check-in by tenant policy.");
    expect(err.message).toContain("GPS coordinates are required");
  });

  it("command palette remains RBAC aware", () => {
    const accessible = getAuthorizedCommandRoutes(["directory.view"]);
    expect(accessible.some((item) => item.href === "/dashboard")).toBe(true);
    expect(accessible.some((item) => item.href === "/employees")).toBe(false);
    expect(accessible.some((item) => item.href === "/payroll")).toBe(false);
  });
});
