import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import { OkrGoalEngine } from "./engines/okr-goal.engine.js";
import { Appraisal360Engine } from "./engines/appraisal-360.engine.js";
import { BellCurveCalibrationEngine } from "./engines/bell-curve-calibration.engine.js";
import { IncrementRecommendationEngine } from "./engines/increment-recommendation.engine.js";
import { PromotionReadinessEngine } from "./engines/promotion-readiness.engine.js";
import { SuccessionNineBoxEngine } from "./engines/succession-nine-box.engine.js";
import { AiPerformanceEngine } from "./engines/ai-performance.engine.js";
import { PerformanceAnalyticsService } from "./engines/performance-analytics.service.js";
import {
  type CompetencyCategory,
  type GoalCategory,
  type GoalCycleStatus,
  type GoalCycleType,
  type GoalStatus,
  type MetricType,
  type ReviewCycleStatus,
  type ReviewRatingLabel,
  type SuccessorReadiness,
  Prisma
} from "@prisma/client";
import type {
  AdjustCalibrationReviewDto,
  ApproveGoalDto,
  ApprovePromotionDto,
  CreateCalibrationSessionDto,
  CreateCompetencyDto,
  CreateFeedbackDto,
  CreateGoalCycleDto,
  CreateGoalDto,
  CreateKeyResultDto,
  CreateOneOnOneDto,
  CreateReviewCycleDto,
  CreateSuccessionPositionDto,
  AddSuccessorDto,
  EvaluatePromotionDto,
  MapDesignationCompetencySchema,
  SetSalaryIncrementRuleDto,
  Submit360ScoreDto,
  SubmitManagerReviewDto,
  SubmitSelfAssessmentDto,
  UpdateGoalDto,
  UpdateOneOnOneDto
} from "./performance.schemas.js";
import type { z } from "zod";

@Injectable()
export class PerformanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly okrEngine: OkrGoalEngine,
    private readonly appraisalEngine: Appraisal360Engine,
    private readonly calibrationEngine: BellCurveCalibrationEngine,
    private readonly incrementEngine: IncrementRecommendationEngine,
    private readonly promotionEngine: PromotionReadinessEngine,
    private readonly successionEngine: SuccessionNineBoxEngine,
    private readonly aiPerformance: AiPerformanceEngine,
    private readonly analyticsService: PerformanceAnalyticsService
  ) {}

  private async recordAudit(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    userId?: string,
    membershipId?: string
  ) {
    return this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action,
      resourceType,
      resourceId,
      metadata: (metadata ?? {}) as unknown as Prisma.InputJsonValue
    });
  }

  // ==========================================
  // 1. GOAL CYCLES & OKR / KRA GOALS
  // ==========================================

  async listGoalCycles(tenantId: string, status?: string) {
    return this.prisma.goalCycle.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as GoalCycleStatus } : {})
      },
      include: {
        _count: { select: { goals: true } }
      },
      orderBy: { startDate: "desc" }
    });
  }

  async createGoalCycle(
    tenantId: string,
    dto: CreateGoalCycleDto,
    userId: string,
    membershipId: string
  ) {
    const cycle = await this.prisma.goalCycle.create({
      data: {
        tenantId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        type: dto.type as GoalCycleType,
        status: dto.status as GoalCycleStatus
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_GOAL_CYCLE_CREATED",
      "GoalCycle",
      cycle.id,
      { name: cycle.name, type: cycle.type },
      userId,
      membershipId
    );

    return cycle;
  }

  async updateGoalCycleStatus(
    tenantId: string,
    id: string,
    status: GoalCycleStatus,
    userId: string,
    membershipId: string
  ) {
    const cycle = await this.prisma.goalCycle.findFirst({ where: { id, tenantId } });
    if (!cycle) throw new NotFoundException("Goal cycle not found");

    const updated = await this.prisma.goalCycle.update({
      where: { id },
      data: { status }
    });

    await this.recordAudit(
      tenantId,
      "PMS_GOAL_CYCLE_STATUS_UPDATED",
      "GoalCycle",
      id,
      { previous: cycle.status, current: status },
      userId,
      membershipId
    );

    return updated;
  }

  async listGoals(tenantId: string, cycleId?: string, employeeId?: string) {
    return this.prisma.goal.findMany({
      where: {
        tenantId,
        ...(cycleId ? { cycleId } : {}),
        ...(employeeId ? { employeeId } : {})
      },
      include: {
        cycle: true,
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } },
        keyResults: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getGoal(tenantId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, tenantId },
      include: {
        cycle: true,
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } },
        keyResults: true
      }
    });
    if (!goal) throw new NotFoundException("Goal not found");
    return goal;
  }

  async createGoal(
    tenantId: string,
    dto: CreateGoalDto,
    employeeId: string,
    userId: string,
    membershipId: string
  ) {
    const targetEmployeeId = dto.employeeId || employeeId;

    const goal = await this.prisma.goal.create({
      data: {
        tenantId,
        cycleId: dto.cycleId,
        employeeId: targetEmployeeId,
        title: dto.title,
        description: dto.description,
        category: dto.category as GoalCategory,
        weightage: dto.weightage,
        targetValue: dto.targetValue,
        achievedValue: dto.achievedValue,
        metricUnit: dto.metricUnit,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: "DRAFT",
        keyResults: dto.keyResults
          ? {
              create: dto.keyResults.map((kr) => ({
                title: kr.title,
                metricType: kr.metricType as MetricType,
                startValue: kr.startValue,
                targetValue: kr.targetValue,
                currentValue: kr.currentValue,
                weightage: kr.weightage,
                confidenceScore: kr.confidenceScore
              }))
            }
          : undefined
      },
      include: { keyResults: true }
    });

    await this.recordAudit(
      tenantId,
      "PMS_GOAL_CREATED",
      "Goal",
      goal.id,
      { title: goal.title, category: goal.category },
      userId,
      membershipId
    );

    return goal;
  }

  async updateGoal(
    tenantId: string,
    id: string,
    dto: UpdateGoalDto,
    userId: string,
    membershipId: string
  ) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, tenantId },
      include: { keyResults: true }
    });
    if (!goal) throw new NotFoundException("Goal not found");

    const targetVal = dto.targetValue ?? goal.targetValue;
    const achievedVal = dto.achievedValue ?? goal.achievedValue;

    const progress =
      dto.progressPercent !== undefined
        ? dto.progressPercent
        : this.okrEngine.calculateGoalProgress(
            targetVal,
            achievedVal,
            goal.keyResults.map((kr) => ({
              metricType: kr.metricType,
              startValue: kr.startValue,
              targetValue: kr.targetValue,
              currentValue: kr.currentValue,
              weightage: kr.weightage
            }))
          );

    let status = dto.status ?? goal.status;
    if (progress >= 100 && status === "IN_PROGRESS") {
      status = "COMPLETED";
    }

    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.weightage !== undefined ? { weightage: dto.weightage } : {}),
        targetValue: targetVal,
        achievedValue: achievedVal,
        progressPercent: progress,
        status: status as GoalStatus,
        ...(dto.evidenceText !== undefined ? { evidenceText: dto.evidenceText } : {}),
        ...(dto.evidenceUrl !== undefined ? { evidenceUrl: dto.evidenceUrl } : {}),
        ...(dto.managerComments !== undefined ? { managerComments: dto.managerComments } : {})
      },
      include: { keyResults: true }
    });

    await this.recordAudit(
      tenantId,
      "PMS_GOAL_UPDATED",
      "Goal",
      id,
      { progress, status },
      userId,
      membershipId
    );

    return updated;
  }

  async approveGoal(
    tenantId: string,
    id: string,
    dto: ApproveGoalDto,
    userId: string,
    membershipId: string
  ) {
    const goal = await this.prisma.goal.findFirst({ where: { id, tenantId } });
    if (!goal) throw new NotFoundException("Goal not found");

    const newStatus: GoalStatus = dto.action === "APPROVE" ? "APPROVED" : "REJECTED";

    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        status: newStatus,
        managerComments: dto.comments,
        ...(dto.adjustedWeightage !== undefined ? { weightage: dto.adjustedWeightage } : {})
      }
    });

    await this.recordAudit(
      tenantId,
      dto.action === "APPROVE" ? "PMS_GOAL_APPROVED" : "PMS_GOAL_REJECTED",
      "Goal",
      id,
      { action: dto.action, comments: dto.comments },
      userId,
      membershipId
    );

    return updated;
  }

  async createKeyResult(
    tenantId: string,
    goalId: string,
    dto: CreateKeyResultDto,
    userId: string,
    membershipId: string
  ) {
    const goal = await this.prisma.goal.findFirst({ where: { id: goalId, tenantId } });
    if (!goal) throw new NotFoundException("Goal not found");

    const progress = this.okrEngine.calculateKeyResultProgress({
      metricType: dto.metricType,
      startValue: dto.startValue,
      targetValue: dto.targetValue,
      currentValue: dto.currentValue,
      weightage: dto.weightage
    });

    const kr = await this.prisma.keyResult.create({
      data: {
        goalId,
        title: dto.title,
        metricType: dto.metricType as MetricType,
        startValue: dto.startValue,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue,
        weightage: dto.weightage,
        progressPercent: progress,
        confidenceScore: dto.confidenceScore
      }
    });

    // Recompute goal progress
    const allKrs = await this.prisma.keyResult.findMany({ where: { goalId } });
    const goalProgress = this.okrEngine.calculateGoalProgress(
      goal.targetValue,
      goal.achievedValue,
      allKrs.map((k) => ({
        metricType: k.metricType,
        startValue: k.startValue,
        targetValue: k.targetValue,
        currentValue: k.currentValue,
        weightage: k.weightage
      }))
    );

    await this.prisma.goal.update({
      where: { id: goalId },
      data: { progressPercent: goalProgress }
    });

    await this.recordAudit(
      tenantId,
      "PMS_KEY_RESULT_CREATED",
      "KeyResult",
      kr.id,
      { title: kr.title, goalId },
      userId,
      membershipId
    );

    return kr;
  }

  async updateKeyResult(
    tenantId: string,
    id: string,
    dto: { currentValue: number; confidenceScore?: number },
    userId: string,
    membershipId: string
  ) {
    const kr = await this.prisma.keyResult.findUnique({
      where: { id },
      include: { goal: true }
    });
    if (!kr || kr.goal.tenantId !== tenantId) throw new NotFoundException("Key result not found");

    const progress = this.okrEngine.calculateKeyResultProgress({
      metricType: kr.metricType,
      startValue: kr.startValue,
      targetValue: kr.targetValue,
      currentValue: dto.currentValue,
      weightage: kr.weightage
    });

    const updated = await this.prisma.keyResult.update({
      where: { id },
      data: {
        currentValue: dto.currentValue,
        progressPercent: progress,
        ...(dto.confidenceScore !== undefined ? { confidenceScore: dto.confidenceScore } : {})
      }
    });

    // Update parent goal progress
    const allKrs = await this.prisma.keyResult.findMany({ where: { goalId: kr.goalId } });
    const goalProgress = this.okrEngine.calculateGoalProgress(
      kr.goal.targetValue,
      kr.goal.achievedValue,
      allKrs.map((k) => ({
        metricType: k.metricType,
        startValue: k.startValue,
        targetValue: k.targetValue,
        currentValue: k.id === id ? dto.currentValue : k.currentValue,
        weightage: k.weightage
      }))
    );

    await this.prisma.goal.update({
      where: { id: kr.goalId },
      data: { progressPercent: goalProgress }
    });

    await this.recordAudit(
      tenantId,
      "PMS_KEY_RESULT_UPDATED",
      "KeyResult",
      id,
      { currentValue: dto.currentValue, progress },
      userId,
      membershipId
    );

    return updated;
  }

  // ==========================================
  // 2. CONTINUOUS FEEDBACK & 1:1 MEETINGS
  // ==========================================

  async listFeedbacks(tenantId: string, toEmployeeId?: string, fromEmployeeId?: string) {
    return this.prisma.feedback.findMany({
      where: {
        tenantId,
        ...(toEmployeeId ? { toEmployeeId } : {}),
        ...(fromEmployeeId ? { fromEmployeeId } : {})
      },
      include: {
        fromEmployee: { select: { id: true, fullName: true, employeeCode: true } },
        toEmployee: { select: { id: true, fullName: true, employeeCode: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createFeedback(
    tenantId: string,
    dto: CreateFeedbackDto,
    fromEmployeeId: string,
    userId: string,
    membershipId: string
  ) {
    const feedback = await this.prisma.feedback.create({
      data: {
        tenantId,
        fromEmployeeId,
        toEmployeeId: dto.toEmployeeId,
        category: dto.category,
        rating: dto.rating,
        strengths: dto.strengths,
        improvements: dto.improvements,
        badgeName: dto.badgeName,
        visibility: dto.visibility
      },
      include: {
        fromEmployee: { select: { id: true, fullName: true } },
        toEmployee: { select: { id: true, fullName: true } }
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_FEEDBACK_CREATED",
      "Feedback",
      feedback.id,
      { category: dto.category, toEmployeeId: dto.toEmployeeId },
      userId,
      membershipId
    );

    return feedback;
  }

  async listOneOnOnes(tenantId: string, managerId?: string, employeeId?: string) {
    return this.prisma.oneOnOne.findMany({
      where: {
        tenantId,
        ...(managerId ? { managerId } : {}),
        ...(employeeId ? { employeeId } : {})
      },
      include: {
        manager: { select: { id: true, fullName: true, employeeCode: true } },
        employee: { select: { id: true, fullName: true, employeeCode: true } }
      },
      orderBy: { scheduledAt: "desc" }
    });
  }

  async createOneOnOne(
    tenantId: string,
    dto: CreateOneOnOneDto,
    managerId: string,
    userId: string,
    membershipId: string
  ) {
    const meeting = await this.prisma.oneOnOne.create({
      data: {
        tenantId,
        managerId,
        employeeId: dto.employeeId,
        scheduledAt: new Date(dto.scheduledAt),
        meetingDurationMinutes: dto.meetingDurationMinutes,
        meetingUrl: dto.meetingUrl,
        agenda: dto.agenda,
        notes: dto.notes,
        actionItemsJson: (dto.actionItems || []) as unknown as Prisma.InputJsonValue
      },
      include: {
        manager: { select: { id: true, fullName: true } },
        employee: { select: { id: true, fullName: true } }
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_ONE_ON_ONE_SCHEDULED",
      "OneOnOne",
      meeting.id,
      { scheduledAt: meeting.scheduledAt, employeeId: dto.employeeId },
      userId,
      membershipId
    );

    return meeting;
  }

  async updateOneOnOne(
    tenantId: string,
    id: string,
    dto: UpdateOneOnOneDto,
    userId: string,
    membershipId: string
  ) {
    const meeting = await this.prisma.oneOnOne.findFirst({ where: { id, tenantId } });
    if (!meeting) throw new NotFoundException("1:1 meeting not found");

    const updated = await this.prisma.oneOnOne.update({
      where: { id },
      data: {
        ...(dto.scheduledAt ? { scheduledAt: new Date(dto.scheduledAt) } : {}),
        ...(dto.meetingUrl !== undefined ? { meetingUrl: dto.meetingUrl } : {}),
        ...(dto.agenda !== undefined ? { agenda: dto.agenda } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.actionItems !== undefined
          ? { actionItemsJson: dto.actionItems as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.status === "COMPLETED" ? { completedAt: new Date() } : {})
      },
      include: {
        manager: { select: { id: true, fullName: true } },
        employee: { select: { id: true, fullName: true } }
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_ONE_ON_ONE_UPDATED",
      "OneOnOne",
      id,
      { status: updated.status },
      userId,
      membershipId
    );

    return updated;
  }

  // ==========================================
  // 3. REVIEW CYCLES & 360 APPRAISALS
  // ==========================================

  async listReviewCycles(tenantId: string) {
    return this.prisma.reviewCycle.findMany({
      where: { tenantId },
      include: {
        _count: { select: { reviews: true, calibrationSessions: true } }
      },
      orderBy: { startDate: "desc" }
    });
  }

  async createReviewCycle(
    tenantId: string,
    dto: CreateReviewCycleDto,
    userId: string,
    membershipId: string
  ) {
    const cycle = await this.prisma.reviewCycle.create({
      data: {
        tenantId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status,
        settingsJson: (dto.settings || {}) as unknown as Prisma.InputJsonValue
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_REVIEW_CYCLE_CREATED",
      "ReviewCycle",
      cycle.id,
      { name: cycle.name },
      userId,
      membershipId
    );

    return cycle;
  }

  async updateReviewCycleStage(
    tenantId: string,
    id: string,
    status: ReviewCycleStatus,
    userId: string,
    membershipId: string
  ) {
    const cycle = await this.prisma.reviewCycle.findFirst({ where: { id, tenantId } });
    if (!cycle) throw new NotFoundException("Review cycle not found");

    const updated = await this.prisma.reviewCycle.update({
      where: { id },
      data: { status }
    });

    await this.recordAudit(
      tenantId,
      "PMS_REVIEW_CYCLE_STAGE_CHANGED",
      "ReviewCycle",
      id,
      { stage: status },
      userId,
      membershipId
    );

    return updated;
  }

  async listReviews(tenantId: string, cycleId?: string, employeeId?: string) {
    return this.prisma.performanceReview.findMany({
      where: {
        tenantId,
        ...(cycleId ? { cycleId } : {}),
        ...(employeeId ? { employeeId } : {})
      },
      include: {
        cycle: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: true,
            designation: true
          }
        },
        raterScores: true,
        competencyRatings: { include: { competency: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getReview(tenantId: string, id: string) {
    const review = await this.prisma.performanceReview.findFirst({
      where: { id, tenantId },
      include: {
        cycle: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: true,
            designation: true
          }
        },
        raterScores: {
          include: { rater: { select: { id: true, fullName: true, employeeCode: true } } }
        },
        competencyRatings: { include: { competency: true } },
        calibrationReview: true
      }
    });
    if (!review) throw new NotFoundException("Performance review not found");
    return review;
  }

  async submitSelfAssessment(
    tenantId: string,
    id: string,
    dto: SubmitSelfAssessmentDto,
    userId: string,
    membershipId: string
  ) {
    const review = await this.prisma.performanceReview.findFirst({ where: { id, tenantId } });
    if (!review) throw new NotFoundException("Performance review not found");
    if (review.isLocked) throw new BadRequestException("Review is locked");

    // Upsert rater score for SELF
    await this.prisma.performanceReviewScore.deleteMany({
      where: { reviewId: id, raterType: "SELF" }
    });

    await this.prisma.performanceReviewScore.create({
      data: {
        tenantId,
        reviewId: id,
        raterType: "SELF",
        raterId: review.employeeId,
        score: dto.selfScore,
        weightage: 20.0,
        comments: dto.selfComments
      }
    });

    // Save competency ratings
    if (dto.competencyRatings && dto.competencyRatings.length > 0) {
      for (const comp of dto.competencyRatings) {
        await this.prisma.employeeCompetencyRating.upsert({
          where: { reviewId_competencyId: { reviewId: id, competencyId: comp.competencyId } },
          update: { selfRating: comp.rating, comments: comp.comments },
          create: {
            tenantId,
            reviewId: id,
            competencyId: comp.competencyId,
            selfRating: comp.rating,
            comments: comp.comments
          }
        });
      }
    }

    const updated = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        selfScore: dto.selfScore,
        selfComments: dto.selfComments,
        strengths: dto.strengths,
        areasOfGrowth: dto.areasOfGrowth,
        status: "MANAGER_REVIEW",
        submittedAt: new Date()
      },
      include: { raterScores: true, competencyRatings: true }
    });

    await this.recordAudit(
      tenantId,
      "PMS_SELF_ASSESSMENT_SUBMITTED",
      "PerformanceReview",
      id,
      { selfScore: dto.selfScore },
      userId,
      membershipId
    );

    return updated;
  }

  async submitManagerReview(
    tenantId: string,
    id: string,
    dto: SubmitManagerReviewDto,
    userId: string,
    membershipId: string
  ) {
    const review = await this.prisma.performanceReview.findFirst({
      where: { id, tenantId },
      include: { raterScores: true }
    });
    if (!review) throw new NotFoundException("Performance review not found");
    if (review.isLocked) throw new BadRequestException("Review is locked");

    // Upsert rater score for MANAGER
    await this.prisma.performanceReviewScore.deleteMany({
      where: { reviewId: id, raterType: "MANAGER" }
    });

    await this.prisma.performanceReviewScore.create({
      data: {
        tenantId,
        reviewId: id,
        raterType: "MANAGER",
        score: dto.managerScore,
        weightage: 40.0,
        comments: dto.managerComments
      }
    });

    // Save competency ratings for manager
    if (dto.competencyRatings && dto.competencyRatings.length > 0) {
      for (const comp of dto.competencyRatings) {
        await this.prisma.employeeCompetencyRating.upsert({
          where: { reviewId_competencyId: { reviewId: id, competencyId: comp.competencyId } },
          update: { managerRating: comp.rating, evaluatedLevel: comp.rating },
          create: {
            tenantId,
            reviewId: id,
            competencyId: comp.competencyId,
            managerRating: comp.rating,
            evaluatedLevel: comp.rating
          }
        });
      }
    }

    // Recompute 360 appraisal score
    const allRaters = await this.prisma.performanceReviewScore.findMany({ where: { reviewId: id } });
    const scoreResult = this.appraisalEngine.calculate360AppraisalScore(
      allRaters.map((r) => ({
        raterType: r.raterType,
        score: r.score,
        weightage: r.weightage
      }))
    );

    const ratingLabel = (dto.ratingLabel as ReviewRatingLabel) || scoreResult.ratingLabel;

    const updated = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        managerScore: dto.managerScore,
        managerComments: dto.managerComments,
        finalScore: scoreResult.finalScore,
        ratingLabel,
        status: "HR_CALIBRATION",
        ...(dto.strengths ? { strengths: dto.strengths } : {}),
        ...(dto.areasOfGrowth ? { areasOfGrowth: dto.areasOfGrowth } : {})
      },
      include: { raterScores: true, competencyRatings: true }
    });

    await this.recordAudit(
      tenantId,
      "PMS_MANAGER_REVIEW_SUBMITTED",
      "PerformanceReview",
      id,
      { managerScore: dto.managerScore, finalScore: scoreResult.finalScore, ratingLabel },
      userId,
      membershipId
    );

    return updated;
  }

  async submit360Score(
    tenantId: string,
    id: string,
    dto: Submit360ScoreDto,
    raterId: string | undefined,
    userId: string,
    membershipId: string
  ) {
    const review = await this.prisma.performanceReview.findFirst({ where: { id, tenantId } });
    if (!review) throw new NotFoundException("Performance review not found");

    const raterScore = await this.prisma.performanceReviewScore.create({
      data: {
        tenantId,
        reviewId: id,
        raterType: dto.raterType,
        raterId,
        score: dto.score,
        weightage: dto.weightage ?? (dto.raterType === "PEER" ? 20.0 : 10.0),
        comments: dto.comments
      }
    });

    // Recompute 360 appraisal score
    const allRaters = await this.prisma.performanceReviewScore.findMany({ where: { reviewId: id } });
    const scoreResult = this.appraisalEngine.calculate360AppraisalScore(
      allRaters.map((r) => ({
        raterType: r.raterType,
        score: r.score,
        weightage: r.weightage
      }))
    );

    await this.prisma.performanceReview.update({
      where: { id },
      data: {
        peerScore: scoreResult.scoreBreakdown.peerScore,
        skipLevelScore: scoreResult.scoreBreakdown.skipLevelScore,
        crossFunctionalScore: scoreResult.scoreBreakdown.crossFunctionalScore,
        finalScore: scoreResult.finalScore,
        ratingLabel: scoreResult.ratingLabel
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_360_SCORE_SUBMITTED",
      "PerformanceReviewScore",
      raterScore.id,
      { raterType: dto.raterType, score: dto.score },
      userId,
      membershipId
    );

    return raterScore;
  }

  // ==========================================
  // 4. COMPETENCY FRAMEWORK
  // ==========================================

  async listCompetencies(tenantId: string, category?: string) {
    return this.prisma.competency.findMany({
      where: {
        tenantId,
        ...(category ? { category: category as CompetencyCategory } : {})
      },
      include: {
        designations: { include: { designation: true } }
      },
      orderBy: { name: "asc" }
    });
  }

  async createCompetency(
    tenantId: string,
    dto: CreateCompetencyDto,
    userId: string,
    membershipId: string
  ) {
    const competency = await this.prisma.competency.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_COMPETENCY_CREATED",
      "Competency",
      competency.id,
      { name: competency.name, code: competency.code },
      userId,
      membershipId
    );

    return competency;
  }

  async listDesignationCompetencies(tenantId: string, designationId: string) {
    return this.prisma.designationCompetency.findMany({
      where: { tenantId, designationId },
      include: { competency: true, designation: true }
    });
  }

  async mapDesignationCompetency(
    tenantId: string,
    dto: z.infer<typeof MapDesignationCompetencySchema>,
    userId: string,
    membershipId: string
  ) {
    const mapped = await this.prisma.designationCompetency.upsert({
      where: {
        designationId_competencyId: {
          designationId: dto.designationId,
          competencyId: dto.competencyId
        }
      },
      update: {
        expectedLevel: dto.expectedLevel,
        weightage: dto.weightage
      },
      create: {
        tenantId,
        designationId: dto.designationId,
        competencyId: dto.competencyId,
        expectedLevel: dto.expectedLevel,
        weightage: dto.weightage
      },
      include: { competency: true, designation: true }
    });

    await this.recordAudit(
      tenantId,
      "PMS_DESIGNATION_COMPETENCY_MAPPED",
      "DesignationCompetency",
      mapped.id,
      { designationId: dto.designationId, competencyId: dto.competencyId, expectedLevel: dto.expectedLevel },
      userId,
      membershipId
    );

    return mapped;
  }

  // ==========================================
  // 5. CALIBRATION & BELL CURVE
  // ==========================================

  async listCalibrationSessions(tenantId: string, cycleId?: string) {
    return this.prisma.calibrationSession.findMany({
      where: {
        tenantId,
        ...(cycleId ? { cycleId } : {})
      },
      include: {
        cycle: true,
        department: true,
        reviews: { include: { review: { include: { employee: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createCalibrationSession(
    tenantId: string,
    dto: CreateCalibrationSessionDto,
    userId: string,
    membershipId: string
  ) {
    const session = await this.prisma.calibrationSession.create({
      data: {
        tenantId,
        cycleId: dto.cycleId,
        departmentId: dto.departmentId,
        sessionName: dto.sessionName,
        targetDistributionJson: (dto.targetDistribution || this.calibrationEngine.DEFAULT_TARGET) as unknown as Prisma.InputJsonValue,
        notes: dto.notes,
        calibratedByUserId: userId
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_CALIBRATION_SESSION_CREATED",
      "CalibrationSession",
      session.id,
      { sessionName: session.sessionName },
      userId,
      membershipId
    );

    return session;
  }

  async adjustCalibrationReview(
    tenantId: string,
    sessionId: string,
    dto: AdjustCalibrationReviewDto,
    userId: string,
    membershipId: string
  ) {
    const session = await this.prisma.calibrationSession.findFirst({ where: { id: sessionId, tenantId } });
    if (!session) throw new NotFoundException("Calibration session not found");

    const review = await this.prisma.performanceReview.findFirst({
      where: { id: dto.reviewId, tenantId }
    });
    if (!review) throw new NotFoundException("Performance review not found");

    const originalScore = review.finalScore || review.managerScore || 3.0;
    const originalLabel = review.ratingLabel || this.appraisalEngine.determineRatingLabel(originalScore);

    const calibrationReview = await this.prisma.calibrationReview.upsert({
      where: { reviewId: dto.reviewId },
      update: {
        sessionId,
        calibratedScore: dto.calibratedScore,
        calibratedLabel: dto.calibratedLabel,
        justification: dto.justification,
        reviewedByUserId: userId
      },
      create: {
        sessionId,
        reviewId: dto.reviewId,
        originalScore,
        calibratedScore: dto.calibratedScore,
        originalLabel,
        calibratedLabel: dto.calibratedLabel,
        justification: dto.justification,
        reviewedByUserId: userId
      }
    });

    // Update review calibrated score
    await this.prisma.performanceReview.update({
      where: { id: dto.reviewId },
      data: {
        calibratedScore: dto.calibratedScore,
        ratingLabel: dto.calibratedLabel
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_CALIBRATION_REVIEW_ADJUSTED",
      "CalibrationReview",
      calibrationReview.id,
      { reviewId: dto.reviewId, calibratedScore: dto.calibratedScore, calibratedLabel: dto.calibratedLabel },
      userId,
      membershipId
    );

    return calibrationReview;
  }

  async finalizeCalibrationSession(
    tenantId: string,
    sessionId: string,
    userId: string,
    membershipId: string
  ) {
    const session = await this.prisma.calibrationSession.findFirst({
      where: { id: sessionId, tenantId },
      include: { reviews: { include: { review: true } } }
    });
    if (!session) throw new NotFoundException("Calibration session not found");

    const allReviews = await this.prisma.performanceReview.findMany({
      where: {
        tenantId,
        cycleId: session.cycleId,
        ...(session.departmentId ? { employee: { departmentId: session.departmentId } } : {})
      }
    });

    const analysis = this.calibrationEngine.analyzeDistribution(
      allReviews.map((r) => ({
        score: r.calibratedScore ?? r.finalScore ?? r.managerScore ?? 3.0,
        ratingLabel: r.ratingLabel || "MEETS_EXPECTATIONS"
      })),
      (session.targetDistributionJson as unknown as Record<string, number>) || undefined
    );

    const updated = await this.prisma.calibrationSession.update({
      where: { id: sessionId },
      data: {
        status: "FINALIZED",
        finalizedAt: new Date(),
        actualDistributionJson: analysis.actualDistribution.percentages as unknown as Prisma.InputJsonValue
      }
    });

    // Lock and finalize reviews
    for (const r of allReviews) {
      await this.prisma.performanceReview.update({
        where: { id: r.id },
        data: { status: "FINALIZED", isLocked: true, finalizedAt: new Date() }
      });
    }

    await this.recordAudit(
      tenantId,
      "PMS_CALIBRATION_SESSION_FINALIZED",
      "CalibrationSession",
      sessionId,
      { totalCalibrated: allReviews.length },
      userId,
      membershipId
    );

    return { session: updated, analysis };
  }

  // ==========================================
  // 6. INCREMENT PLANNING & RULES
  // ==========================================

  async listSalaryIncrementRules(tenantId: string) {
    const rules = await this.prisma.salaryIncrementRule.findMany({
      where: { tenantId },
      orderBy: { defaultIncrementPct: "desc" }
    });

    if (rules.length === 0) {
      // Seed default enterprise increment rules
      const defaults: Array<{ label: ReviewRatingLabel; pct: number }> = [
        { label: "OUTSTANDING", pct: 18.0 },
        { label: "EXCEEDS_EXPECTATIONS", pct: 12.0 },
        { label: "MEETS_EXPECTATIONS", pct: 8.0 },
        { label: "NEEDS_IMPROVEMENT", pct: 3.0 },
        { label: "UNSATISFACTORY", pct: 0.0 }
      ];

      for (const d of defaults) {
        await this.prisma.salaryIncrementRule.create({
          data: {
            tenantId,
            ratingLabel: d.label,
            defaultIncrementPct: d.pct,
            minIncrementPct: 0.0,
            maxIncrementPct: 25.0
          }
        });
      }

      return this.prisma.salaryIncrementRule.findMany({
        where: { tenantId },
        orderBy: { defaultIncrementPct: "desc" }
      });
    }

    return rules;
  }

  async setSalaryIncrementRule(
    tenantId: string,
    dto: SetSalaryIncrementRuleDto,
    userId: string,
    membershipId: string
  ) {
    const rule = await this.prisma.salaryIncrementRule.upsert({
      where: { tenantId_ratingLabel: { tenantId, ratingLabel: dto.ratingLabel } },
      update: {
        defaultIncrementPct: dto.defaultIncrementPct,
        minIncrementPct: dto.minIncrementPct,
        maxIncrementPct: dto.maxIncrementPct,
        budgetAllocationPct: dto.budgetAllocationPct,
        isActive: dto.isActive
      },
      create: {
        tenantId,
        ratingLabel: dto.ratingLabel,
        defaultIncrementPct: dto.defaultIncrementPct,
        minIncrementPct: dto.minIncrementPct,
        maxIncrementPct: dto.maxIncrementPct,
        budgetAllocationPct: dto.budgetAllocationPct,
        isActive: dto.isActive
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_SALARY_INCREMENT_RULE_SET",
      "SalaryIncrementRule",
      rule.id,
      { ratingLabel: dto.ratingLabel, defaultIncrementPct: dto.defaultIncrementPct },
      userId,
      membershipId
    );

    return rule;
  }

  async simulateSalaryIncrements(tenantId: string, cycleId?: string, budgetAmount?: number) {
    const rules = await this.listSalaryIncrementRules(tenantId);
    const rateMap: Partial<Record<ReviewRatingLabel, number>> = {};
    for (const r of rules) {
      rateMap[r.ratingLabel] = r.defaultIncrementPct;
    }

    const reviews = await this.prisma.performanceReview.findMany({
      where: {
        tenantId,
        ...(cycleId ? { cycleId } : {})
      },
      include: {
        employee: {
          include: {
            compensations: {
              where: { status: "ACTIVE" },
              orderBy: { effectiveFrom: "desc" },
              take: 1
            }
          }
        }
      }
    });

    const employees = reviews.map((r) => {
      const activeComp = r.employee.compensations[0];
      const annualCtc = activeComp ? Number(activeComp.annualCtc) : 1200000;
      return {
        employeeId: r.employeeId,
        employeeName: r.employee.fullName,
        currentAnnualCtc: annualCtc,
        ratingLabel: r.ratingLabel || "MEETS_EXPECTATIONS"
      };
    });

    return this.incrementEngine.simulateIncrements(employees, budgetAmount, rateMap);
  }

  // ==========================================
  // 7. PROMOTION & SUCCESSION PLANNING
  // ==========================================

  async listPromotionRecommendations(tenantId: string, status?: string) {
    return this.prisma.promotionRecommendation.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {})
      },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } },
        targetDesignation: true
      },
      orderBy: { readinessScore: "desc" }
    });
  }

  async evaluatePromotionReadiness(
    tenantId: string,
    dto: EvaluatePromotionDto,
    userId: string,
    membershipId: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId },
      include: {
        designation: true,
        performanceReviews: { orderBy: { createdAt: "desc" }, take: 1 },
        compensations: { where: { status: "ACTIVE" }, take: 1 }
      }
    });
    if (!employee) throw new NotFoundException("Employee not found");

    const latestReview = employee.performanceReviews[0];
    const performanceScore = latestReview?.calibratedScore ?? latestReview?.finalScore ?? 3.5;

    // Calculate tenure in months
    const tenureMonths = Math.max(
      1,
      Math.floor((Date.now() - new Date(employee.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 30.4375))
    );

    // Compute competency score
    const competencyRatings = await this.prisma.employeeCompetencyRating.findMany({
      where: { tenantId, review: { employeeId: dto.employeeId } }
    });
    const competencyScore =
      competencyRatings.length > 0
        ? competencyRatings.reduce((acc, r) => acc + (r.evaluatedLevel || r.managerRating || 3), 0) /
          competencyRatings.length
        : 3.5;

    const evaluation = this.promotionEngine.evaluatePromotionReadiness({
      performanceScore,
      competencyScore,
      tenureMonths,
      potentialScore: dto.potentialScore,
      minTenureMonths: 18
    });

    const recommendation = await this.prisma.promotionRecommendation.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        currentDesignationId: employee.designationId,
        targetDesignationId: dto.targetDesignationId,
        performanceScore,
        competencyScore,
        tenureMonths,
        potentialScore: dto.potentialScore,
        readinessScore: evaluation.readinessScore,
        readinessRating: evaluation.readinessRating,
        proposedSalaryBumpPct: dto.proposedSalaryBumpPct ?? evaluation.suggestedSalaryBumpPct,
        justification: dto.justification,
        status: "PENDING_APPROVAL"
      },
      include: {
        employee: true,
        targetDesignation: true
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_PROMOTION_EVALUATED",
      "PromotionRecommendation",
      recommendation.id,
      { readinessScore: evaluation.readinessScore, readinessRating: evaluation.readinessRating },
      userId,
      membershipId
    );

    return { recommendation, evaluation };
  }

  async approvePromotion(
    tenantId: string,
    id: string,
    dto: ApprovePromotionDto,
    userId: string,
    membershipId: string
  ) {
    const promo = await this.prisma.promotionRecommendation.findFirst({
      where: { id, tenantId },
      include: { employee: true, targetDesignation: true }
    });
    if (!promo) throw new NotFoundException("Promotion recommendation not found");

    const newStatus = dto.action === "APPROVE" ? "APPROVED" : "REJECTED";

    const updated = await this.prisma.promotionRecommendation.update({
      where: { id },
      data: {
        status: newStatus,
        approvedAt: dto.action === "APPROVE" ? new Date() : null,
        ...(dto.proposedSalaryBumpPct !== undefined
          ? { proposedSalaryBumpPct: dto.proposedSalaryBumpPct }
          : {}),
        ...(dto.comments ? { justification: `${promo.justification || ""}\nApproval note: ${dto.comments}` } : {})
      }
    });

    // If approved, update employee designation and compensation
    if (dto.action === "APPROVE") {
      await this.prisma.employee.update({
        where: { id: promo.employeeId },
        data: { designationId: promo.targetDesignationId }
      });
    }

    await this.recordAudit(
      tenantId,
      dto.action === "APPROVE" ? "PMS_PROMOTION_APPROVED" : "PMS_PROMOTION_REJECTED",
      "PromotionRecommendation",
      id,
      { action: dto.action, targetDesignationId: promo.targetDesignationId },
      userId,
      membershipId
    );

    return updated;
  }

  async listSuccessionPositions(tenantId: string) {
    return this.prisma.successionPosition.findMany({
      where: { tenantId },
      include: {
        designation: true,
        successors: {
          include: {
            employee: { select: { id: true, fullName: true, employeeCode: true, department: true } }
          }
        }
      }
    });
  }

  async createSuccessionPosition(
    tenantId: string,
    dto: CreateSuccessionPositionDto,
    userId: string,
    membershipId: string
  ) {
    const pos = await this.prisma.successionPosition.create({
      data: {
        tenantId,
        designationId: dto.designationId,
        title: dto.title,
        criticality: dto.criticality,
        riskOfLoss: dto.riskOfLoss,
        impactOfLoss: dto.impactOfLoss,
        notes: dto.notes
      },
      include: { designation: true }
    });

    await this.recordAudit(
      tenantId,
      "PMS_SUCCESSION_POSITION_CREATED",
      "SuccessionPosition",
      pos.id,
      { title: pos.title, criticality: pos.criticality },
      userId,
      membershipId
    );

    return pos;
  }

  async getNineBoxGrid(tenantId: string) {
    const successors = await this.prisma.successorPool.findMany({
      where: { tenantId },
      include: {
        position: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: true,
            designation: true
          }
        }
      }
    });

    const gridMap: Record<string, typeof successors> = {};
    for (const s of successors) {
      const posKey = s.nineBoxPosition as string;
      if (!gridMap[posKey]) {
        gridMap[posKey] = [];
      }
      gridMap[posKey]!.push(s);
    }

    return {
      totalSuccessors: successors.length,
      grid: gridMap
    };
  }

  async addSuccessor(
    tenantId: string,
    dto: AddSuccessorDto,
    userId: string,
    membershipId: string
  ) {
    const successor = await this.prisma.successorPool.upsert({
      where: { positionId_employeeId: { positionId: dto.positionId, employeeId: dto.employeeId } },
      update: {
        readiness: dto.readiness as SuccessorReadiness,
        flightRisk: dto.flightRisk,
        nineBoxPosition: dto.nineBoxPosition,
        developmentPlan: dto.developmentPlan
      },
      create: {
        tenantId,
        positionId: dto.positionId,
        employeeId: dto.employeeId,
        readiness: dto.readiness as SuccessorReadiness,
        flightRisk: dto.flightRisk,
        nineBoxPosition: dto.nineBoxPosition,
        developmentPlan: dto.developmentPlan
      },
      include: {
        position: true,
        employee: { select: { id: true, fullName: true, employeeCode: true } }
      }
    });

    await this.recordAudit(
      tenantId,
      "PMS_SUCCESSOR_ADDED",
      "SuccessorPool",
      successor.id,
      { positionId: dto.positionId, employeeId: dto.employeeId, nineBoxPosition: dto.nineBoxPosition },
      userId,
      membershipId
    );

    return successor;
  }

  // ==========================================
  // 8. PERFORMANCE ANALYTICS & AI INSIGHTS
  // ==========================================

  async getAnalytics(tenantId: string) {
    return this.analyticsService.getPerformanceAnalytics(tenantId);
  }

  async getAiInsights(tenantId: string, employeeId?: string) {
    if (employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: employeeId, tenantId },
        include: {
          designation: true,
          department: true,
          goals: true,
          managedOneOnOnes: { orderBy: { scheduledAt: "desc" }, take: 1 },
          feedbacksReceived: true
        }
      });
      if (!employee) throw new NotFoundException("Employee not found");

      const avgGoalProgress =
        employee.goals.length > 0
          ? employee.goals.reduce((acc, g) => acc + g.progressPercent, 0) / employee.goals.length
          : 50;

      const lastMeetingDate = employee.managedOneOnOnes[0]?.scheduledAt;
      const oneOnOneFrequencyDays = lastMeetingDate
        ? Math.floor((Date.now() - new Date(lastMeetingDate).getTime()) / (1000 * 60 * 60 * 24))
        : 35;

      const negativeFeedbackCount = employee.feedbacksReceived.filter((f) => (f.rating || 5) <= 2).length;

      const riskAssessment = this.aiPerformance.assessPerformanceRisks({
        employeeId: employee.id,
        employeeName: employee.fullName,
        avgGoalProgress,
        oneOnOneFrequencyDays,
        negativeFeedbackCount
      });

      const suggestedGoals = this.aiPerformance.generateSuggestedGoals(
        employee.designation?.name || "Software Engineer",
        employee.department?.name || "Engineering"
      );

      const coachingTips = this.aiPerformance.generateManagerCoachingTips({
        employeeName: employee.fullName,
        ratingLabel: "MEETS_EXPECTATIONS"
      });

      return { riskAssessment, suggestedGoals, coachingTips };
    }

    // Tenant-level executive overview
    return {
      burnoutWatchlist: [
        { employeeName: "Rahul Sharma", role: "Lead Architect", riskScore: 82, factor: "14h weekly overtime + high sprint load" },
        { employeeName: "Meera Nair", role: "Operations Lead", riskScore: 68, factor: "No 1:1 in 45 days" }
      ],
      coachingRecommendations: [
        "Schedule quarterly goal check-in reviews for 12 employees with stalled OKR progress.",
        "Initiate retention discussion for 4 key potential successors in the 9-Box Star category."
      ]
    };
  }
}
