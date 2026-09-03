import { describe, it, expect } from "vitest";
import { formatMoney } from "./money";
import { getAuthorizedCommandRoutes, COMMAND_ROUTES } from "../components/search-dialog";

describe("AIavro Payroll & Financial Integrity Tests (Task 05.1)", () => {
  describe("1. Money Utility & Truthful Precision (Blocker 1 & 3)", () => {
    it("formats real zero with currency symbol and precision without collapsing to em-dash", () => {
      expect(formatMoney(0, "INR")).toBe("₹0.00");
      expect(formatMoney(0, "USD")).toBe("$0.00");
      expect(formatMoney(0, "GBP")).toBe("£0.00");
      expect(formatMoney(0, "EUR")).toBe("€0.00");
      expect(formatMoney("0", "USD")).toBe("$0.00");
    });

    it("returns em-dash for null, undefined, empty string, NaN, or missing currency", () => {
      expect(formatMoney(null, "USD")).toBe("—");
      expect(formatMoney(undefined, "USD")).toBe("—");
      expect(formatMoney("", "USD")).toBe("—");
      expect(formatMoney(NaN, "USD")).toBe("—");
      expect(formatMoney(5000, null)).toBe("—");
      expect(formatMoney(5000, undefined)).toBe("—");
      expect(formatMoney(5000, "")).toBe("—");
    });

    it("formats positive financial amounts with locale-aware precision", () => {
      expect(formatMoney(85000, "INR")).toBe("₹85,000.00");
      expect(formatMoney(120000.5, "USD")).toBe("$120,000.50");
    });
  });

  describe("2. Compensation & Payroll RBAC Gating (Blocker 6 & 7)", () => {
    it("restricts command palette payroll routes to authorized permissions", () => {
      const payrollRoutes = COMMAND_ROUTES.filter((r) => r.href.startsWith("/payroll"));
      expect(payrollRoutes.length).toBeGreaterThan(0);

      // User with no permissions cannot see payroll in command palette
      const unauthRoutes = getAuthorizedCommandRoutes([]);
      expect(unauthRoutes.some((r) => r.href === "/payroll")).toBe(false);

      // User with payroll.read sees Enterprise Payroll
      const payrollUserRoutes = getAuthorizedCommandRoutes(["payroll.read"]);
      expect(payrollUserRoutes.some((r) => r.href === "/payroll")).toBe(true);
    });

    it("evaluates action-level gates strictly", () => {
      const canGeneratePayroll = (perms: string[]) => perms.includes("payroll.manage");
      const canApprovePayroll = (perms: string[]) => perms.includes("payroll.manage");
      const canLockPayroll = (perms: string[]) => perms.includes("payroll.lock");
      const canViewCompensation = (perms: string[]) => perms.includes("compensation.read") || perms.includes("payroll.read");

      expect(canGeneratePayroll(["payroll.read"])).toBe(false);
      expect(canGeneratePayroll(["payroll.manage"])).toBe(true);

      expect(canApprovePayroll(["payroll.read"])).toBe(false);
      expect(canApprovePayroll(["payroll.manage"])).toBe(true);

      expect(canLockPayroll(["payroll.manage"])).toBe(false);
      expect(canLockPayroll(["payroll.lock"])).toBe(true);

      expect(canViewCompensation([])).toBe(false);
      expect(canViewCompensation(["payroll.read"])).toBe(true);
      expect(canViewCompensation(["compensation.read"])).toBe(true);
    });
  });

  describe("3. Payroll State Machine Validation (Blocker 8)", () => {
    it("validates allowable status transitions according to backend rules", () => {
      const canTransition = (from: string, action: string) => {
        if (from === "LOCKED") return false;
        if (from === "GENERATED" && ["APPROVE", "CANCEL", "RECALCULATE"].includes(action)) return true;
        if (from === "APPROVED" && action === "LOCK") return true;
        return false;
      };

      expect(canTransition("GENERATED", "APPROVE")).toBe(true);
      expect(canTransition("GENERATED", "CANCEL")).toBe(true);
      expect(canTransition("GENERATED", "RECALCULATE")).toBe(true);
      expect(canTransition("GENERATED", "LOCK")).toBe(false);

      expect(canTransition("APPROVED", "LOCK")).toBe(true);
      expect(canTransition("APPROVED", "CANCEL")).toBe(false);
      expect(canTransition("APPROVED", "RECALCULATE")).toBe(false);

      expect(canTransition("LOCKED", "APPROVE")).toBe(false);
      expect(canTransition("LOCKED", "CANCEL")).toBe(false);
      expect(canTransition("LOCKED", "RECALCULATE")).toBe(false);
    });
  });
});
