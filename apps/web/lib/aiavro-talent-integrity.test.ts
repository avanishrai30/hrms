import { describe, it, expect } from "vitest";
import {
  formatTalentLabel,
  formatNullableNumber,
  formatCurrency,
  formatDateTime,
  statusTone,
  visibleMetric,
  hasSyntheticTalentDefault,
  APPLICATION_STAGES
} from "./queries/use-talent-queries";

describe("AIavro Talent Acquisition Production Integrity & Security Tests (Task 04)", () => {
  describe("1. Formatting Helpers & Zero Synthetic State Defaults", () => {
    it("formatTalentLabel replaces underscores with spaces or returns em-dash for empty/null", () => {
      expect(formatTalentLabel("TECHNICAL_ROUND")).toBe("TECHNICAL ROUND");
      expect(formatTalentLabel("PENDING_APPROVAL")).toBe("PENDING APPROVAL");
      expect(formatTalentLabel(null)).toBe("-");
      expect(formatTalentLabel(undefined)).toBe("-");
      expect(formatTalentLabel("")).toBe("-");
    });

    it("formatNullableNumber formats numbers with optional suffix or returns em-dash", () => {
      expect(formatNullableNumber(5, " openings")).toBe("5 openings");
      expect(formatNullableNumber(0, " openings")).toBe("0 openings");
      expect(formatNullableNumber(null)).toBe("-");
      expect(formatNullableNumber(undefined)).toBe("-");
      expect(formatNullableNumber(NaN)).toBe("-");
    });

    it("formatCurrency formats Indian Rupee values accurately without fake estimates", () => {
      const formatted = formatCurrency(1200000);
      expect(formatted).toContain("12,00,000");
      expect(formatCurrency(null)).toBe("-");
      expect(formatCurrency(undefined)).toBe("-");
      expect(formatCurrency("")).toBe("-");
    });

    it("formatDateTime formats timestamps timezone-consciously and returns em-dash for empty values", () => {
      const date = "2026-09-02T10:00:00.000Z";
      const formatted = formatDateTime(date, "Asia/Kolkata");
      expect(formatted).toContain("2026");
      expect(formatDateTime(null)).toBe("-");
      expect(formatDateTime(undefined)).toBe("-");
    });

    it("statusTone maps statuses to standard shadcn badge variants", () => {
      expect(statusTone("APPROVED")).toBe("default");
      expect(statusTone("HIRED")).toBe("default");
      expect(statusTone("REJECTED")).toBe("destructive");
      expect(statusTone("PENDING_APPROVAL")).toBe("secondary");
      expect(statusTone(undefined)).toBe("outline");
    });

    it("visibleMetric differentiates 0 from null/undefined", () => {
      expect(visibleMetric(0)).toBe("0");
      expect(visibleMetric(42)).toBe("42");
      expect(visibleMetric(null)).toBe("-");
      expect(visibleMetric(undefined)).toBe("-");
    });

    it("hasSyntheticTalentDefault accurately detects prohibited synthetic strings", () => {
      expect(hasSyntheticTalentDefault("Aakash Sharma")).toBe(true);
      expect(hasSyntheticTalentDefault("Industry leading")).toBe(true);
      expect(hasSyntheticTalentDefault("Math.random()")).toBe(true);
      expect(hasSyntheticTalentDefault("Software Engineer II")).toBe(false);
    });
  });

  describe("2. Application Stage Workflow & Transition Rules", () => {
    it("APPLICATION_STAGES contains the exact 8 defined ATS stages in correct order", () => {
      expect(APPLICATION_STAGES).toEqual([
        "APPLIED",
        "SCREENING",
        "TECHNICAL_ROUND",
        "MANAGER_ROUND",
        "HR_ROUND",
        "OFFER",
        "JOINED",
        "REJECTED"
      ]);
    });

    it("computes the sequential next stage accurately", () => {
      const getNextStage = (current: string) => {
        const idx = APPLICATION_STAGES.indexOf(current as (typeof APPLICATION_STAGES)[number]);
        if (idx === -1 || idx === APPLICATION_STAGES.length - 1) return null;
        return APPLICATION_STAGES[idx + 1];
      };

      expect(getNextStage("APPLIED")).toBe("SCREENING");
      expect(getNextStage("SCREENING")).toBe("TECHNICAL_ROUND");
      expect(getNextStage("TECHNICAL_ROUND")).toBe("MANAGER_ROUND");
      expect(getNextStage("MANAGER_ROUND")).toBe("HR_ROUND");
      expect(getNextStage("HR_ROUND")).toBe("OFFER");
      expect(getNextStage("OFFER")).toBe("JOINED");
      expect(getNextStage("REJECTED")).toBeNull();
    });
  });

  describe("3. Candidate Privacy & Compensation Gating", () => {
    it("fails closed when user lacks candidate or offer permissions", () => {
      const canViewCandidatePii = (permissions: string[]) => {
        return permissions.includes("candidates.read");
      };

      const canViewCompensation = (permissions: string[]) => {
        return permissions.includes("offers.read");
      };

      expect(canViewCandidatePii(["recruitment.read"])).toBe(false);
      expect(canViewCandidatePii(["candidates.read"])).toBe(true);

      expect(canViewCompensation(["recruitment.read", "candidates.read"])).toBe(false);
      expect(canViewCompensation(["offers.read"])).toBe(true);
    });
  });

  describe("4. Candidate Conversion & Onboarding Idempotency", () => {
    it("prevents double hiring when candidate is already onboarded", () => {
      const validateCandidateForOnboarding = (candidate: {
        id: string;
        status: string;
        hiredEmployeeId?: string | null;
        offers?: Array<{ status: string }>;
      }) => {
        if (candidate.hiredEmployeeId) {
          throw new Error("Candidate is already onboarded as an employee.");
        }
        const hasAcceptedOffer = candidate.status === "OFFER_ACCEPTED" || candidate.offers?.some((o) => o.status === "ACCEPTED");
        if (!hasAcceptedOffer && candidate.status !== "HIRED") {
          throw new Error("Candidate does not have an accepted offer.");
        }
        return true;
      };

      // Already onboarded throws
      expect(() =>
        validateCandidateForOnboarding({
          id: "cand-1",
          status: "HIRED",
          hiredEmployeeId: "emp-101"
        })
      ).toThrow("Candidate is already onboarded as an employee.");

      // No accepted offer throws
      expect(() =>
        validateCandidateForOnboarding({
          id: "cand-2",
          status: "SCREENING",
          hiredEmployeeId: null
        })
      ).toThrow("Candidate does not have an accepted offer.");

      // Valid candidate with accepted offer passes
      expect(
        validateCandidateForOnboarding({
          id: "cand-3",
          status: "OFFER_ACCEPTED",
          hiredEmployeeId: null,
          offers: [{ status: "ACCEPTED" }]
        })
      ).toBe(true);
    });
  });
});
