import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import type { Request } from "express";
import { PerformanceService } from "./performance.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  type GoalCycleStatus,
  type ReviewCycleStatus
} from "@prisma/client";
import {
  AdjustCalibrationReviewSchema,
  ApproveGoalSchema,
  ApprovePromotionSchema,
  CreateCalibrationSessionSchema,
  CreateCompetencySchema,
  CreateFeedbackSchema,
  CreateGoalCycleSchema,
  CreateGoalSchema,
  CreateKeyResultSchema,
  CreateOneOnOneSchema,
  CreateReviewCycleSchema,
  CreateSuccessionPositionSchema,
  AddSuccessorSchema,
  EvaluatePromotionSchema,
  MapDesignationCompetencySchema,
  SetSalaryIncrementRuleSchema,
  Submit360ScoreSchema,
  SubmitManagerReviewSchema,
  SubmitSelfAssessmentSchema,
  UpdateGoalCycleStatusSchema,
  UpdateGoalSchema,
  UpdateKeyResultSchema,
  UpdateOneOnOneSchema,
  UpdateReviewCycleStageSchema
} from "./performance.schemas.js";

@Controller(["performance", "api/v1/performance"])
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ==========================================
  // 1. GOAL CYCLES & OKR / KRA GOALS
  // ==========================================

  @Get("goal-cycles")
  @RequirePermissions("performance.view")
  async listGoalCycles(@Req() req: Request, @Query("status") status?: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listGoalCycles(tenant.tenantId, status);
  }

  @Post("goal-cycles")
  @RequirePermissions("performance.manage")
  async createGoalCycle(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateGoalCycleSchema.parse(body);
    return this.performanceService.createGoalCycle(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Put("goal-cycles/:id/status")
  @RequirePermissions("performance.manage")
  async updateGoalCycleStatus(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdateGoalCycleStatusSchema.parse(body);
    return this.performanceService.updateGoalCycleStatus(
      tenant.tenantId,
      id,
      dto.status as GoalCycleStatus,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("goals")
  @RequirePermissions("performance.view")
  async listGoals(
    @Req() req: Request,
    @Query("cycleId") cycleId?: string,
    @Query("employeeId") employeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listGoals(tenant.tenantId, cycleId, employeeId);
  }

  @Get("goals/:id")
  @RequirePermissions("performance.view")
  async getGoal(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.getGoal(tenant.tenantId, id);
  }

  @Post("goals")
  @RequirePermissions("performance.review")
  async createGoal(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateGoalSchema.parse(body);
    return this.performanceService.createGoal(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId,
      tenant.permissions
    );
  }

  @Put("goals/:id")
  @RequirePermissions("performance.review")
  async updateGoal(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdateGoalSchema.parse(body);
    return this.performanceService.updateGoal(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId, tenant.permissions);
  }

  @Post("goals/:id/approve")
  @RequirePermissions("performance.manage")
  async approveGoal(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = ApproveGoalSchema.parse(body);
    return this.performanceService.approveGoal(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  @Post("goals/:id/key-results")
  @RequirePermissions("performance.review")
  async createKeyResult(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateKeyResultSchema.parse(body);
    return this.performanceService.createKeyResult(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId, tenant.permissions);
  }

  @Put("key-results/:id")
  @RequirePermissions("performance.review")
  async updateKeyResult(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdateKeyResultSchema.parse(body);
    return this.performanceService.updateKeyResult(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId, tenant.permissions);
  }

  // ==========================================
  // 2. CONTINUOUS FEEDBACK & 1:1 MEETINGS
  // ==========================================

  @Get("feedback")
  @RequirePermissions("performance.view")
  async listFeedbacks(
    @Req() req: Request,
    @Query("toEmployeeId") toEmployeeId?: string,
    @Query("fromEmployeeId") fromEmployeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listFeedbacks(
      tenant.tenantId,
      tenant.membershipId,
      tenant.permissions,
      toEmployeeId,
      fromEmployeeId
    );
  }

  @Post("feedback")
  @RequirePermissions("performance.review")
  async createFeedback(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateFeedbackSchema.parse(body);
    return this.performanceService.createFeedback(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("1on1")
  @RequirePermissions("performance.view")
  async listOneOnOnes(
    @Req() req: Request,
    @Query("managerId") managerId?: string,
    @Query("employeeId") employeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listOneOnOnes(tenant.tenantId, managerId, employeeId);
  }

  @Post("1on1")
  @RequirePermissions("performance.review")
  async createOneOnOne(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateOneOnOneSchema.parse(body);
    return this.performanceService.createOneOnOne(tenant.tenantId, dto, tenant.userId, tenant.membershipId, tenant.permissions);
  }

  @Put("1on1/:id")
  @RequirePermissions("performance.review")
  async updateOneOnOne(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdateOneOnOneSchema.parse(body);
    return this.performanceService.updateOneOnOne(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId, tenant.permissions);
  }

  // ==========================================
  // 3. REVIEW CYCLES & 360 APPRAISALS
  // ==========================================

  @Get("review-cycles")
  @RequirePermissions("performance.view")
  async listReviewCycles(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listReviewCycles(tenant.tenantId);
  }

  @Post("review-cycles")
  @RequirePermissions("performance.manage")
  async createReviewCycle(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateReviewCycleSchema.parse(body);
    return this.performanceService.createReviewCycle(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Put("review-cycles/:id/stage")
  @RequirePermissions("performance.manage")
  async updateReviewCycleStage(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdateReviewCycleStageSchema.parse(body);
    return this.performanceService.updateReviewCycleStage(
      tenant.tenantId,
      id,
      dto.status as ReviewCycleStatus,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("reviews")
  @RequirePermissions("performance.view")
  async listReviews(
    @Req() req: Request,
    @Query("cycleId") cycleId?: string,
    @Query("employeeId") employeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listReviews(tenant.tenantId, cycleId, employeeId);
  }

  @Get("reviews/:id")
  @RequirePermissions("performance.view")
  async getReview(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.getReview(tenant.tenantId, id);
  }

  @Post("reviews/:id/self-assessment")
  @RequirePermissions("performance.review")
  async submitSelfAssessment(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = SubmitSelfAssessmentSchema.parse(body);
    return this.performanceService.submitSelfAssessment(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  @Post("reviews/:id/manager-review")
  @RequirePermissions("performance.review")
  async submitManagerReview(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = SubmitManagerReviewSchema.parse(body);
    return this.performanceService.submitManagerReview(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId, tenant.permissions);
  }

  @Post("reviews/:id/360-score")
  @RequirePermissions("performance.review")
  async submit360Score(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = Submit360ScoreSchema.parse(body);
    return this.performanceService.submit360Score(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId,
      tenant.permissions
    );
  }

  // ==========================================
  // 4. COMPETENCY FRAMEWORK
  // ==========================================

  @Get("competencies")
  @RequirePermissions("performance.view")
  async listCompetencies(@Req() req: Request, @Query("category") category?: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listCompetencies(tenant.tenantId, category);
  }

  @Post("competencies")
  @RequirePermissions("performance.manage")
  async createCompetency(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateCompetencySchema.parse(body);
    return this.performanceService.createCompetency(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("designation-competencies")
  @RequirePermissions("performance.view")
  async listDesignationCompetencies(
    @Req() req: Request,
    @Query("designationId") designationId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listDesignationCompetencies(tenant.tenantId, designationId);
  }

  @Post("designation-competencies")
  @RequirePermissions("performance.manage")
  async mapDesignationCompetency(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = MapDesignationCompetencySchema.parse(body);
    return this.performanceService.mapDesignationCompetency(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 5. CALIBRATION & BELL CURVE
  // ==========================================

  @Get("calibration")
  @RequirePermissions("performance.calibration")
  async listCalibrationSessions(@Req() req: Request, @Query("cycleId") cycleId?: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listCalibrationSessions(tenant.tenantId, cycleId);
  }

  @Post("calibration")
  @RequirePermissions("performance.calibration")
  async createCalibrationSession(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateCalibrationSessionSchema.parse(body);
    return this.performanceService.createCalibrationSession(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("calibration/:id/adjust")
  @RequirePermissions("performance.calibration")
  async adjustCalibrationReview(
    @Req() req: Request,
    @Param("id") sessionId: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = AdjustCalibrationReviewSchema.parse(body);
    return this.performanceService.adjustCalibrationReview(tenant.tenantId, sessionId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("calibration/:id/finalize")
  @RequirePermissions("performance.calibration")
  async finalizeCalibrationSession(@Req() req: Request, @Param("id") sessionId: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.finalizeCalibrationSession(tenant.tenantId, sessionId, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 6. INCREMENT PLANNING & RULES
  // ==========================================

  @Get("salary-increments/rules")
  @RequirePermissions("performance.manage")
  async listSalaryIncrementRules(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listSalaryIncrementRules(tenant.tenantId);
  }

  @Post("salary-increments/rules")
  @RequirePermissions("performance.manage")
  async setSalaryIncrementRule(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = SetSalaryIncrementRuleSchema.parse(body);
    return this.performanceService.setSalaryIncrementRule(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("salary-increments/simulate")
  @RequirePermissions("performance.manage")
  async simulateSalaryIncrements(
    @Req() req: Request,
    @Query("cycleId") cycleId?: string,
    @Query("budgetAmount") budgetAmount?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.performanceService.simulateSalaryIncrements(
      tenant.tenantId,
      cycleId,
      budgetAmount ? parseFloat(budgetAmount) : undefined
    );
  }

  // ==========================================
  // 7. PROMOTIONS & SUCCESSION PLANNING
  // ==========================================

  @Get("promotions")
  @RequirePermissions("performance.manage")
  async listPromotionRecommendations(@Req() req: Request, @Query("status") status?: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listPromotionRecommendations(tenant.tenantId, status);
  }

  @Post("promotions/evaluate")
  @RequirePermissions("performance.manage")
  async evaluatePromotionReadiness(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = EvaluatePromotionSchema.parse(body);
    return this.performanceService.evaluatePromotionReadiness(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("promotions/:id/approve")
  @RequirePermissions("performance.manage")
  async approvePromotion(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = ApprovePromotionSchema.parse(body);
    return this.performanceService.approvePromotion(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  @Get("succession/positions")
  @RequirePermissions("performance.succession")
  async listSuccessionPositions(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.performanceService.listSuccessionPositions(tenant.tenantId);
  }

  @Post("succession/positions")
  @RequirePermissions("performance.succession")
  async createSuccessionPosition(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateSuccessionPositionSchema.parse(body);
    return this.performanceService.createSuccessionPosition(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("succession/9-box")
  @RequirePermissions("performance.succession")
  async getNineBoxGrid(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.performanceService.getNineBoxGrid(tenant.tenantId);
  }

  @Post("succession/pool")
  @RequirePermissions("performance.succession")
  async addSuccessor(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = AddSuccessorSchema.parse(body);
    return this.performanceService.addSuccessor(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 8. PERFORMANCE ANALYTICS & AI INSIGHTS
  // ==========================================

  @Get("analytics")
  @RequirePermissions("performance.analytics")
  async getAnalytics(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.performanceService.getAnalytics(tenant.tenantId);
  }

  @Get("ai-insights")
  @RequirePermissions("performance.analytics")
  async getAiInsights(@Req() req: Request, @Query("employeeId") employeeId?: string) {
    const tenant = requireTenantContext(req);
    return this.performanceService.getAiInsights(tenant.tenantId, employeeId);
  }
}
