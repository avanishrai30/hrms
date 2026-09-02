import { describe, it, expect } from "vitest";
import {
  formatTalentLabel,
  formatNullableNumber,
  formatCurrency,
  formatDateTime,
  statusTone,
  visibleMetric,
  hasSyntheticTalentDefault,
  APPLICATION_STAGES,
  getNextApplicationStage,
  canAccessCandidatePii,
  canAccessCompensation,
  canAccessInterviewFeedback,
  canManageRecruitment,
  canManageApplications,
  canManageOffers,
  canManagePreboarding
} from "./queries/use-talent-queries";
import { getVisibleTalentTabs, isTalentTabActive, talentTabs } from "../app/ats/_components/talent-ui";
import { getAuthorizedCommandRoutes } from "../components/search-dialog";

describe("AIavro Talent Acquisition Production Integrity & Security Tests (Task 04.1)", () => {
  describe("1. Formatting Helpers & Currency Ownership", () => {
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

    it("formatCurrency formats Indian Rupee values by default and supports explicit currencies", () => {
      const inrFormatted = formatCurrency(1200000);
      expect(inrFormatted).toContain("12,00,000");

      const inrExplicit = formatCurrency(50000, "INR");
      expect(inrExplicit).toContain("50,000");

      const usdFormatted = formatCurrency(75000, "USD");
      expect(usdFormatted).toContain("75,000");

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

  describe("2. Production Contextual Talent Navigation & RBAC Filtering (Blocker 1 & 5)", () => {
    it("filters talent tabs based on exact user permissions", () => {
      // User with recruitment.read only sees Overview and Jobs
      const recruitmentOnly = getVisibleTalentTabs(["recruitment.read"]);
      expect(recruitmentOnly.map((t) => t.label)).toEqual(["Overview", "Jobs"]);
      expect(recruitmentOnly.some((t) => t.label === "Candidates")).toBe(false);
      expect(recruitmentOnly.some((t) => t.label === "Offers")).toBe(false);

      // User with candidates.read sees Candidates
      const candidateUser = getVisibleTalentTabs(["candidates.read"]);
      expect(candidateUser.map((t) => t.label)).toEqual(["Candidates"]);

      // User with applications.read sees Pipeline
      const pipelineUser = getVisibleTalentTabs(["applications.read"]);
      expect(pipelineUser.map((t) => t.label)).toEqual(["Pipeline"]);

      // User with interviews.read sees Interviews
      const interviewUser = getVisibleTalentTabs(["interviews.read"]);
      expect(interviewUser.map((t) => t.label)).toEqual(["Interviews"]);

      // User with offers.read sees Offers
      const offerUser = getVisibleTalentTabs(["offers.read"]);
      expect(offerUser.map((t) => t.label)).toEqual(["Offers"]);

      // Empty permission set sees no protected Talent tabs
      const noPermUser = getVisibleTalentTabs([]);
      expect(noPermUser).toEqual([]);

      // Full HR Admin sees all tabs
      const hrAdmin = getVisibleTalentTabs([
        "recruitment.read",
        "candidates.read",
        "applications.read",
        "interviews.read",
        "offers.read"
      ]);
      expect(hrAdmin.length).toBe(talentTabs.length);
    });

    it("isTalentTabActive calculates exact active state without false subpath collisions", () => {
      expect(isTalentTabActive("/ats", "/ats")).toBe(true);
      expect(isTalentTabActive("/ats", "/ats/jobs")).toBe(false);
      expect(isTalentTabActive("/ats/jobs", "/ats/jobs")).toBe(true);
      expect(isTalentTabActive("/ats/candidates", "/ats/candidates")).toBe(true);
      expect(isTalentTabActive("/ats/candidates", "/ats/candidates/cand-123")).toBe(true);
      expect(isTalentTabActive("/ats/offers", "/ats/pipeline")).toBe(false);
    });
  });

  describe("3. Production Permission Helper Functions (Blocker 2)", () => {
    it("canAccessCandidatePii strictly checks candidates.read", () => {
      expect(canAccessCandidatePii(["recruitment.read"])).toBe(false);
      expect(canAccessCandidatePii(["candidates.read"])).toBe(true);
      expect(canAccessCandidatePii([])).toBe(false);
    });

    it("canAccessCompensation strictly checks offers.read", () => {
      expect(canAccessCompensation(["recruitment.read", "candidates.read"])).toBe(false);
      expect(canAccessCompensation(["offers.read"])).toBe(true);
      expect(canAccessCompensation([])).toBe(false);
    });

    it("canAccessInterviewFeedback strictly checks interviews.feedback", () => {
      expect(canAccessInterviewFeedback(["interviews.read"])).toBe(false);
      expect(canAccessInterviewFeedback(["interviews.feedback"])).toBe(true);
      expect(canAccessInterviewFeedback([])).toBe(false);
    });

    it("canManageRecruitment, canManageApplications, canManageOffers, canManagePreboarding check exact manage permissions", () => {
      expect(canManageRecruitment(["recruitment.manage"])).toBe(true);
      expect(canManageRecruitment(["recruitment.read"])).toBe(false);

      expect(canManageApplications(["applications.manage"])).toBe(true);
      expect(canManageApplications(["applications.read"])).toBe(false);

      expect(canManageOffers(["offers.manage"])).toBe(true);
      expect(canManageOffers(["offers.read"])).toBe(false);

      expect(canManagePreboarding(["preboarding.manage"])).toBe(true);
      expect(canManagePreboarding(["preboarding.read"])).toBe(false);
    });

    it("getAuthorizedCommandRoutes filters Talent command palette routes by user permissions", () => {
      const routesRecruitmentOnly = getAuthorizedCommandRoutes(["recruitment.read"]);
      const titles = routesRecruitmentOnly.map((r) => r.title);
      expect(titles).toContain("Talent Acquisition");
      expect(titles).toContain("Job Requisitions");
      expect(titles).not.toContain("Candidates Database");
      expect(titles).not.toContain("Offer Management");

      const routesCandidatesOnly = getAuthorizedCommandRoutes(["candidates.read"]);
      expect(routesCandidatesOnly.map((r) => r.title)).toContain("Candidates Database");
      expect(routesCandidatesOnly.map((r) => r.title)).not.toContain("Offer Management");
    });
  });

  describe("4. Application Stage Transition Contract (Blocker 3)", () => {
    it("getNextApplicationStage computes sequential next stage from production helper", () => {
      expect(getNextApplicationStage("APPLIED")).toBe("SCREENING");
      expect(getNextApplicationStage("SCREENING")).toBe("TECHNICAL_ROUND");
      expect(getNextApplicationStage("TECHNICAL_ROUND")).toBe("MANAGER_ROUND");
      expect(getNextApplicationStage("MANAGER_ROUND")).toBe("HR_ROUND");
      expect(getNextApplicationStage("HR_ROUND")).toBe("OFFER");
      expect(getNextApplicationStage("OFFER")).toBe("JOINED");
      expect(getNextApplicationStage("JOINED")).toBeNull();
      expect(getNextApplicationStage("REJECTED")).toBeNull();
    });

    it("APPLICATION_STAGES contains exact 8 backend stages", () => {
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
  });
});
