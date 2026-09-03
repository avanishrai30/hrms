import { describe, it, expect } from "vitest";
import { formatMoney } from "./money";
import { getAuthorizedCommandRoutes, COMMAND_ROUTES } from "../components/search-dialog";
import {
  canReadPayroll,
  canManagePayroll,
  canLockPayroll,
  canAccessCompensation,
  isAllowedPayrollTransition
} from "./payroll-policy";

describe("AIavro Payroll & Financial Integrity Tests (Task 05.2)", () => {
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

  describe("2. Compensation & Payroll RBAC Gating (Blocker 6, 7, 15, 16)", () => {
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

    it("evaluates actual production action-level permission gates", () => {
      expect(canReadPayroll([])).toBe(false);
      expect(canReadPayroll(["payroll.read"])).toBe(true);

      expect(canManagePayroll(["payroll.read"])).toBe(false);
      expect(canManagePayroll(["payroll.manage"])).toBe(true);

      expect(canLockPayroll(["payroll.manage"])).toBe(false);
      expect(canLockPayroll(["payroll.lock"])).toBe(true);

      expect(canAccessCompensation([])).toBe(false);
      expect(canAccessCompensation(["payroll.read"])).toBe(true);
      expect(canAccessCompensation(["compensation.read"])).toBe(true);
    });
  });

  describe("3. Production Payroll State Machine Validation (Blocker 8 & 15)", () => {
    it("validates allowable status transitions according to production state machine contract", () => {
      expect(isAllowedPayrollTransition("GENERATED", "APPROVE")).toBe(true);
      expect(isAllowedPayrollTransition("GENERATED", "CANCEL")).toBe(true);
      expect(isAllowedPayrollTransition("GENERATED", "RECALCULATE")).toBe(true);
      expect(isAllowedPayrollTransition("GENERATED", "LOCK")).toBe(false);

      expect(isAllowedPayrollTransition("DRAFT", "APPROVE")).toBe(true);
      expect(isAllowedPayrollTransition("DRAFT", "CANCEL")).toBe(true);
      expect(isAllowedPayrollTransition("DRAFT", "RECALCULATE")).toBe(true);

      expect(isAllowedPayrollTransition("APPROVED", "LOCK")).toBe(true);
      expect(isAllowedPayrollTransition("APPROVED", "CANCEL")).toBe(false);
      expect(isAllowedPayrollTransition("APPROVED", "RECALCULATE")).toBe(false);

      expect(isAllowedPayrollTransition("LOCKED", "APPROVE")).toBe(false);
      expect(isAllowedPayrollTransition("LOCKED", "CANCEL")).toBe(false);
      expect(isAllowedPayrollTransition("LOCKED", "RECALCULATE")).toBe(false);
      expect(isAllowedPayrollTransition("LOCKED", "LOCK")).toBe(false);

      expect(isAllowedPayrollTransition("CANCELLED", "APPROVE")).toBe(false);
      expect(isAllowedPayrollTransition("CANCELLED", "RECALCULATE")).toBe(false);
    });
  });
});
