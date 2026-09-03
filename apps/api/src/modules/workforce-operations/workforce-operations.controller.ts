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
import { WorkforceOperationsService } from "./workforce-operations.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  CreateBiometricDeviceSchema,
  UpdateBiometricDeviceSchema,
  SyncBiometricPunchSchema,
  CreateShiftSwapRequestSchema,
  ReviewShiftSwapSchema,
  CreateOvertimeRequestSchema,
  ReviewOvertimeRequestSchema,
  CreateAttendanceAnomalySchema,
  ResolveAttendanceAnomalySchema,
  CreateContractorAttendanceSchema,
  CreateWorkforceScheduleSchema,
  GeoFencePunchValidationSchema,
  FaceAttendanceVerificationSchema
} from "./workforce-operations.schemas.js";

@Controller(["attendance-ops", "api/v1/attendance-ops"])
export class WorkforceOperationsController {
  constructor(
    private readonly workforceOpsService: WorkforceOperationsService
  ) {}

  // ==========================================
  // 1. SHIFT MANAGEMENT & ROSTER SWAPS
  // ==========================================

  @Get("shifts")
  @RequirePermissions("attendance.view")
  async listShifts(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.listShifts(tenant.tenantId);
  }

  @Get("swaps")
  @RequirePermissions("attendance.view")
  async listShiftSwapRequests(
    @Req() req: Request,
    @Query("employeeId") employeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.listShiftSwapRequests(tenant.tenantId, employeeId);
  }

  @Post("swaps")
  @RequirePermissions("attendance.shifts.manage")
  async createShiftSwapRequest(
    @Req() req: Request,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateShiftSwapRequestSchema.parse(body);
    return this.workforceOpsService.createShiftSwapRequest(
      tenant.tenantId,
      tenant.userId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Put("swaps/:id/review")
  @RequirePermissions("attendance.shifts.manage")
  async reviewShiftSwap(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = ReviewShiftSwapSchema.parse(body);
    return this.workforceOpsService.reviewShiftSwapRequest(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // ==========================================
  // 2. BIOMETRIC DEVICES
  // ==========================================

  @Get("devices")
  @RequirePermissions("attendance.devices.manage")
  async listBiometricDevices(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.listBiometricDevices(tenant.tenantId);
  }

  @Post("devices")
  @RequirePermissions("attendance.devices.manage")
  async createBiometricDevice(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateBiometricDeviceSchema.parse(body);
    return this.workforceOpsService.createBiometricDevice(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Put("devices/:id")
  @RequirePermissions("attendance.devices.manage")
  async updateBiometricDevice(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = UpdateBiometricDeviceSchema.parse(body);
    return this.workforceOpsService.updateBiometricDevice(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("devices/punch")
  @RequirePermissions("attendance.biometric.sync")
  async recordBiometricPunch(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = SyncBiometricPunchSchema.parse(body);
    return this.workforceOpsService.recordBiometricPunch(tenant.tenantId, dto);
  }

  // ==========================================
  // 3. GEOFENCE VALIDATION
  // ==========================================

  @Post("geofence/validate")
  @RequirePermissions("attendance.geofence.manage")
  async validateGeoFence(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = GeoFencePunchValidationSchema.parse(body);
    return this.workforceOpsService.validateGeoFencePunch(tenant.tenantId, dto);
  }

  // ==========================================
  // 4. FACE RECOGNITION ATTENDANCE
  // ==========================================

  @Post("face/verify")
  @RequirePermissions("attendance.view")
  async verifyFaceAttendance(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = FaceAttendanceVerificationSchema.parse(body);
    return this.workforceOpsService.verifyFaceAttendance(tenant.tenantId, dto);
  }

  // ==========================================
  // 5. OVERTIME MANAGEMENT
  // ==========================================

  @Get("overtime")
  @RequirePermissions("attendance.view")
  async listOvertimeRequests(
    @Req() req: Request,
    @Query("employeeId") employeeId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.listOvertimeRequests(tenant.tenantId, employeeId);
  }

  @Post("overtime")
  @RequirePermissions("attendance.view")
  async createOvertimeRequest(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateOvertimeRequestSchema.parse(body);
    return this.workforceOpsService.createOvertimeRequest(
      tenant.tenantId,
      tenant.userId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Put("overtime/:id/review")
  @RequirePermissions("attendance.overtime.manage")
  async reviewOvertimeRequest(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = ReviewOvertimeRequestSchema.parse(body);
    return this.workforceOpsService.reviewOvertimeRequest(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // ==========================================
  // 6. ATTENDANCE ANOMALY ENGINE
  // ==========================================

  @Get("anomalies")
  @RequirePermissions("attendance.anomalies.manage")
  async listAttendanceAnomalies(
    @Req() req: Request,
    @Query("isResolved") isResolved?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.listAttendanceAnomalies(
      tenant.tenantId,
      isResolved !== undefined ? isResolved === "true" : undefined
    );
  }

  @Post("anomalies")
  @RequirePermissions("attendance.anomalies.manage")
  async createAttendanceAnomaly(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateAttendanceAnomalySchema.parse(body);
    return this.workforceOpsService.createAttendanceAnomaly(tenant.tenantId, dto);
  }

  @Put("anomalies/:id/resolve")
  @RequirePermissions("attendance.anomalies.manage")
  async resolveAttendanceAnomaly(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = ResolveAttendanceAnomalySchema.parse(body);
    return this.workforceOpsService.resolveAttendanceAnomaly(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // ==========================================
  // 7. CONTRACTOR WORKFORCE ATTENDANCE
  // ==========================================

  @Get("contractors")
  @RequirePermissions("attendance.contractors.manage")
  async listContractorAttendances(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.listContractorAttendances(tenant.tenantId);
  }

  @Post("contractors")
  @RequirePermissions("attendance.contractors.manage")
  async recordContractorAttendance(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateContractorAttendanceSchema.parse(body);
    return this.workforceOpsService.recordContractorAttendance(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // ==========================================
  // 8. WORKFORCE SCHEDULING
  // ==========================================

  @Get("schedules")
  @RequirePermissions("attendance.scheduling.manage")
  async listWorkforceSchedules(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.listWorkforceSchedules(tenant.tenantId);
  }

  @Post("schedules")
  @RequirePermissions("attendance.scheduling.manage")
  async createWorkforceSchedule(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateWorkforceScheduleSchema.parse(body);
    return this.workforceOpsService.createWorkforceSchedule(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // ==========================================
  // 9. PRODUCTIVITY & COMMAND CENTER
  // ==========================================

  @Get("productivity")
  @RequirePermissions("attendance.view")
  getProductivityMetrics() {
    return this.workforceOpsService.getProductivityMetrics();
  }

  @Get("command-center")
  @RequirePermissions("workforce.operations.view")
  async getCommandCenterTelemetry(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.workforceOpsService.getCommandCenterTelemetry(tenant.tenantId);
  }
}
