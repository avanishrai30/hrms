import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  CreateEngagementSurveySchema,
  SubmitSurveyResponseSchema,
  CreatePulseSurveySchema,
  SubmitPulseResponseSchema,
  CreateENPSCampaignSchema,
  SubmitENPSResponseSchema,
  CreateRecognitionSchema,
  CreateRewardCatalogItemSchema,
  RedeemRewardSchema,
  CreateCommunitySchema,
  CreateCommunityPostSchema,
  CreateSuggestionSchema,
  CreateInnovationChallengeSchema
} from "./engagement.schemas.js";
import { EngagementService } from "./engagement.service.js";

@Controller("api/v1/engagement")
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get("dashboard")
  @RequirePermissions("engagement.read")
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.getDashboardSummary(tenant.tenantId, tenant.userId);
  }

  // 1. Surveys
  @Get("surveys")
  @RequirePermissions("engagement.read")
  async listSurveys(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listSurveys(tenant.tenantId);
  }

  @Post("surveys")
  @RequirePermissions("engagement.manage")
  async createSurvey(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateEngagementSurveySchema.parse(body);
    return this.engagementService.createSurvey(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("surveys/submit")
  @RequirePermissions("engagement.survey")
  async submitSurveyResponse(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = SubmitSurveyResponseSchema.parse(body);
    return this.engagementService.submitSurveyResponse(tenant.tenantId, tenant.userId, dto);
  }

  // 2. Pulse Surveys
  @Get("pulse")
  @RequirePermissions("engagement.read")
  async listPulseSurveys(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listPulseSurveys(tenant.tenantId);
  }

  @Post("pulse")
  @RequirePermissions("engagement.manage")
  async createPulseSurvey(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreatePulseSurveySchema.parse(body);
    return this.engagementService.createPulseSurvey(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("pulse/submit")
  @RequirePermissions("engagement.survey")
  async submitPulseResponse(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = SubmitPulseResponseSchema.parse(body);
    return this.engagementService.submitPulseResponse(tenant.tenantId, tenant.userId, dto);
  }

  // 3. eNPS Campaigns
  @Get("enps")
  @RequirePermissions("engagement.read")
  async listENPSCampaigns(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listENPSCampaigns(tenant.tenantId);
  }

  @Post("enps")
  @RequirePermissions("engagement.manage")
  async createENPSCampaign(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateENPSCampaignSchema.parse(body);
    return this.engagementService.createENPSCampaign(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("enps/submit")
  @RequirePermissions("engagement.survey")
  async submitENPSResponse(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = SubmitENPSResponseSchema.parse(body);
    return this.engagementService.submitENPSResponse(tenant.tenantId, tenant.userId, dto);
  }

  // 4. Recognitions
  @Get("recognition")
  @RequirePermissions("engagement.read")
  async listRecognitions(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listRecognitions(tenant.tenantId);
  }

  @Post("recognition")
  @RequirePermissions("engagement.recognition")
  async createRecognition(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateRecognitionSchema.parse(body);
    return this.engagementService.createRecognition(
      tenant.tenantId,
      tenant.userId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 5. Rewards & Catalog
  @Get("catalog")
  @RequirePermissions("engagement.read")
  async getRewardCatalog(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.getRewardCatalog(tenant.tenantId);
  }

  @Post("catalog")
  @RequirePermissions("engagement.manage")
  async createRewardCatalogItem(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateRewardCatalogItemSchema.parse(body);
    return this.engagementService.createRewardCatalogItem(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("redeem")
  @RequirePermissions("engagement.rewards")
  async redeemReward(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = RedeemRewardSchema.parse(body);
    return this.engagementService.redeemReward(
      tenant.tenantId,
      tenant.userId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 6. Communities & Social Wall
  @Get("communities")
  @RequirePermissions("engagement.read")
  async listCommunities(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listCommunities(tenant.tenantId);
  }

  @Post("communities")
  @RequirePermissions("engagement.read")
  async createCommunity(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateCommunitySchema.parse(body);
    return this.engagementService.createCommunity(tenant.tenantId, tenant.userId, dto);
  }

  @Get("posts")
  @RequirePermissions("engagement.read")
  async listCommunityPosts(
    @Req() req: AuthenticatedRequest,
    @Query("communityId") communityId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listCommunityPosts(tenant.tenantId, communityId);
  }

  @Post("posts")
  @RequirePermissions("engagement.read")
  async createCommunityPost(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateCommunityPostSchema.parse(body);
    return this.engagementService.createCommunityPost(tenant.tenantId, tenant.userId, dto);
  }

  // 7. Suggestions & Challenges
  @Get("suggestions")
  @RequirePermissions("engagement.read")
  async listSuggestions(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listSuggestions(tenant.tenantId);
  }

  @Post("suggestions")
  @RequirePermissions("engagement.read")
  async createSuggestion(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateSuggestionSchema.parse(body);
    return this.engagementService.createSuggestion(tenant.tenantId, tenant.userId, dto);
  }

  @Get("challenges")
  @RequirePermissions("engagement.read")
  async listInnovationChallenges(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.listInnovationChallenges(tenant.tenantId);
  }

  @Post("challenges")
  @RequirePermissions("engagement.manage")
  async createInnovationChallenge(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateInnovationChallengeSchema.parse(body);
    return this.engagementService.createInnovationChallenge(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 8. Analytics & AI
  @Get("analytics")
  @RequirePermissions("engagement.analytics")
  async getCultureAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.getCultureAnalytics(tenant.tenantId);
  }

  @Get("ai")
  @RequirePermissions("engagement.ai")
  async getAiEngagementInsights(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.engagementService.getAiEngagementInsights(tenant.tenantId);
  }
}
