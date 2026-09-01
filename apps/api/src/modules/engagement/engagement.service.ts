import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { type Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { EnpsEngine } from "./engines/enps.engine.js";
import { RecognitionEngine } from "./engines/recognition.engine.js";
import { RewardEngine } from "./engines/reward.engine.js";
import { SentimentEngine } from "./engines/sentiment.engine.js";
import { CultureAnalyticsEngine } from "./engines/culture-analytics.engine.js";
import { EngagementAiEngine } from "./engines/engagement-ai.engine.js";
import type {
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
import { z } from "zod";

@Injectable()
export class EngagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  // 1. Dashboard Aggregations
  async getDashboardSummary(tenantId: string, employeeId?: string) {
    const [
      surveysCount,
      pulseCount,
      recognitionsCount,
      activeCampaign,
      walletLedger,
      activeChallenges
    ] = await Promise.all([
      this.prisma.engagementSurvey.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.pulseSurvey.count({ where: { tenantId, isActive: true } }),
      this.prisma.recognition.count({ where: { tenantId } }),
      this.prisma.eNPSCampaign.findFirst({
        where: { tenantId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" }
      }),
      employeeId
        ? this.prisma.rewardPointLedger.findFirst({
            where: { tenantId, employeeId },
            orderBy: { createdAt: "desc" }
          })
        : null,
      this.prisma.innovationChallenge.count({ where: { tenantId, status: "OPEN" } })
    ]);

    const walletBalance = walletLedger ? walletLedger.balanceAfter : 250;

    return {
      activeSurveysCount: surveysCount,
      activePulseCount: pulseCount,
      totalRecognitionsCount: recognitionsCount,
      activeENPSCampaign: activeCampaign,
      walletBalance,
      openChallengesCount: activeChallenges,
      cultureHealthScore: 84.5
    };
  }

  // 2. Engagement Surveys
  async listSurveys(tenantId: string) {
    return this.prisma.engagementSurvey.findMany({
      where: { tenantId },
      include: { questions: { orderBy: { order: "asc" } }, _count: { select: { responses: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async createSurvey(
    tenantId: string,
    dto: z.infer<typeof CreateEngagementSurveySchema>,
    userId: string,
    membershipId?: string
  ) {
    const totalEmployees = await this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } });

    const survey = await this.prisma.engagementSurvey.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        surveyType: dto.surveyType,
        isAnonymous: dto.isAnonymous,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        targetDepartmentId: dto.targetDepartmentId,
        targetLocationId: dto.targetLocationId,
        totalInvited: totalEmployees,
        status: "ACTIVE",
        questions: {
          create: dto.questions.map((q, idx) => ({
            tenantId,
            questionText: q.questionText,
            questionType: q.questionType,
            category: q.category,
            isRequired: q.isRequired,
            order: idx + 1,
            options: q.options as unknown as Prisma.InputJsonValue
          }))
        }
      },
      include: { questions: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "ENGAGEMENT_SURVEY_CREATED",
      resourceType: "EngagementSurvey",
      resourceId: survey.id,
      metadata: { title: dto.title }
    });

    return survey;
  }

  async submitSurveyResponse(
    tenantId: string,
    employeeId: string,
    dto: z.infer<typeof SubmitSurveyResponseSchema>
  ) {
    const survey = await this.prisma.engagementSurvey.findUnique({
      where: { id: dto.surveyId }
    });
    if (!survey) throw new NotFoundException("Survey not found.");

    const responsesToCreate = dto.answers.map((a) => {
      const sentiment = a.textValue ? SentimentEngine.analyzeText(a.textValue).score : null;
      return {
        tenantId,
        surveyId: dto.surveyId,
        questionId: a.questionId,
        employeeId: survey.isAnonymous ? null : employeeId,
        ratingValue: a.ratingValue,
        textValue: a.textValue,
        selectedOptions: a.selectedOptions as unknown as Prisma.InputJsonValue,
        sentimentScore: sentiment
      };
    });

    await this.prisma.surveyResponse.createMany({
      data: responsesToCreate
    });

    await this.prisma.engagementSurvey.update({
      where: { id: dto.surveyId },
      data: { totalResponded: { increment: 1 } }
    });

    return { success: true, message: "Survey responses submitted successfully." };
  }

  // 3. Pulse Surveys
  async listPulseSurveys(tenantId: string) {
    return this.prisma.pulseSurvey.findMany({
      where: { tenantId },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async createPulseSurvey(
    tenantId: string,
    dto: z.infer<typeof CreatePulseSurveySchema>,
    userId: string,
    membershipId?: string
  ) {
    const pulse = await this.prisma.pulseSurvey.create({
      data: {
        tenantId,
        title: dto.title,
        questionText: dto.questionText,
        frequency: dto.frequency,
        category: dto.category,
        isActive: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "PULSE_SURVEY_CREATED",
      resourceType: "PulseSurvey",
      resourceId: pulse.id,
      metadata: { title: dto.title }
    });

    return pulse;
  }

  async submitPulseResponse(
    tenantId: string,
    employeeId: string,
    dto: z.infer<typeof SubmitPulseResponseSchema>
  ) {
    const response = await this.prisma.pulseResponse.create({
      data: {
        tenantId,
        pulseSurveyId: dto.pulseSurveyId,
        employeeId,
        happinessRating: dto.happinessRating,
        stressRating: dto.stressRating,
        energyRating: dto.energyRating,
        note: dto.note
      }
    });

    await this.prisma.pulseSurvey.update({
      where: { id: dto.pulseSurveyId },
      data: { totalResponses: { increment: 1 } }
    });

    return response;
  }

  // 4. eNPS Campaigns
  async listENPSCampaigns(tenantId: string) {
    return this.prisma.eNPSCampaign.findMany({
      where: { tenantId },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async createENPSCampaign(
    tenantId: string,
    dto: z.infer<typeof CreateENPSCampaignSchema>,
    userId: string,
    membershipId?: string
  ) {
    const campaign = await this.prisma.eNPSCampaign.create({
      data: {
        tenantId,
        title: dto.title,
        quarter: dto.quarter,
        year: dto.year,
        status: "ACTIVE"
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "ENPS_CAMPAIGN_CREATED",
      resourceType: "ENPSCampaign",
      resourceId: campaign.id,
      metadata: { quarter: dto.quarter, year: dto.year }
    });

    return campaign;
  }

  async submitENPSResponse(
    tenantId: string,
    employeeId: string,
    dto: z.infer<typeof SubmitENPSResponseSchema>
  ) {
    const category = EnpsEngine.categorizeScore(dto.score);
    const sentiment = dto.feedbackText ? SentimentEngine.analyzeText(dto.feedbackText).label : "NEUTRAL";

    const response = await this.prisma.eNPSResponse.create({
      data: {
        tenantId,
        campaignId: dto.campaignId,
        employeeId,
        score: dto.score,
        category,
        feedbackText: dto.feedbackText,
        sentiment
      }
    });

    // Recalculate campaign eNPS score
    const allResponses = await this.prisma.eNPSResponse.findMany({
      where: { campaignId: dto.campaignId },
      select: { score: true }
    });

    const enpsCalc = EnpsEngine.calculateEnps({ scores: allResponses.map((r) => r.score) });

    await this.prisma.eNPSCampaign.update({
      where: { id: dto.campaignId },
      data: {
        totalResponses: enpsCalc.totalResponses,
        promotersCount: enpsCalc.promotersCount,
        passivesCount: enpsCalc.passivesCount,
        detractorsCount: enpsCalc.detractorsCount,
        enpsScore: enpsCalc.enpsScore
      }
    });

    return response;
  }

  // 5. Recognitions & Peer Appreciation
  async listRecognitions(tenantId: string) {
    return this.prisma.recognition.findMany({
      where: { tenantId },
      include: {
        sender: { select: { id: true, fullName: true, department: true } },
        receiver: { select: { id: true, fullName: true, department: true } },
        badge: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createRecognition(
    tenantId: string,
    senderEmployeeId: string,
    dto: z.infer<typeof CreateRecognitionSchema>,
    userId: string,
    membershipId?: string
  ) {
    const recognition = await this.prisma.recognition.create({
      data: {
        tenantId,
        senderEmployeeId,
        receiverEmployeeId: dto.receiverEmployeeId,
        badgeId: dto.badgeId,
        recognitionType: dto.recognitionType,
        message: dto.message,
        pointsAwarded: dto.pointsAwarded,
        isPublic: dto.isPublic
      },
      include: { sender: true, receiver: true, badge: true }
    });

    // Add reward points to receiver's ledger
    const lastLedger = await this.prisma.rewardPointLedger.findFirst({
      where: { tenantId, employeeId: dto.receiverEmployeeId },
      orderBy: { createdAt: "desc" }
    });
    const currentBalance = lastLedger ? lastLedger.balanceAfter : 0;
    const newBalance = currentBalance + dto.pointsAwarded;

    await this.prisma.rewardPointLedger.create({
      data: {
        tenantId,
        employeeId: dto.receiverEmployeeId,
        transactionType: "POINTS_EARNED",
        points: dto.pointsAwarded,
        balanceAfter: newBalance,
        referenceType: "RECOGNITION",
        referenceId: recognition.id,
        notes: `Kudos received from ${recognition.sender.fullName}: "${dto.message}"`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "RECOGNITION_SENT",
      resourceType: "Recognition",
      resourceId: recognition.id,
      metadata: { receiverId: dto.receiverEmployeeId, points: dto.pointsAwarded }
    });

    return recognition;
  }

  // 6. Reward Wallet & Catalog
  async getRewardCatalog(tenantId: string) {
    return this.prisma.rewardCatalog.findMany({
      where: { tenantId, isActive: true },
      orderBy: { pointsCost: "asc" }
    });
  }

  async createRewardCatalogItem(
    tenantId: string,
    dto: z.infer<typeof CreateRewardCatalogItemSchema>,
    userId: string,
    membershipId?: string
  ) {
    const item = await this.prisma.rewardCatalog.create({
      data: {
        tenantId,
        itemName: dto.itemName,
        category: dto.category,
        pointsCost: dto.pointsCost,
        cashValueEquivalent: dto.cashValueEquivalent,
        stockQuantity: dto.stockQuantity,
        imageUrl: dto.imageUrl,
        description: dto.description,
        isActive: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "REWARD_CATALOG_ITEM_CREATED",
      resourceType: "RewardCatalog",
      resourceId: item.id,
      metadata: { itemName: dto.itemName, points: dto.pointsCost }
    });

    return item;
  }

  async redeemReward(
    tenantId: string,
    employeeId: string,
    dto: z.infer<typeof RedeemRewardSchema>,
    userId: string,
    membershipId?: string
  ) {
    const item = await this.prisma.rewardCatalog.findUnique({
      where: { id: dto.catalogItemId }
    });
    if (!item) throw new NotFoundException("Reward item not found.");

    const lastLedger = await this.prisma.rewardPointLedger.findFirst({
      where: { tenantId, employeeId },
      orderBy: { createdAt: "desc" }
    });
    const currentBalance = lastLedger ? lastLedger.balanceAfter : 0;

    const validation = RewardEngine.validateRedemption({
      employeeCurrentBalance: currentBalance,
      itemPointsCost: item.pointsCost,
      itemStockQuantity: item.stockQuantity,
      isItemActive: item.isActive
    });

    if (!validation.isValid) {
      throw new BadRequestException(validation.errorMessage);
    }

    const redemption = await this.prisma.rewardRedemption.create({
      data: {
        tenantId,
        employeeId,
        catalogItemId: item.id,
        pointsRedeemed: item.pointsCost,
        status: "APPROVED",
        fulfillmentDetails: dto.fulfillmentDetails as unknown as Prisma.InputJsonValue
      },
      include: { catalogItem: true }
    });

    await this.prisma.rewardPointLedger.create({
      data: {
        tenantId,
        employeeId,
        transactionType: "POINTS_REDEEMED",
        points: item.pointsCost,
        balanceAfter: validation.newBalanceAfterRedemption,
        referenceType: "REDEMPTION",
        referenceId: redemption.id,
        notes: `Redeemed ${item.itemName} for ${item.pointsCost} points.`
      }
    });

    await this.prisma.rewardCatalog.update({
      where: { id: item.id },
      data: { stockQuantity: { decrement: 1 } }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "REWARD_REDEEMED",
      resourceType: "RewardRedemption",
      resourceId: redemption.id,
      metadata: { item: item.itemName, points: item.pointsCost }
    });

    return redemption;
  }

  // 7. Communities & Social Wall
  async listCommunities(tenantId: string) {
    return this.prisma.employeeCommunity.findMany({
      where: { tenantId },
      include: { _count: { select: { members: true, posts: true } } },
      orderBy: { memberCount: "desc" }
    });
  }

  async createCommunity(
    tenantId: string,
    createdById: string,
    dto: z.infer<typeof CreateCommunitySchema>
  ) {
    return this.prisma.employeeCommunity.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        communityType: dto.communityType,
        icon: dto.icon,
        isPrivate: dto.isPrivate,
        createdById,
        members: {
          create: {
            tenantId,
            employeeId: createdById,
            role: "ADMIN"
          }
        }
      }
    });
  }

  async listCommunityPosts(tenantId: string, communityId?: string) {
    return this.prisma.communityPost.findMany({
      where: { tenantId, ...(communityId ? { communityId } : {}) },
      include: {
        author: { select: { id: true, fullName: true, department: true } },
        community: { select: { id: true, name: true, icon: true } },
        comments: {
          include: { author: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: "asc" }
        },
        reactions: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createCommunityPost(
    tenantId: string,
    authorEmployeeId: string,
    dto: z.infer<typeof CreateCommunityPostSchema>
  ) {
    return this.prisma.communityPost.create({
      data: {
        tenantId,
        communityId: dto.communityId,
        authorEmployeeId,
        postType: dto.postType,
        content: dto.content,
        mediaUrls: dto.mediaUrls as unknown as Prisma.InputJsonValue
      },
      include: { author: true, community: true }
    });
  }

  // 8. Suggestions & Innovation Challenges
  async listSuggestions(tenantId: string) {
    return this.prisma.suggestion.findMany({
      where: { tenantId },
      include: {
        employee: { select: { id: true, fullName: true, department: true } },
        _count: { select: { votes: true } }
      },
      orderBy: { upvotesCount: "desc" }
    });
  }

  async createSuggestion(
    tenantId: string,
    employeeId: string,
    dto: z.infer<typeof CreateSuggestionSchema>
  ) {
    return this.prisma.suggestion.create({
      data: {
        tenantId,
        employeeId: dto.isAnonymous ? null : employeeId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        status: "SUBMITTED"
      }
    });
  }

  async listInnovationChallenges(tenantId: string) {
    return this.prisma.innovationChallenge.findMany({
      where: { tenantId },
      include: {
        submissions: {
          include: { employee: { select: { id: true, fullName: true, department: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createInnovationChallenge(
    tenantId: string,
    dto: z.infer<typeof CreateInnovationChallengeSchema>,
    userId: string,
    membershipId?: string
  ) {
    const challenge = await this.prisma.innovationChallenge.create({
      data: {
        tenantId,
        title: dto.title,
        theme: dto.theme,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        rewardPointsPool: dto.rewardPointsPool,
        status: "OPEN"
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "INNOVATION_CHALLENGE_CREATED",
      resourceType: "InnovationChallenge",
      resourceId: challenge.id,
      metadata: { title: dto.title }
    });

    return challenge;
  }

  // 9. Analytics & Culture Health Index
  async getCultureAnalytics(tenantId: string) {
    const [surveys, enpsList, pulseList, recognitions] = await Promise.all([
      this.prisma.engagementSurvey.findMany({ where: { tenantId }, take: 5 }),
      this.prisma.eNPSCampaign.findMany({ where: { tenantId }, take: 5 }),
      this.prisma.pulseSurvey.findMany({ where: { tenantId }, take: 5 }),
      this.prisma.recognition.findMany({ where: { tenantId }, take: 50 })
    ]);

    const activeEnps = enpsList[0]?.enpsScore ?? 42.5;
    const avgHappiness = 4.2;

    const chiResult = CultureAnalyticsEngine.computeCultureHealth({
      engagementScore: 82.0,
      enpsScore: activeEnps,
      averageHappinessRating: avgHappiness,
      monthlyRecognitionsPerEmployee: 1.8,
      burnoutRiskAverage: 18.0
    });

    return {
      cultureHealth: chiResult,
      surveysOverview: surveys,
      enpsHistory: enpsList,
      pulseSurveys: pulseList,
      recognitionActivity: RecognitionEngine.analyzeRecognitions(
        recognitions.map((r) => ({
          id: r.id,
          senderEmployeeId: r.senderEmployeeId,
          receiverEmployeeId: r.receiverEmployeeId,
          recognitionType: r.recognitionType,
          pointsAwarded: r.pointsAwarded
        }))
      )
    };
  }

  // 10. AI Predictive Insights
  async getAiEngagementInsights(tenantId: string) {
    const departments = await this.prisma.department.findMany({
      where: { tenantId },
      include: { _count: { select: { employees: true } } }
    });

    const mockSignals = departments.map((d) => ({
      departmentName: d.name,
      headcount: d._count.employees || 25,
      participationRate: 78.5,
      enpsScore: 35.0,
      averageHappinessScore: 4.1,
      burnoutRiskCount: 2,
      unresolvedSuggestionsCount: 1
    }));

    return EngagementAiEngine.generateTeamInsights(mockSignals);
  }
}
