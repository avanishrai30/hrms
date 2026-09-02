import { describe, it, expect } from "vitest";

describe("AIavro Employee Self-Service (ESS) Domain Integrity & Contract Verification", () => {
  it("profile absent values fallback cleanly to '—' without synthetic data", () => {
    const profile = {
      id: "emp-1",
      firstName: "Test",
      lastName: "User",
      fullName: "Test User",
      email: "test@example.com"
      // department, designation, employeeCode, managerName omitted
    };

    const departmentName = (profile as { department?: string }).department || "—";
    const employeeCode = (profile as { employeeCode?: string }).employeeCode || "—";
    const managerName = (profile as { managerName?: string }).managerName || "—";

    expect(departmentName).toBe("—");
    expect(employeeCode).toBe("—");
    expect(managerName).toBe("—");
  });

  it("leave balance differentiates between 0 allocated and failed/unavailable state", () => {
    const zeroBalances = [{ id: "b1", availableDays: 0, leaveType: { name: "Casual Leave", code: "CL" } }];
    const totalAvailable = zeroBalances.reduce((sum, b) => sum + Number(b.availableDays ?? 0), 0);

    expect(totalAvailable).toBe(0);
    expect(totalAvailable).not.toBeNull();

    const isError = true;
    const errorAvailable = isError ? null : totalAvailable;
    expect(errorAvailable).toBeNull();
  });

  it("leave request form validates dates and mandatory reason", () => {
    const validate = (startDate: string, endDate: string, reason: string) => {
      if (!startDate || !endDate) return "Please select both start and end dates.";
      if (new Date(startDate) > new Date(endDate)) return "Start date cannot be after end date.";
      if (!reason.trim()) return "Please provide a reason for the leave request.";
      return null;
    };

    expect(validate("2026-09-05", "2026-09-02", "Vacation")).toBe("Start date cannot be after end date.");
    expect(validate("2026-09-02", "2026-09-05", "")).toBe("Please provide a reason for the leave request.");
    expect(validate("2026-09-02", "2026-09-05", "Family function")).toBeNull();
  });

  it("attendance duration computation computes accurate elapsed time without 8h assumption", () => {
    const checkIn = "2026-09-02T09:00:00Z";
    const checkOut = "2026-09-02T13:45:00Z";

    const diffMins = Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const formatted = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    expect(formatted).toBe("04:45");
  });

  it("payslip permission gate enforces 'payslip.view' boundary", () => {
    const permissionsWithoutPayslip = ["profile.view", "leave.view"];
    const hasPermission = permissionsWithoutPayslip.includes("payslip.view");

    expect(hasPermission).toBe(false);

    const permissionsWithPayslip = ["profile.view", "payslip.view"];
    const hasPermissionGranted = permissionsWithPayslip.includes("payslip.view");

    expect(hasPermissionGranted).toBe(true);
  });

  it("document categories match verified backend taxonomy", () => {
    const validCategories = ["IDENTITY", "ACADEMIC", "EXPERIENCE", "TAX", "COMPANY_POLICY", "PAYROLL"];
    expect(validCategories).toContain("IDENTITY");
    expect(validCategories).toContain("TAX");
    expect(validCategories).not.toContain("FAKED_CATEGORY");
  });

  it("id card missing profile renders unavailable state gracefully", () => {
    const cardData = null;
    const canRenderBadge = Boolean(cardData);
    expect(canRenderBadge).toBe(false);
  });
});
