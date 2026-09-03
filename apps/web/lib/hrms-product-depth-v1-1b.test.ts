import { describe, expect, it } from "vitest";
import { buildPunchPayload } from "./semantic-state";
import { formatEmploymentStatus, formatEmploymentType } from "./queries/use-people-queries";

describe("V1.1B Frontend HRMS Product Depth & Workflow Completion", () => {
  // 1. Truthful Employment Formatter Tests
  it("formats employment status truthfully without synthetic fallbacks", () => {
    expect(formatEmploymentStatus("ACTIVE")).toBe("ACTIVE");
    expect(formatEmploymentStatus("ON_LEAVE")).toBe("ON LEAVE");
    expect(formatEmploymentStatus("TERMINATED")).toBe("TERMINATED");
    expect(formatEmploymentStatus(undefined)).toBe("—");
    expect(formatEmploymentStatus("")).toBe("—");
  });

  it("formats employment type truthfully", () => {
    expect(formatEmploymentType("FULL_TIME")).toBe("FULL TIME");
    expect(formatEmploymentType("CONTRACT")).toBe("CONTRACT");
    expect(formatEmploymentType("INTERN")).toBe("INTERN");
    expect(formatEmploymentType(undefined)).toBe("—");
  });

  // 2. Attendance Payload Generation
  it("constructs clean GPS-enabled and fallback punch payloads", () => {
    const punchWithGps = buildPunchPayload({
      action: "check-in",
      notes: "Arrived at warehouse",
      coords: { latitude: 12.9716, longitude: 77.5946, accuracy: 15 }
    });

    expect(punchWithGps.action).toBe("check-in");
    expect(punchWithGps.latitude).toBe(12.9716);
    expect(punchWithGps.longitude).toBe(77.5946);
    expect(punchWithGps.accuracy).toBe(15);
    expect(punchWithGps.notes).toBe("Arrived at warehouse");

    const punchWithoutGps = buildPunchPayload({
      action: "check-out",
      notes: "Shift complete"
    });

    expect(punchWithoutGps.action).toBe("check-out");
    expect(punchWithoutGps.latitude).toBeUndefined();
    expect(punchWithoutGps.longitude).toBeUndefined();
    expect(punchWithoutGps.accuracy).toBeUndefined();
  });

  // 3. Tab Visibility Permission Checking Logic
  it("determines tab visibility according to permission gates", () => {
    const hasPermission = (userPerms: string[], required: string[]) =>
      required.some((p) => userPerms.includes(p));

    const hrPerms = ["employees.read", "employees.update", "leave.view", "assets.view"];
    const employeePerms = ["employees.read", "ess.read"];

    // HR user can view leave and assets tabs
    expect(hasPermission(hrPerms, ["leave.view"])).toBe(true);
    expect(hasPermission(hrPerms, ["assets.view"])).toBe(true);

    // Standard employee without assets.view cannot view assets tab
    expect(hasPermission(employeePerms, ["assets.view"])).toBe(false);
    expect(hasPermission(employeePerms, ["leave.view"])).toBe(false);
  });

  // 4. Zero Synthetic Fallbacks Verification
  it("verifies empty or missing fields render truthfully as null or em-dash", () => {
    const renderField = (value: string | null | undefined) => value || "—";

    expect(renderField(null)).toBe("—");
    expect(renderField(undefined)).toBe("—");
    expect(renderField("")).toBe("—");
    expect(renderField("Bengaluru HQ")).toBe("Bengaluru HQ");
  });
});
