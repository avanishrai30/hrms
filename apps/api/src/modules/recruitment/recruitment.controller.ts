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
import { RecruitmentService } from "./recruitment.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  type OfferApproverRole
} from "@prisma/client";
import {
  ApproveHiringRequestSchema,
  ApproveOfferSchema,
  CreateCandidateSchema,
  CreateHiringRequestSchema,
  CreateJobRequisitionSchema,
  CreateOfferSchema,
  OnboardCandidateSchema,
  PublishRequisitionSchema,
  ScheduleInterviewSchema,
  SubmitInterviewFeedbackSchema,
  UpdateApplicationStageSchema,
  VerifyPreboardingTaskSchema
} from "./recruitment.schemas.js";

@Controller("api/v1/recruitment")
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // 1. Hiring Requests
  @Get("hiring-requests")
  @RequirePermissions("recruitment.read")
  async listHiringRequests(@Req() req: Request, @Query("status") status?: string) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.listHiringRequests(tenant.tenantId, status);
  }

  @Post("hiring-requests")
  @RequirePermissions("recruitment.manage")
  async createHiringRequest(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateHiringRequestSchema.parse(body);
    return this.recruitmentService.createHiringRequest(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("hiring-requests/:id/approve")
  @RequirePermissions("recruitment.manage")
  async approveHiringRequest(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = ApproveHiringRequestSchema.parse(body);
    return this.recruitmentService.approveHiringRequest(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  // 2. Job Requisitions
  @Get("requisitions")
  @RequirePermissions("recruitment.read")
  async listJobRequisitions(@Req() req: Request, @Query("status") status?: string) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.listJobRequisitions(tenant.tenantId, status);
  }

  @Post("requisitions")
  @RequirePermissions("recruitment.manage")
  async createJobRequisition(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateJobRequisitionSchema.parse(body);
    return this.recruitmentService.createJobRequisition(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("requisitions/:id/publish")
  @RequirePermissions("recruitment.manage")
  async publishJobRequisition(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = PublishRequisitionSchema.parse(body || {});
    return this.recruitmentService.publishJobRequisition(tenant.tenantId, id, dto.channel, tenant.userId, tenant.membershipId);
  }

  // 3. Candidates
  @Get("candidates")
  @RequirePermissions("candidates.read")
  async listCandidates(
    @Req() req: Request,
    @Query("query") query?: string,
    @Query("status") status?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.listCandidates(tenant.tenantId, query, status);
  }

  @Get("candidates/:id")
  @RequirePermissions("candidates.read")
  async getCandidate(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.getCandidate(tenant.tenantId, id);
  }

  @Post("candidates")
  @RequirePermissions("candidates.create")
  async createCandidate(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateCandidateSchema.parse(body);
    return this.recruitmentService.createCandidate(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // 4. Applications & ATS Stages
  @Get("applications")
  @RequirePermissions("applications.read")
  async listApplications(
    @Req() req: Request,
    @Query("requisitionId") requisitionId?: string,
    @Query("stage") stage?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.listApplications(tenant.tenantId, requisitionId, stage);
  }

  @Put("applications/:id/stage")
  @RequirePermissions("applications.manage")
  async updateApplicationStage(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = UpdateApplicationStageSchema.parse(body);
    return this.recruitmentService.updateApplicationStage(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  // 5. Interviews
  @Get("interviews")
  @RequirePermissions("interviews.read")
  async listInterviews(
    @Req() req: Request,
    @Query("applicationId") applicationId?: string,
    @Query("status") status?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.listInterviews(tenant.tenantId, applicationId, status);
  }

  @Post("interviews/schedule")
  @RequirePermissions("interviews.schedule")
  async scheduleInterview(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = ScheduleInterviewSchema.parse(body);
    return this.recruitmentService.scheduleInterview(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("interviews/feedback")
  @RequirePermissions("interviews.feedback")
  async submitInterviewFeedback(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = SubmitInterviewFeedbackSchema.parse(body);
    return this.recruitmentService.submitInterviewFeedback(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // 6. Offers
  @Get("offers")
  @RequirePermissions("offers.read")
  async listOffers(@Req() req: Request, @Query("status") status?: string) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.listOffers(tenant.tenantId, status);
  }

  @Post("offers")
  @RequirePermissions("offers.create")
  async createOffer(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateOfferSchema.parse(body);
    return this.recruitmentService.createOffer(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("offers/:id/approve")
  @RequirePermissions("offers.manage")
  async approveOffer(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown,
    @Query("role") role?: string
  ) {
    const tenant = requireTenantContext(req);
    const dto = ApproveOfferSchema.parse(body);
    return this.recruitmentService.approveOffer(tenant.tenantId, id, dto, (role as OfferApproverRole) || "HR", tenant.userId, tenant.membershipId);
  }

  @Post("offers/:id/release")
  @RequirePermissions("offers.manage")
  async releaseOffer(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.releaseOffer(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  // 7. Preboarding
  @Get("preboarding")
  @RequirePermissions("preboarding.read")
  async listPreboardingTasks(@Req() req: Request, @Query("candidateId") candidateId?: string) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.listPreboardingTasks(tenant.tenantId, candidateId);
  }

  @Post("preboarding/:id/verify")
  @RequirePermissions("preboarding.manage")
  async verifyPreboardingTask(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = VerifyPreboardingTaskSchema.parse(body);
    return this.recruitmentService.verifyPreboardingTask(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  // 8. Onboard Hired Candidate
  @Post("candidates/:id/onboard")
  @RequirePermissions("recruitment.manage")
  async onboardCandidate(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = OnboardCandidateSchema.parse(body || {});
    return this.recruitmentService.onboardHiredCandidate(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 9. Analytics & AI Intelligence
  @Get("analytics")
  @RequirePermissions("recruitment.read")
  async getRecruitmentAnalytics(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.getRecruitmentAnalytics(tenant.tenantId);
  }

  @Get("ai-intelligence")
  @RequirePermissions("recruitment.read")
  async getAiRecruitmentIntelligence(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.recruitmentService.getAiRecruitmentIntelligence(tenant.tenantId);
  }
}
