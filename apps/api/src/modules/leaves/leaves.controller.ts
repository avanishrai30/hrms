import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { LeavesService } from "./leaves.service.js";
import {
  adjustBalanceSchema,
  calendarQuerySchema,
  cancelLeaveRequestSchema,
  createHolidaySchema,
  createLeaveRequestSchema,
  createLeaveTypeSchema,
  leaveFilterSchema,
  reviewLeaveRequestSchema,
  updateLeavePolicySchema
} from "./leaves.schemas.js";

@Controller("api/v1/leaves")
export class LeavesController {
  constructor(
    private readonly leavesService: LeavesService,
    private readonly prisma: PrismaService
  ) {}

  @Get("types")
  @RequirePermissions("leave.view")
  async listLeaveTypes(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.leavesService.listLeaveTypes(tenant.tenantId);
  }

  @Post("types")
  @RequirePermissions("leave.manage")
  async createLeaveType(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createLeaveTypeSchema.parse(body);
    return this.leavesService.createLeaveType(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Patch("policies")
  @RequirePermissions("leave.manage")
  async updatePolicy(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = updateLeavePolicySchema.parse(body);
    return this.leavesService.updateLeavePolicy(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("balances/me")
  @RequirePermissions("leave.view")
  async getMyBalances(
    @Req() req: AuthenticatedRequest,
    @Query("year") year?: string
  ) {
    const tenant = requireTenantContext(req);
    const actorUserId = tenant.userId;
    if (!actorUserId) {
      throw new BadRequestException("User ID is required.");
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        tenantId: tenant.tenantId,
        memberships: { some: { userId: actorUserId } }
      }
    });

    if (!employee) {
      throw new NotFoundException("Employee profile not linked to user.");
    }

    return this.leavesService.getEmployeeBalances(
      tenant.tenantId,
      employee.id,
      year ? parseInt(year, 10) : undefined
    );
  }

  @Get("balances/:employeeId")
  @RequirePermissions("leave.view")
  async getEmployeeBalances(
    @Req() req: AuthenticatedRequest,
    @Param("employeeId") employeeId: string,
    @Query("year") year?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.leavesService.getEmployeeBalances(
      tenant.tenantId,
      employeeId,
      year ? parseInt(year, 10) : undefined
    );
  }

  @Post("balances/adjust")
  @RequirePermissions("leave.manage")
  async adjustBalance(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = adjustBalanceSchema.parse(body);
    return this.leavesService.adjustBalance(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("requests")
  @RequirePermissions("leave.create")
  async createLeaveRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createLeaveRequestSchema.parse(body);

    let employeeId = parsed.employeeId;
    if (!employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: {
          tenantId: tenant.tenantId,
          memberships: { some: { userId: tenant.userId } }
        }
      });
      if (!employee) {
        throw new NotFoundException("Employee profile not linked to user.");
      }
      employeeId = employee.id;
    }

    return this.leavesService.createLeaveRequest(
      tenant.tenantId,
      employeeId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("requests/me")
  @RequirePermissions("leave.view")
  async getMyRequests(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const actorUserId = tenant.userId;
    if (!actorUserId) {
      throw new BadRequestException("User ID is required.");
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        tenantId: tenant.tenantId,
        memberships: { some: { userId: actorUserId } }
      }
    });

    if (!employee) {
      throw new NotFoundException("Employee profile not linked to user.");
    }

    const parsed = leaveFilterSchema.parse({ ...(query as Record<string, unknown>), employeeId: employee.id });
    return this.leavesService.listLeaveRequests(tenant.tenantId, parsed);
  }

  @Get("requests")
  @RequirePermissions("leave.view")
  async listLeaveRequests(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = leaveFilterSchema.parse(query);
    return this.leavesService.listLeaveRequests(tenant.tenantId, parsed);
  }

  @Post("requests/:id/approve")
  @RequirePermissions("leave.approve")
  async approveRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = reviewLeaveRequestSchema.parse({ ...(body as Record<string, unknown>), action: "APPROVED" });
    const isHrAdmin = tenant.roles.includes("HR_ADMIN") || tenant.roles.includes("TENANT_ADMIN") || tenant.roles.includes("TENANT_OWNER");
    const approverRole = isHrAdmin ? "HR_ADMIN" : "MANAGER";

    return this.leavesService.reviewLeaveRequest(
      tenant.tenantId,
      id,
      parsed,
      approverRole,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("requests/:id/reject")
  @RequirePermissions("leave.approve")
  async rejectRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = reviewLeaveRequestSchema.parse({ ...(body as Record<string, unknown>), action: "REJECTED" });
    const isHrAdmin = tenant.roles.includes("HR_ADMIN") || tenant.roles.includes("TENANT_ADMIN") || tenant.roles.includes("TENANT_OWNER");
    const approverRole = isHrAdmin ? "HR_ADMIN" : "MANAGER";

    return this.leavesService.reviewLeaveRequest(
      tenant.tenantId,
      id,
      parsed,
      approverRole,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("requests/:id/cancel")
  @RequirePermissions("leave.cancel")
  async cancelRequest(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = cancelLeaveRequestSchema.parse(body);
    const employee = await this.prisma.employee.findFirst({
      where: {
        tenantId: tenant.tenantId,
        memberships: { some: { userId: tenant.userId } }
      }
    });

    return this.leavesService.cancelLeaveRequest(
      tenant.tenantId,
      id,
      employee?.id ?? "",
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("calendar")
  @RequirePermissions("leave.view")
  async getCalendar(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = calendarQuerySchema.parse(query);
    return this.leavesService.getCalendarEvents(tenant.tenantId, parsed);
  }

  @Get("holidays")
  @RequirePermissions("leave.view")
  async listHolidays(
    @Req() req: AuthenticatedRequest,
    @Query("year") year?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.leavesService.listHolidays(
      tenant.tenantId,
      year ? parseInt(year, 10) : undefined
    );
  }

  @Post("holidays")
  @RequirePermissions("leave.manage")
  async createHoliday(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createHolidaySchema.parse(body);
    return this.leavesService.createHoliday(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Delete("holidays/:id")
  @RequirePermissions("leave.manage")
  async deleteHoliday(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.leavesService.deleteHoliday(
      tenant.tenantId,
      id,
      tenant.userId,
      tenant.membershipId
    );
  }
}
