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
import { type FaceEnrollmentStatus } from "@prisma/client";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  biometricAuditFilterSchema,
  enrollFaceSchema,
  reviewEnrollmentSchema,
  verifyFaceSchema,
  type BiometricAuditFilterDto,
  type EnrollFaceDto,
  type ReviewEnrollmentDto,
  type VerifyFaceDto
} from "./face.schemas.js";
import { FaceService } from "./face.service.js";

@Controller("face")
export class FaceController {
  constructor(
    private readonly faceService: FaceService,
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

  @Get("profile/me")
  @RequirePermissions("face.view")
  async getMyProfile(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId);
    return this.faceService.getFaceProfile(tenant.tenantId, employeeId);
  }

  @Get("profiles/:employeeId")
  @RequirePermissions("face.view")
  getEmployeeProfile(@Param("employeeId") employeeId: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.faceService.getFaceProfile(tenant.tenantId, employeeId);
  }

  @Post("enroll")
  @RequirePermissions("face.enroll")
  async enrollFace(
    @Body(new ZodValidationPipe(enrollFaceSchema)) body: EnrollFaceDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, body.employeeId);
    return this.faceService.submitEnrollment(
      tenant.tenantId,
      employeeId,
      body,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("enrollments")
  @RequirePermissions("face.manage")
  listEnrollments(
    @Query("status") status: FaceEnrollmentStatus | undefined,
    @Query("employeeId") employeeId: string | undefined,
    @Query("page") page: string | undefined,
    @Query("limit") limit: string | undefined,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.faceService.listEnrollments(tenant.tenantId, {
      status,
      employeeId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });
  }

  @Patch("enrollments/:id/review")
  @RequirePermissions("face.manage")
  reviewEnrollment(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reviewEnrollmentSchema)) body: ReviewEnrollmentDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.faceService.reviewEnrollment(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }

  @Post("verify")
  @RequirePermissions("face.verify")
  async verifyFace(
    @Body(new ZodValidationPipe(verifyFaceSchema)) body: VerifyFaceDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    const employeeId = await this.resolveEmployeeId(tenant.tenantId, tenant.membershipId, body.employeeId);
    return this.faceService.verifyFace(tenant.tenantId, employeeId, body, tenant.userId);
  }

  @Patch("profiles/:id/disable")
  @RequirePermissions("face.manage")
  disableProfile(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.faceService.disableFaceProfile(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  @Get("audit/verifications")
  @RequirePermissions("face.audit")
  listVerifications(
    @Query(new ZodValidationPipe(biometricAuditFilterSchema)) query: BiometricAuditFilterDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.faceService.listVerifications(tenant.tenantId, query);
  }
}
