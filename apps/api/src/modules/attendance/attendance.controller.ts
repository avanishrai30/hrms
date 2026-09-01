import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type CorrectionStatus } from "@prisma/client";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  attendanceFilterSchema,
  attendanceRuleSchema,
  checkInSchema,
  checkOutSchema,
  createCorrectionSchema,
  manualAttendanceSchema,
  reviewCorrectionSchema,
  updateAttendanceSchema,
  type AttendanceFilterDto,
  type AttendanceRuleDto,
  type CheckInDto,
  type CheckOutDto,
  type CreateCorrectionDto,
  type ManualAttendanceDto,
  type ReviewCorrectionDto,
  type UpdateAttendanceDto
} from "./attendance.schemas.js";
import { AttendanceService } from "./attendance.service.js";

@Controller("attendance")
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly prisma: PrismaService
  ) {}

  private async resolveEmployeeId(tenantId: string, membershipId: string, employeeId?: string): Promise<string> {
    if (employeeId) return employeeId;
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { id: membershipId, tenantId },
      select: { employeeId: true }
    });
    if (!membership?.employeeId) {
      throw new BadRequestException("No employee profile is linked to your user account.");
    }
    return membership.employeeId;
  }

  @Post("check-in")
  @RequirePermissions("attendance.create")
  async checkIn(
    @Body(new ZodValidationPipe(checkInSchema)) body: CheckInDto,
    @Query("employeeId") employeeIdQuery: string | undefined,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, employeeIdQuery);
    return this.attendanceService.checkIn(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }

  @Post("check-out")
  @RequirePermissions("attendance.create")
  async checkOut(
    @Body(new ZodValidationPipe(checkOutSchema)) body: CheckOutDto,
    @Query("employeeId") employeeIdQuery: string | undefined,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, employeeIdQuery);
    return this.attendanceService.checkOut(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }

  @Get("me/today")
  @RequirePermissions("attendance.view")
  async getToday(@Query("employeeId") employeeIdQuery: string | undefined, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, employeeIdQuery);
    return this.attendanceService.getTodayAttendance(tenant.tenantId, employeeId);
  }

  @Get("me/history")
  @RequirePermissions("attendance.view")
  async getHistory(
    @Query(new ZodValidationPipe(attendanceFilterSchema)) query: AttendanceFilterDto,
    @Query("employeeId") employeeIdQuery: string | undefined,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, employeeIdQuery);
    return this.attendanceService.getEmployeeHistory(tenant.tenantId, employeeId, query);
  }

  @Get("me/timeline")
  @RequirePermissions("attendance.view")
  async getTimeline(@Query("employeeId") employeeIdQuery: string | undefined, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, employeeIdQuery);
    return this.attendanceService.getAttendanceTimeline(tenant.tenantId, employeeId);
  }

  @Get("dashboard/employee")
  @RequirePermissions("attendance.view")
  async getEmployeeDashboard(@Query("employeeId") employeeIdQuery: string | undefined, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, employeeIdQuery);
    return this.attendanceService.getEmployeeDashboard(tenant.tenantId, employeeId);
  }

  @Get("dashboard/hr")
  @RequirePermissions("attendance.view")
  getHrDashboard(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.getHrDashboard(tenant.tenantId);
  }

  @Get("dashboard/manager")
  @RequirePermissions("attendance.view")
  async getManagerDashboard(@Query("managerEmployeeId") managerIdQuery: string | undefined, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    const managerId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, managerIdQuery);
    return this.attendanceService.getManagerDashboard(tenant.tenantId, managerId);
  }

  @Get()
  @RequirePermissions("attendance.view")
  listAttendance(@Query(new ZodValidationPipe(attendanceFilterSchema)) query: AttendanceFilterDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.listAttendance(tenant.tenantId, query);
  }

  @Post("manual")
  @RequirePermissions("attendance.create")
  recordManualAttendance(@Body(new ZodValidationPipe(manualAttendanceSchema)) body: ManualAttendanceDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.recordManualAttendance(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":id")
  @RequirePermissions("attendance.update")
  updateAttendance(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateAttendanceSchema)) body: UpdateAttendanceDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.updateAttendance(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }

  @Post("corrections")
  @RequirePermissions("attendance.correct")
  async requestCorrection(
    @Body(new ZodValidationPipe(createCorrectionSchema)) body: CreateCorrectionDto,
    @Query("employeeId") employeeIdQuery: string | undefined,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, employeeIdQuery);
    return this.attendanceService.requestCorrection(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }

  @Get("corrections")
  @RequirePermissions("attendance.view")
  listCorrections(
    @Query("status") status: CorrectionStatus | undefined,
    @Query("employeeId") employeeId: string | undefined,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.listCorrections(tenant.tenantId, status, employeeId);
  }

  @Patch("corrections/:id/review")
  @RequirePermissions("attendance.approve")
  reviewCorrection(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reviewCorrectionSchema)) body: ReviewCorrectionDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.reviewCorrection(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }

  @Get("rules")
  @RequirePermissions("attendance.view")
  getRules(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.getRulesConfig(tenant.tenantId);
  }

  @Patch("rules")
  @RequirePermissions("attendance.update")
  updateRules(@Body(new ZodValidationPipe(attendanceRuleSchema)) body: AttendanceRuleDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.attendanceService.updateRules(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }
}
