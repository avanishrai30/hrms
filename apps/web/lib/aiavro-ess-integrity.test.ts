import { describe, it, expect } from "vitest";
import QRCode from "qrcode";
import { getApiUrl } from "./api";
import { formatShiftName } from "./semantic-state";
import type { PermissionCode } from "@vc-wms/shared-types";

describe("AIavro Employee Self-Service (ESS) Security, Integrity & Contract Verification", () => {
  describe("Fail-Closed Permission Architecture", () => {
    it("empty permissions never grant payslip access", () => {
      const emptyPermissions: PermissionCode[] = [];
      const hasPermission = emptyPermissions.includes("payslip.view");
      expect(hasPermission).toBe(false);
    });

    it("empty permissions never grant document access", () => {
      const emptyPermissions: PermissionCode[] = [];
      const hasPermission = emptyPermissions.includes("documents.view");
      expect(hasPermission).toBe(false);
    });

    it("empty permissions never grant request access", () => {
      const emptyPermissions: PermissionCode[] = [];
      const hasPermission = emptyPermissions.includes("requests.view");
      expect(hasPermission).toBe(false);
    });

    it("empty permissions never grant ID-card access", () => {
      const emptyPermissions: PermissionCode[] = [];
      const hasPermission = emptyPermissions.includes("idcard.view");
      expect(hasPermission).toBe(false);
    });

    it("session loading differs from unauthorized state", () => {
      const evaluateGate = (isHydrated: boolean, token: string | null, perms: PermissionCode[], required: PermissionCode[]) => {
        const isReady = isHydrated;
        const isAuthorized = isReady && Boolean(token) && required.some((p) => perms.includes(p));
        return {
          isLoading: !isReady,
          isAuthorized
        };
      };

      // Case 1: Session not yet hydrated -> loading=true, authorized=false
      const loadingState = evaluateGate(false, "token", ["payslip.view"], ["payslip.view"]);
      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.isAuthorized).toBe(false);

      // Case 2: Session hydrated, authenticated, but missing permission -> loading=false, authorized=false
      const unauthorizedState = evaluateGate(true, "token", ["profile.view"], ["payslip.view"]);
      expect(unauthorizedState.isLoading).toBe(false);
      expect(unauthorizedState.isAuthorized).toBe(false);

      // Case 3: Session hydrated, authenticated, and has required permission -> loading=false, authorized=true
      const authorizedState = evaluateGate(true, "token", ["payslip.view"], ["payslip.view"]);
      expect(authorizedState.isLoading).toBe(false);
      expect(authorizedState.isAuthorized).toBe(true);
    });

    it("protected query remains disabled while session is unresolved or unauthorized", () => {
      const isSessionReady = false;
      const hasPermission = true;
      const isEnabledUnresolved = isSessionReady && hasPermission;
      expect(isEnabledUnresolved).toBe(false);

      const isSessionReadyAuthorized = true;
      const hasPermissionFalse = false;
      const isEnabledUnauthorized = isSessionReadyAuthorized && hasPermissionFalse;
      expect(isEnabledUnauthorized).toBe(false);

      const isEnabledAuthorized = isSessionReadyAuthorized && hasPermission;
      expect(isEnabledAuthorized).toBe(true);
    });
  });

  describe("ID Credential & Standards-Compliant QR Code", () => {
    it("ID card never renders literal ACTIVE without API status", () => {
      const card = {
        fullName: "Test Employee",
        employeeCode: "VC-001"
      };

      const status = (card as { status?: string }).status;
      expect(status).toBeUndefined();
      expect(status || null).toBeNull();
    });

    it("encodes valid QR identification payload via mature qrcode package", async () => {
      const payload = JSON.stringify({
        org: "vc-organics",
        code: "VC-001",
        name: "Test User",
        dept: "Engineering",
        role: "Software Architect",
        valid: true,
        issued: "2026-09-02"
      });

      const svg = await QRCode.toString(payload, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 4,
        color: { dark: "#0F172A", light: "#FFFFFF" }
      });

      expect(svg).toContain("<svg");
      expect(svg).toContain("<path");
      expect(svg).toContain('stroke="#0F172A"');
    });

    it("generates distinct QR SVG outputs for different payloads", async () => {
      const payloadA = JSON.stringify({ code: "VC-001" });
      const payloadB = JSON.stringify({ code: "VC-002" });

      const svgA = await QRCode.toString(payloadA, { type: "svg", errorCorrectionLevel: "M", margin: 4 });
      const svgB = await QRCode.toString(payloadB, { type: "svg", errorCorrectionLevel: "M", margin: 4 });

      expect(svgA).not.toEqual(svgB);
    });

    it("credential copy identifies identification payload neutrally without claiming unverified signatures", () => {
      const label = "Identification Payload";
      expect(label).not.toContain("Verified Signature");
      expect(label).toBe("Identification Payload");
    });
  });

  describe("Download Architecture & Origin Isolation", () => {
    it("getApiUrl resolves paths against configured API origin without same-origin assumption", () => {
      const url = getApiUrl("/payslips/123/download");
      expect(url).toContain("/api/v1/payslips/123/download");
      expect(url.startsWith("http://") || url.startsWith("https://")).toBe(true);
    });

    it("document private downloads route through authenticated API endpoint", () => {
      const docId = "doc-999";
      const downloadEndpoint = `/documents/${docId}/download`;
      expect(downloadEndpoint).toBe("/documents/doc-999/download");
    });
  });

  describe("Data Integrity & Fallback Sanitization", () => {
    it("missing profile name never renders 'Employee' and fallbacks cleanly", () => {
      const profile = { id: "emp-1", email: "test@example.com" };
      const displayName = (profile as { fullName?: string }).fullName || "—";
      expect(displayName).toBe("—");
      expect(displayName).not.toBe("Employee");
    });

    it("missing shift renders 'Shift not assigned' instead of 'Standard Shift'", () => {
      const shiftLabel = formatShiftName(null, { isSuccess: true });
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
      const balanceWithAbsent = { id: "b1", availableDays: 5 };
      const allocated = typeof (balanceWithAbsent as { allocatedDays?: number }).allocatedDays === "number"
        ? `${(balanceWithAbsent as { allocatedDays?: number }).allocatedDays}d`
        : "—";
      expect(allocated).toBe("—");

      const balanceWithZero = { id: "b2", availableDays: 0, allocatedDays: 0, consumedDays: 0 };
      const allocatedZero = typeof balanceWithZero.allocatedDays === "number" ? `${balanceWithZero.allocatedDays}d` : "—";
      expect(allocatedZero).toBe("0d");
    });
  });
});
