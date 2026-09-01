import { describe, expect, it } from "vitest";
import { WorkforcePlanningEngine } from "../src/modules/workforce/engines/workforce-planning.engine.js";
import { OrgDesignEngine } from "../src/modules/workforce/engines/org-design.engine.js";
import { SkillGapEngine } from "../src/modules/workforce/engines/skill-gap.engine.js";
import { ExecutiveIntelligenceEngine } from "../src/modules/workforce/engines/executive-intelligence.engine.js";
import {
  CreatePositionSchema,
  CreateHeadcountPlanSchema,
  SimulateCostForecastSchema
} from "../src/modules/workforce/workforce.schemas.js";

describe("TASK 28 — Headcount Planning, Org Design & Cost Simulation", () => {
  describe("WorkforcePlanningEngine.simulateHeadcountScenario", () => {
    it("should calculate fully loaded cost delta and onboarding expenses", () => {
      const result = WorkforcePlanningEngine.simulateHeadcountScenario({
        baseHeadcount: 100,
        baseAnnualBudget: 132000000,
        averageAnnualSalaryPerHead: 1000000,
        benefitsRatio: 0.20,
        taxesAndContributionsRatio: 0.12,
        headcountDelta: 20,
        trainingCostPerHire: 25000,
        recruitmentCostPerHire: 50000,
        assetCostPerHire: 75000
      });

      expect(result.projectedHeadcount).toBe(120);
      expect(result.projectedAnnualSalaryCost).toBe(120000000);
      expect(result.oneTimeOnboardingCost).toBe(3000000); // 20 * 150,000
      expect(result.percentageCostChange).toBeGreaterThan(0);
    });

    it("should calculate vacancy and fill rates correctly", () => {
      const result = WorkforcePlanningEngine.calculatePositionMetrics(100, 85);
      expect(result.openCount).toBe(15);
      expect(result.vacancyRatePercent).toBe(15);
      expect(result.fillRatePercent).toBe(85);
    });
  });

  describe("OrgDesignEngine.analyzeHierarchy", () => {
    it("should compute hierarchy layers, spans, and manager ratio", () => {
      const mockNodes = [
        { id: "1", name: "CEO", title: "CEO", reportsToId: null },
        { id: "2", name: "VP Eng", title: "VP", reportsToId: "1" },
        { id: "3", name: "VP Ops", title: "VP", reportsToId: "1" },
        { id: "4", name: "Eng Mgr", title: "Manager", reportsToId: "2" },
        { id: "5", name: "IC 1", title: "Engineer", reportsToId: "4" },
        { id: "6", name: "IC 2", title: "Engineer", reportsToId: "4" }
      ];

      const analysis = OrgDesignEngine.analyzeHierarchy(mockNodes);

      expect(analysis.totalNodes).toBe(6);
      expect(analysis.maxLayers).toBe(4); // CEO (1) -> VP (2) -> Mgr (3) -> IC (4)
      expect(analysis.totalManagers).toBe(3); // CEO, VP Eng, Eng Mgr
      expect(analysis.avgSpanOfControl).toBeGreaterThan(0);
    });
  });

  describe("SkillGapEngine.analyzeSkillSupplyAndDemand", () => {
    it("should identify critical shortages and recommend external hiring", () => {
      const results = SkillGapEngine.analyzeSkillSupplyAndDemand([
        {
          skillId: "sk1",
          skillName: "AI Infrastructure",
          category: "Technical",
          currentProficientCount: 2,
          futureRequiredCount: 10
        }
      ]);

      expect(results[0].gapCount).toBe(8);
      expect(results[0].deficitPercent).toBe(80);
      expect(results[0].urgencyBand).toBe("CRITICAL");
      expect(results[0].recommendedStrategy).toBe("EXTERNAL_HIRE");
    });
  });

  describe("ExecutiveIntelligenceEngine.computeExecutiveTelemetry", () => {
    it("should compute strategic metrics for CEO and CHRO", () => {
      const telemetry = ExecutiveIntelligenceEngine.computeExecutiveTelemetry({
        totalHeadcount: 240,
        totalAnnualRevenue: 768000000,
        totalAnnualWorkforceCost: 204000000,
        openPositionsCount: 28,
        criticalRolesCount: 14,
        successorsCoveredCount: 12,
        highFlightRiskCount: 6,
        annualAttritionRate: 0.112,
        averageTimeToFillDays: 28,
        learningHoursPerEmployee: 24.5
      });

      expect(telemetry.revenuePerEmployee).toBe(3200000);
      expect(telemetry.workforceCostRatioPercent).toBeGreaterThan(20);
      expect(telemetry.successionCoverageRatePercent).toBeGreaterThan(70);
      expect(telemetry.chroSummary.benchStrengthHealth).toBe("HEALTHY");
    });
  });

  describe("Zod Schemas Validation", () => {
    it("should parse CreatePositionSchema", () => {
      const parsed = CreatePositionSchema.parse({
        positionCode: "ENG-L5-LEAD",
        title: "Staff Engineer",
        approvedHeadcount: 2,
        isCriticalRole: true,
        budgetedAnnualCost: 3500000
      });

      expect(parsed.positionCode).toBe("ENG-L5-LEAD");
      expect(parsed.isCriticalRole).toBe(true);
    });

    it("should parse CreateHeadcountPlanSchema", () => {
      const parsed = CreateHeadcountPlanSchema.parse({
        name: "FY27 Master Plan",
        fiscalYear: 2027,
        currentHeadcount: 240,
        approvedHeadcount: 280
      });

      expect(parsed.fiscalYear).toBe(2027);
    });

    it("should parse SimulateCostForecastSchema", () => {
      const parsed = SimulateCostForecastSchema.parse({
        baseHeadcount: 240,
        averageAnnualSalaryPerHead: 850000,
        headcountDelta: 25
      });

      expect(parsed.headcountDelta).toBe(25);
    });
  });
});
