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
import { WorkforceService } from "./workforce.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
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

@Controller("api/v1/workforce")
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  // ==========================================
  // 1. POSITION MANAGEMENT
  // ==========================================

  @Get("positions")
  @RequirePermissions("workforce.view")
  async listPositions(
    @Req() req: Request,
    @Query("departmentId") departmentId?: string,
    @Query("status") status?: string,
    @Query("isCriticalRole") isCriticalRole?: string,
    @Query("search") search?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workforceService.listPositions(tenant.tenantId, {
      departmentId,
      status,
      isCriticalRole: isCriticalRole !== undefined ? isCriticalRole === "true" : undefined,
      search
    });
  }

  @Get("positions/:id")
  @RequirePermissions("workforce.view")
  async getPosition(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.workforceService.getPosition(tenant.tenantId, id);
  }

  @Post("positions")
  @RequirePermissions("workforce.positions.manage")
  async createPosition(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreatePositionSchema.parse(body);
    return this.workforceService.createPosition(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Put("positions/:id")
  @RequirePermissions("workforce.positions.manage")
  async updatePosition(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdatePositionSchema.parse(body);
    return this.workforceService.updatePosition(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  @Post("positions/:id/freeze")
  @RequirePermissions("workforce.positions.manage")
  async freezePosition(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.workforceService.freezePosition(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  @Post("positions/:id/close")
  @RequirePermissions("workforce.positions.manage")
  async closePosition(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.workforceService.closePosition(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  @Post("positions/assign")
  @RequirePermissions("workforce.positions.manage")
  async assignPosition(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = AssignPositionSchema.parse(body);
    return this.workforceService.assignPosition(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 2. HEADCOUNT PLANNING & SCENARIOS
  // ==========================================

  @Get("headcount")
  @RequirePermissions("workforce.view")
  async listHeadcountPlans(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceService.listHeadcountPlans(tenant.tenantId);
  }

  @Post("headcount")
  @RequirePermissions("workforce.headcount.plan")
  async createHeadcountPlan(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateHeadcountPlanSchema.parse(body);
    return this.workforceService.createHeadcountPlan(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("headcount/scenarios")
  @RequirePermissions("workforce.headcount.plan")
  async createHeadcountScenario(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateHeadcountScenarioSchema.parse(body);
    return this.workforceService.createHeadcountScenario(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 3. WORKFORCE COST PLANNING
  // ==========================================

  @Post("cost-planning/simulate")
  @RequirePermissions("workforce.cost.forecast")
  simulateCost(@Body() body: unknown) {
    const dto = SimulateCostForecastSchema.parse(body);
    return this.workforceService.simulateCost(dto);
  }

  // ==========================================
  // 4. ORG DESIGN & ORG CHART
  // ==========================================

  @Get("org-chart")
  @RequirePermissions("workforce.view")
  async getOrgChart(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceService.getOrgChart(tenant.tenantId);
  }

  @Post("org-chart/version")
  @RequirePermissions("workforce.orgdesign.manage")
  async createOrgVersion(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateOrgVersionSchema.parse(body);
    return this.workforceService.createOrgStructureVersion(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 5. SUCCESSION & BENCH STRENGTH
  // ==========================================

  @Get("bench-strength")
  @RequirePermissions("workforce.succession.manage")
  async getBenchStrength(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceService.getBenchStrengthReport(tenant.tenantId);
  }

  @Post("succession/readiness")
  @RequirePermissions("workforce.succession.manage")
  async calculateReadiness(
    @Body("performanceRating") perf: number,
    @Body("potentialRating") pot: number,
    @Body("competencyScorePercent") comp: number,
    @Body("certificationsCompletedRatio") cert: number,
    @Body("managerAssessmentRating") mgr: number
  ) {
    return this.workforceService.calculateSuccessorReadiness(perf, pot, comp, cert, mgr);
  }

  // ==========================================
  // 6. ATTRITION PREDICTION ENGINE
  // ==========================================

  @Get("attrition")
  @RequirePermissions("workforce.attrition.predict")
  async listAttritionAssessments(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceService.listAttritionAssessments(tenant.tenantId);
  }

  @Post("attrition/assess")
  @RequirePermissions("workforce.attrition.predict")
  async assessAttrition(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = AssessAttritionRiskSchema.parse(body);
    return this.workforceService.assessEmployeeAttritionRisk(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 7. SKILL SUPPLY & DEMAND INTELLIGENCE
  // ==========================================

  @Get("skills/forecast")
  @RequirePermissions("workforce.skills.forecast")
  async listSkillSupplyDemand(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceService.listSkillSupplyDemand(tenant.tenantId);
  }

  @Post("skills/forecast")
  @RequirePermissions("workforce.skills.forecast")
  async createSkillForecast(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateSkillForecastSchema.parse(body);
    return this.workforceService.createSkillForecast(tenant.tenantId, dto);
  }

  // ==========================================
  // 8. FORECASTING & EXECUTIVE TELEMETRY
  // ==========================================

  @Get("forecasting")
  @RequirePermissions("workforce.analytics.view")
  getForecast(
    @Query("currentHeadcount") headcount?: string,
    @Query("baseCost") baseCost?: string
  ) {
    const count = headcount ? parseInt(headcount, 10) : 240;
    const cost = baseCost ? parseFloat(baseCost) : 850000;
    return this.workforceService.getWorkforceForecast(count, cost);
  }

  @Get("analytics/executive")
  @RequirePermissions("workforce.analytics.view")
  async getExecutiveTelemetry(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceService.getExecutiveTelemetry(tenant.tenantId);
  }
}
