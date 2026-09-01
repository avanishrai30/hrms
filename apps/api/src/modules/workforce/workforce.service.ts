import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import { WorkforcePlanningEngine } from "./engines/workforce-planning.engine.js";
import { OrgDesignEngine } from "./engines/org-design.engine.js";
import { SuccessionEngine } from "./engines/succession.engine.js";
import { BenchStrengthEngine } from "./engines/bench-strength.engine.js";
import { AttritionEngine } from "./engines/attrition.engine.js";
import { WorkforceForecastingEngine } from "./engines/forecasting.engine.js";
import { ExecutiveIntelligenceEngine } from "./engines/executive-intelligence.engine.js";
import type {
  CreatePositionSchema,
  UpdatePositionSchema,
  AssignPositionSchema,
  CreateHeadcountPlanSchema,
  CreateHeadcountScenarioSchema,
  SimulateCostForecastSchema,
  CreateOrgVersionSchema,
  AssessAttritionRiskSchema,
  CreateSkillForecastSchema
} from "./workforce.schemas.js";
import { z } from "zod";
import type { PositionLifecycleStatus, Prisma } from "@prisma/client";

@Injectable()
export class WorkforceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  // ==========================================
  // 1. POSITION MANAGEMENT
  // ==========================================

  async listPositions(
    tenantId: string,
    filters?: {
      departmentId?: string;
      status?: string;
      isCriticalRole?: boolean;
      search?: string;
    }
  ) {
    return this.prisma.position.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
        ...(filters?.status ? { status: filters.status as PositionLifecycleStatus } : {}),
        ...(filters?.isCriticalRole !== undefined ? { isCriticalRole: filters.isCriticalRole } : {}),
        ...(filters?.search
          ? {
              OR: [
                { title: { contains: filters.search, mode: "insensitive" } },
                { positionCode: { contains: filters.search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: {
        department: true,
        businessUnit: true,
        reportsToPosition: true,
        assignments: {
          include: {
            employee: {
              select: { id: true, fullName: true, employeeCode: true, email: true }
            }
          }
        },
        _count: { select: { childPositions: true } }
      },
      orderBy: { positionCode: "asc" }
    });
  }

  async getPosition(tenantId: string, id: string) {
    const position = await this.prisma.position.findFirst({
      where: { tenantId, id, deletedAt: null },
      include: {
        department: true,
        businessUnit: true,
        reportsToPosition: true,
        childPositions: true,
        assignments: {
          include: { employee: true }
        }
      }
    });
    if (!position) {
      throw new NotFoundException(`Position not found: ${id}`);
    }
    return position;
  }

  async createPosition(
    tenantId: string,
    dto: z.infer<typeof CreatePositionSchema>,
    userId: string,
    membershipId: string
  ) {
    const existing = await this.prisma.position.findFirst({
      where: { tenantId, positionCode: dto.positionCode, deletedAt: null }
    });
    if (existing) {
      throw new BadRequestException(`Position code '${dto.positionCode}' already exists.`);
    }

    const position = await this.prisma.position.create({
      data: {
        tenantId,
        positionCode: dto.positionCode,
        title: dto.title,
        departmentId: dto.departmentId,
        businessUnitId: dto.businessUnitId,
        grade: dto.grade,
        level: dto.level,
        reportsToPositionId: dto.reportsToPositionId,
        employmentType: dto.employmentType,
        isCriticalRole: dto.isCriticalRole,
        approvedHeadcount: dto.approvedHeadcount,
        openHeadcount: dto.approvedHeadcount,
        budgetedAnnualCost: dto.budgetedAnnualCost,
        currency: dto.currency,
        status: "ACTIVE"
      },
      include: { department: true }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_POSITION_CREATED",
      resourceType: "Position",
      resourceId: position.id,
      metadata: { positionCode: dto.positionCode, title: dto.title }
    });

    return position;
  }

  async updatePosition(
    tenantId: string,
    id: string,
    dto: z.infer<typeof UpdatePositionSchema>,
    userId: string,
    membershipId: string
  ) {
    const position = await this.prisma.position.findFirst({
      where: { tenantId, id, deletedAt: null }
    });
    if (!position) {
      throw new NotFoundException(`Position not found: ${id}`);
    }

    const updated = await this.prisma.position.update({
      where: { id },
      data: {
        title: dto.title,
        departmentId: dto.departmentId,
        businessUnitId: dto.businessUnitId,
        grade: dto.grade,
        level: dto.level,
        reportsToPositionId: dto.reportsToPositionId,
        employmentType: dto.employmentType,
        isCriticalRole: dto.isCriticalRole,
        approvedHeadcount: dto.approvedHeadcount,
        budgetedAnnualCost: dto.budgetedAnnualCost,
        status: dto.status
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_POSITION_UPDATED",
      resourceType: "Position",
      resourceId: updated.id,
      metadata: { positionCode: updated.positionCode }
    });

    return updated;
  }

  async freezePosition(tenantId: string, id: string, userId: string, membershipId: string) {
    const position = await this.prisma.position.findFirst({
      where: { tenantId, id, deletedAt: null }
    });
    if (!position) {
      throw new NotFoundException(`Position not found: ${id}`);
    }

    const updated = await this.prisma.position.update({
      where: { id },
      data: { status: "FROZEN", frozenAt: new Date() }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_POSITION_FROZEN",
      resourceType: "Position",
      resourceId: updated.id,
      metadata: { positionCode: updated.positionCode }
    });

    return updated;
  }

  async closePosition(tenantId: string, id: string, userId: string, membershipId: string) {
    const position = await this.prisma.position.findFirst({
      where: { tenantId, id, deletedAt: null }
    });
    if (!position) {
      throw new NotFoundException(`Position not found: ${id}`);
    }

    const updated = await this.prisma.position.update({
      where: { id },
      data: { status: "CLOSED", closedAt: new Date(), openHeadcount: 0 }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_POSITION_CLOSED",
      resourceType: "Position",
      resourceId: updated.id,
      metadata: { positionCode: updated.positionCode }
    });

    return updated;
  }

  async assignPosition(
    tenantId: string,
    dto: z.infer<typeof AssignPositionSchema>,
    userId: string,
    membershipId: string
  ) {
    const assignment = await this.prisma.positionAssignment.create({
      data: {
        tenantId,
        positionId: dto.positionId,
        employeeId: dto.employeeId,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        isPrimary: dto.isPrimary
      },
      include: { position: true, employee: true }
    });

    // Update filled and open counts
    const filledCount = await this.prisma.positionAssignment.count({
      where: { tenantId, positionId: dto.positionId, endDate: null }
    });

    await this.prisma.position.update({
      where: { id: dto.positionId },
      data: {
        filledHeadcount: filledCount,
        openHeadcount: Math.max(0, assignment.position.approvedHeadcount - filledCount)
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_POSITION_ASSIGNED",
      resourceType: "PositionAssignment",
      resourceId: assignment.id,
      metadata: { positionId: dto.positionId, employeeId: dto.employeeId }
    });

    return assignment;
  }

  // ==========================================
  // 2. HEADCOUNT PLANNING & SCENARIOS
  // ==========================================

  async listHeadcountPlans(tenantId: string) {
    return this.prisma.headcountPlan.findMany({
      where: { tenantId },
      include: {
        department: true,
        businessUnit: true,
        location: true,
        scenarios: true,
        _count: { select: { scenarios: true } }
      },
      orderBy: { fiscalYear: "desc" }
    });
  }

  async createHeadcountPlan(
    tenantId: string,
    dto: z.infer<typeof CreateHeadcountPlanSchema>,
    userId: string,
    membershipId: string
  ) {
    const vacancyHeadcount = Math.max(0, dto.approvedHeadcount - dto.currentHeadcount);

    const plan = await this.prisma.headcountPlan.create({
      data: {
        tenantId,
        name: dto.name,
        fiscalYear: dto.fiscalYear,
        periodType: dto.periodType,
        departmentId: dto.departmentId,
        businessUnitId: dto.businessUnitId,
        locationId: dto.locationId,
        currentHeadcount: dto.currentHeadcount,
        approvedHeadcount: dto.approvedHeadcount,
        forecastHeadcount: dto.forecastHeadcount,
        budgetHeadcount: dto.budgetHeadcount,
        vacancyHeadcount
      },
      include: { department: true }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_HEADCOUNT_PLAN_CREATED",
      resourceType: "HeadcountPlan",
      resourceId: plan.id,
      metadata: { name: dto.name, fiscalYear: dto.fiscalYear }
    });

    return plan;
  }

  async createHeadcountScenario(
    tenantId: string,
    dto: z.infer<typeof CreateHeadcountScenarioSchema>,
    userId: string,
    membershipId: string
  ) {
    const scenario = await this.prisma.headcountScenario.create({
      data: {
        tenantId,
        planId: dto.planId,
        name: dto.name,
        description: dto.description,
        growthCase: dto.growthCase,
        headcountDelta: dto.headcountDelta,
        budgetDelta: dto.budgetDelta,
        scenarioCost: dto.scenarioCost,
        impactSummary: dto.impactSummary
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_SCENARIO_CREATED",
      resourceType: "HeadcountScenario",
      resourceId: scenario.id,
      metadata: { name: dto.name, delta: dto.headcountDelta }
    });

    return scenario;
  }

  // ==========================================
  // 3. WORKFORCE COST PLANNING
  // ==========================================

  simulateCost(dto: z.infer<typeof SimulateCostForecastSchema>) {
    return WorkforcePlanningEngine.simulateHeadcountScenario(dto);
  }

  // ==========================================
  // 4. ORG DESIGN & ORG CHART
  // ==========================================

  async getOrgChart(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        email: true,
        managerEmployeeId: true,
        department: { select: { name: true } },
        designation: { select: { name: true } }
      }
    });

    const nodes = employees.map((e) => ({
      id: e.id,
      name: e.fullName,
      title: e.designation?.name ?? "Specialist",
      reportsToId: e.managerEmployeeId,
      departmentName: e.department?.name ?? "General"
    }));

    const analysis = OrgDesignEngine.analyzeHierarchy(nodes);

    return {
      nodes,
      analysis
    };
  }

  async createOrgStructureVersion(
    tenantId: string,
    dto: z.infer<typeof CreateOrgVersionSchema>,
    userId: string,
    membershipId: string
  ) {
    const { analysis } = await this.getOrgChart(tenantId);

    const version = await this.prisma.orgStructureVersion.create({
      data: {
        tenantId,
        versionName: dto.versionName,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
        totalNodes: analysis.totalNodes,
        maxLayers: analysis.maxLayers,
        avgSpanOfControl: analysis.avgSpanOfControl,
        complexityScore: analysis.complexityScore,
        snapshotData: dto.snapshotData as Prisma.InputJsonValue,
        createdByUserId: userId
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_ORG_VERSION_SAVED",
      resourceType: "OrgStructureVersion",
      resourceId: version.id,
      metadata: { versionName: dto.versionName, totalNodes: analysis.totalNodes }
    });

    return version;
  }

  // ==========================================
  // 5. SUCCESSION PLANNING & BENCH STRENGTH
  // ==========================================

  async calculateSuccessorReadiness(
    performanceRating: number,
    potentialRating: number,
    competencyScorePercent: number,
    certificationsCompletedRatio: number,
    managerAssessmentRating: number
  ) {
    return SuccessionEngine.calculateSuccessorReadiness({
      performanceRating,
      potentialRating,
      competencyScorePercent,
      certificationsCompletedRatio,
      managerAssessmentRating
    });
  }

  async getBenchStrengthReport(tenantId: string) {
    const criticalPositions = await this.prisma.successionPosition.findMany({
      where: { tenantId },
      include: {
        designation: true,
        successors: {
          include: { employee: true }
        }
      }
    });

    const evaluations = criticalPositions.map((pos) => {
      const benchInput = {
        positionId: pos.id,
        positionTitle: pos.title,
        isCritical: pos.criticality === "HIGH" || pos.criticality === "CRITICAL",
        successors: pos.successors.map((s) => ({
          successorId: s.id,
          readinessBand: (s.readiness === "READY_NOW"
            ? "READY_NOW"
            : s.readiness === "READY_IN_1_YEAR"
            ? "READY_1_YEAR"
            : s.readiness === "READY_IN_2_YEARS"
            ? "READY_2_YEARS"
            : "FUTURE_TALENT") as "READY_NOW" | "READY_1_YEAR" | "READY_2_YEARS" | "FUTURE_TALENT",
          readinessScore: s.readiness === "READY_NOW" ? 90 : s.readiness === "READY_IN_1_YEAR" ? 75 : 55,
          flightRisk: (s.flightRisk === "CRITICAL"
            ? "CRITICAL"
            : s.flightRisk === "HIGH"
            ? "HIGH"
            : s.flightRisk === "MEDIUM"
            ? "MEDIUM"
            : "LOW") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
        }))
      };

      return BenchStrengthEngine.evaluatePositionBench(benchInput);
    });

    const greenCount = evaluations.filter((e) => e.ragStatus === "GREEN").length;
    const yellowCount = evaluations.filter((e) => e.ragStatus === "YELLOW").length;
    const redCount = evaluations.filter((e) => e.ragStatus === "RED").length;

    return {
      totalCriticalRoles: evaluations.length,
      greenCount,
      yellowCount,
      redCount,
      overallBenchHealth: greenCount >= redCount ? "HEALTHY" : "NEEDS_ATTENTION",
      evaluations
    };
  }

  // ==========================================
  // 6. ATTRITION PREDICTION ENGINE
  // ==========================================

  async assessEmployeeAttritionRisk(
    tenantId: string,
    dto: z.infer<typeof AssessAttritionRiskSchema>,
    userId: string,
    membershipId: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId, id: dto.employeeId, status: "ACTIVE" }
    });
    if (!employee) {
      throw new NotFoundException(`Active employee not found: ${dto.employeeId}`);
    }

    const result = AttritionEngine.evaluateAttritionRisk({
      tenureMonths: dto.tenureMonths,
      monthsSinceLastPromotion: dto.monthsSinceLastPromotion,
      monthsSinceLastSalaryIncrement: dto.monthsSinceLastSalaryIncrement,
      compensationCompaRatio: dto.compensationCompaRatio,
      recentPerformanceRating: dto.recentPerformanceRating,
      leaveSpikeLast90Days: dto.leaveSpikeLast90Days,
      attendanceIrregularityRate: dto.attendanceIrregularityRate,
      lmsEngagementScore: dto.lmsEngagementScore,
      managerChangesLast12Months: dto.managerChangesLast12Months
    });

    const assessment = await this.prisma.attritionRiskAssessment.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        riskScore: result.riskScore,
        riskCategory: result.riskCategory,
        primaryDrivers: result.primaryDrivers,
        mitigatingFactors: result.mitigatingFactors,
        recommendedActions: result.recommendedActions
      },
      include: { employee: true }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "WORKFORCE_ATTRITION_ASSESSED",
      resourceType: "AttritionRiskAssessment",
      resourceId: assessment.id,
      metadata: {
        employeeId: dto.employeeId,
        riskScore: result.riskScore,
        riskCategory: result.riskCategory
      }
    });

    return assessment;
  }

  async listAttritionAssessments(tenantId: string) {
    return this.prisma.attritionRiskAssessment.findMany({
      where: { tenantId },
      include: {
        employee: {
          select: { id: true, fullName: true, employeeCode: true, department: true }
        }
      },
      orderBy: { riskScore: "desc" }
    });
  }

  // ==========================================
  // 7. SKILL SUPPLY & DEMAND INTELLIGENCE
  // ==========================================

  async listSkillSupplyDemand(tenantId: string) {
    return this.prisma.skillSupplyDemandForecast.findMany({
      where: { tenantId },
      orderBy: { deficitPercent: "desc" }
    });
  }

  async createSkillForecast(tenantId: string, dto: z.infer<typeof CreateSkillForecastSchema>) {
    const gapCount = Math.max(0, dto.futureDemandCount - dto.currentSupplyCount);
    const deficitPercent =
      dto.futureDemandCount > 0
        ? Math.round((gapCount / dto.futureDemandCount) * 1000) / 10
        : 0;

    return this.prisma.skillSupplyDemandForecast.create({
      data: {
        tenantId,
        skillId: dto.skillId,
        skillName: dto.skillName,
        category: dto.category,
        currentSupplyCount: dto.currentSupplyCount,
        futureDemandCount: dto.futureDemandCount,
        gapCount,
        deficitPercent,
        targetHorizonMonths: dto.targetHorizonMonths,
        recommendedTrainingTrack: dto.recommendedTrainingTrack
      }
    });
  }

  // ==========================================
  // 8. FORECASTING & EXECUTIVE TELEMETRY
  // ==========================================

  getWorkforceForecast(currentHeadcount: number, baseAnnualCostPerHead: number) {
    return WorkforceForecastingEngine.generateScenarioTriad(
      currentHeadcount,
      baseAnnualCostPerHead
    );
  }

  async getExecutiveTelemetry(tenantId: string) {
    const [
      totalHeadcount,
      openPositionsCount,
      criticalRolesCount,
      highFlightRiskCount
    ] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.position.count({ where: { tenantId, status: "ACTIVE", openHeadcount: { gt: 0 } } }),
      this.prisma.successionPosition.count({ where: { tenantId } }),
      this.prisma.attritionRiskAssessment.count({
        where: { tenantId, riskCategory: { in: ["HIGH", "CRITICAL"] } }
      })
    ]);

    const successorsCoveredCount = await this.prisma.successionPosition.count({
      where: {
        tenantId,
        successors: { some: { readiness: "READY_NOW" } }
      }
    });

    const averageSalaryEstimate = 850000;
    const totalAnnualWorkforceCost = totalHeadcount * averageSalaryEstimate;
    const totalAnnualRevenue = totalHeadcount * 3200000; // Estimated 3.2M INR revenue per IC

    return ExecutiveIntelligenceEngine.computeExecutiveTelemetry({
      totalHeadcount: Math.max(1, totalHeadcount),
      totalAnnualRevenue,
      totalAnnualWorkforceCost,
      openPositionsCount,
      criticalRolesCount: Math.max(1, criticalRolesCount),
      successorsCoveredCount,
      highFlightRiskCount,
      annualAttritionRate: 0.115,
      averageTimeToFillDays: 28,
      learningHoursPerEmployee: 24.5
    });
  }
}
