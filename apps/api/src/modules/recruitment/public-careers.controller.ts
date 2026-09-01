import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query
} from "@nestjs/common";
import { Public } from "../rbac/permissions.decorator.js";
import { RecruitmentService } from "./recruitment.service.js";
import {
  CandidateOfferDecisionSchema,
  PublicApplySchema
} from "./recruitment.schemas.js";

@Public()
@Controller("api/v1/public/careers")
export class PublicCareersController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get("jobs")
  async getPublicJobs(@Query("tenantSlug") tenantSlug?: string) {
    return this.recruitmentService.getPublicJobs(tenantSlug);
  }

  @Get("jobs/:slug")
  async getPublicJobBySlug(@Param("slug") slug: string) {
    return this.recruitmentService.getPublicJobBySlug(slug);
  }

  @Post("apply")
  async publicApply(@Body() body: unknown) {
    const dto = PublicApplySchema.parse(body);
    return this.recruitmentService.publicApply(dto);
  }

  @Get("applications/:code/status")
  async getApplicationStatus(@Param("code") code: string) {
    return this.recruitmentService.getApplicationStatusByCode(code);
  }

  @Post("offers/:code/decision")
  async candidateOfferDecision(
    @Param("code") code: string,
    @Body() body: unknown
  ) {
    const dto = CandidateOfferDecisionSchema.parse(body);
    return this.recruitmentService.candidateOfferDecision(code, dto);
  }

  @Post("preboarding/:taskId/submit")
  async candidateSubmitPreboarding(
    @Param("taskId") taskId: string,
    @Body() body: Record<string, unknown>
  ) {
    return this.recruitmentService.candidateSubmitPreboardingTask(taskId, body);
  }
}
