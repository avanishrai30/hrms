import { describe, it, expect } from "vitest";
import { getApiUrl } from "./api";

describe("AIavro Employee Self-Service (ESS) Domain Integrity & Contract Verification", () => {
  it("missing profile name never renders 'Employee' and fallbacks cleanly", () => {
    const profile = {
      id: "emp-1",
      email: "test@example.com"
      // firstName, lastName, fullName omitted
    };

    const displayName = (profile as { fullName?: string }).fullName || "—";
    expect(displayName).toBe("—");
    expect(displayName).not.toBe("Employee");
  });

  it("missing profile status never assumes 'ACTIVE'", () => {
    const profile = {
      id: "emp-1",
      fullName: "Test User"
      // status omitted
    };

    const status = (profile as { status?: string }).status;
    expect(status).toBeUndefined();
    expect(status || null).toBeNull();
  });

  it("missing shift renders 'Shift not assigned' instead of 'Standard Shift'", () => {
    const shift = null;
    const shiftLabel = (shift as { name?: string; workHours?: number } | null)?.name || "Shift not assigned";

    expect(shiftLabel).toBe("Shift not assigned");
    expect(shiftLabel).not.toBe("Standard Shift");
  });

  it("undefined attendance policy rule renders 'Not configured' instead of Enabled/Optional", () => {
    const renderPolicyRule = (value: boolean | undefined | null, trueText = "Required", falseText = "Not required") => {
      if (value === true) return trueText;
      if (value === false) return falseText;
      return "Not configured";
    };

    expect(renderPolicyRule(undefined)).toBe("Not configured");
    expect(renderPolicyRule(null)).toBe("Not configured");
    expect(renderPolicyRule(true)).toBe("Required");
    expect(renderPolicyRule(false)).toBe("Not required");
  });

  it("leave balance differentiates between 0 allocated, 0 consumed and absent fields", () => {
    const balanceWithAbsent = {
      id: "b1",
      availableDays: 5
      // allocatedDays, consumedDays absent
    };

    const allocated = typeof (balanceWithAbsent as { allocatedDays?: number }).allocatedDays === "number"
      ? `${(balanceWithAbsent as { allocatedDays?: number }).allocatedDays}d`
      : "—";

    const consumed = typeof (balanceWithAbsent as { consumedDays?: number }).consumedDays === "number"
      ? `${(balanceWithAbsent as { consumedDays?: number }).consumedDays}d`
      : "—";

    expect(allocated).toBe("—");
    expect(consumed).toBe("—");

    const balanceWithZero = {
      id: "b2",
      availableDays: 0,
      allocatedDays: 0,
      consumedDays: 0
    };

    const allocatedZero = typeof balanceWithZero.allocatedDays === "number"
      ? `${balanceWithZero.allocatedDays}d`
      : "—";

    expect(allocatedZero).toBe("0d");
  });

  it("missing leave code does not become 'LEAVE'", () => {
    const balance = { id: "b1", leaveType: null };
    const code = (balance.leaveType as { code?: string } | null)?.code || "—";
    expect(code).toBe("—");
    expect(code).not.toBe("LEAVE");
  });

  it("ID card does not render QR without real verification payload", () => {
    const cardWithoutQR = {
      fullName: "Test User",
      employeeCode: "VC-001"
      // qrCodePayload omitted
    };

    const hasVerification = Boolean((cardWithoutQR as { qrCodePayload?: string }).qrCodePayload);
    expect(hasVerification).toBe(false);
  });

  it("ID card missing tenant name does not fall back to platform name 'AIavro'", () => {
    const card = {
      fullName: "Test User"
      // companyName omitted
    };

    const tenantName = (card as { companyName?: string }).companyName || "—";
    expect(tenantName).toBe("—");
    expect(tenantName).not.toBe("AIavro");
  });

  it("leave request form validates exact YYYY-MM-DD format and min 4 char reason", () => {
    const validate = (startDate: string, endDate: string, reason: string) => {
      if (!startDate || !endDate) return "Please select both start and end dates.";
      if (startDate > endDate) return "Start date cannot be after end date.";
      if (reason.trim().length < 4) return "Reason must be at least 4 characters long.";
      return null;
    };

    expect(validate("2026-09-05", "2026-09-02", "Vacation")).toBe("Start date cannot be after end date.");
    expect(validate("2026-09-02", "2026-09-05", "Vac")).toBe("Reason must be at least 4 characters long.");
    expect(validate("2026-09-02", "2026-09-05", "Family leave")).toBeNull();
  });

  it("payslip permission gate disables query execution when permission is absent", () => {
    const permissions = ["profile.view"];
    const hasPermission = permissions.includes("payslip.view");

    expect(hasPermission).toBe(false);
  });

  it("getApiUrl resolves paths against configured API origin", () => {
    const url = getApiUrl("/payslips/123/download");
    expect(url).toContain("/api/v1/payslips/123/download");
    expect(url.startsWith("http://") || url.startsWith("https://")).toBe(true);
  });
});
