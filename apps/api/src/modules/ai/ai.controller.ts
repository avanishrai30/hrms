import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  AiDocumentExtractSchema,
  type AiDocumentExtractDto,
  AiKnowledgeSearchSchema,
  type AiKnowledgeSearchDto,
  AiKnowledgeUploadSchema,
  type AiKnowledgeUploadDto,
  AiNlReportGenerateSchema,
  type AiNlReportGenerateDto,
  AiPromptRequestSchema,
  type AiPromptRequestDto,
  AiSettingsUpdateSchema,
  type AiSettingsUpdateDto
} from "./ai.schemas.js";
import { AiService } from "./ai.service.js";
import { DocumentAiService } from "./services/document-ai.service.js";
import { KnowledgeBaseService } from "./services/knowledge-base.service.js";
import { NaturalLanguageReportsService } from "./services/natural-language-reports.service.js";
import { PredictionEngine } from "./engines/prediction.engine.js";
import { InsightsEngine } from "./engines/insights.engine.js";
import { ConversationMemoryService } from "./memory/conversation-memory.service.js";

@Controller("ai")
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly knowledgeService: KnowledgeBaseService,
    private readonly documentAiService: DocumentAiService,
    private readonly nlReportsService: NaturalLanguageReportsService,
    private readonly predictionEngine: PredictionEngine,
    private readonly insightsEngine: InsightsEngine,
    private readonly memoryService: ConversationMemoryService
  ) {}

  @Post("chat")
  @RequirePermissions("ai.chat")
  async chat(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(AiPromptRequestSchema)) body: AiPromptRequestDto
  ) {
    const tenant = requireTenantContext(req);
    return this.aiService.handleChatPrompt(tenant.tenantId, tenant.userId, tenant.permissions, body);
  }

  @Get("conversations")
  @RequirePermissions("ai.chat")
  async listConversations(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.memoryService.listConversations(tenant.tenantId, tenant.userId);
  }

  @Get("conversations/:id")
  @RequirePermissions("ai.chat")
  async getConversation(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.memoryService.getConversation(tenant.tenantId, tenant.userId, id);
  }

  @Delete("conversations/:id")
  @RequirePermissions("ai.chat")
  async deleteConversation(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.memoryService.deleteConversation(tenant.tenantId, tenant.userId, id);
  }

  @Post("knowledge/upload")
  @RequirePermissions("ai.knowledge.manage")
  async uploadKnowledge(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(AiKnowledgeUploadSchema)) body: AiKnowledgeUploadDto
  ) {
    const tenant = requireTenantContext(req);
    return this.knowledgeService.uploadKnowledgeDocument(tenant.tenantId, body, tenant.userId);
  }

  @Get("knowledge")
  @RequirePermissions("ai.knowledge.read")
  async listKnowledge(
    @Req() req: AuthenticatedRequest,
    @Query("category") category?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.knowledgeService.listDocuments(tenant.tenantId, category);
  }

  @Get("knowledge/:id")
  @RequirePermissions("ai.knowledge.read")
  async getKnowledge(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.knowledgeService.getDocument(tenant.tenantId, id);
  }

  @Delete("knowledge/:id")
  @RequirePermissions("ai.knowledge.manage")
  async deleteKnowledge(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.knowledgeService.deleteDocument(tenant.tenantId, id, tenant.userId);
  }

  @Post("knowledge/search")
  @RequirePermissions("ai.knowledge.read")
  async searchKnowledge(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(AiKnowledgeSearchSchema)) body: AiKnowledgeSearchDto
  ) {
    const tenant = requireTenantContext(req);
    return this.knowledgeService.searchKnowledge(tenant.tenantId, body);
  }

  @Get("predictions/workforce")
  @RequirePermissions("ai.prediction.read")
  async getWorkforcePredictions(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.predictionEngine.calculateHeadcountForecast(tenant.tenantId);
  }

  @Get("predictions/employee/:employeeId")
  @RequirePermissions("ai.prediction.read")
  async getEmployeePrediction(
    @Req() req: AuthenticatedRequest,
    @Param("employeeId") employeeId: string
  ) {
    const tenant = requireTenantContext(req);
    const [attrition, burnout] = await Promise.all([
      this.predictionEngine.calculateEmployeeAttritionRisk(tenant.tenantId, employeeId),
      this.predictionEngine.calculateEmployeeBurnoutRisk(tenant.tenantId, employeeId)
    ]);
    return { attrition, burnout };
  }

  @Get("insights")
  @RequirePermissions("ai.insights.read")
  async listInsights(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.insightsEngine.listInsights(tenant.tenantId);
  }

  @Post("insights/:id/dismiss")
  @RequirePermissions("ai.insights.read")
  async dismissInsight(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.insightsEngine.dismissInsight(tenant.tenantId, id);
  }

  @Post("documents/extract")
  @RequirePermissions("ai.documents.extract")
  async extractDocument(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(AiDocumentExtractSchema)) body: AiDocumentExtractDto
  ) {
    const tenant = requireTenantContext(req);
    return this.documentAiService.extractDocumentData(tenant.tenantId, body, tenant.userId);
  }

  @Get("documents/extractions")
  @RequirePermissions("ai.documents.extract")
  async listExtractions(
    @Req() req: AuthenticatedRequest,
    @Query("documentType") documentType?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.documentAiService.listExtractions(tenant.tenantId, documentType);
  }

  @Post("reports/nl-generate")
  @RequirePermissions("ai.reports.generate")
  async generateNlReport(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(AiNlReportGenerateSchema)) body: AiNlReportGenerateDto
  ) {
    const tenant = requireTenantContext(req);
    return this.nlReportsService.generateReportFromNl(tenant.tenantId, body, tenant.userId);
  }

  @Get("executive/summary")
  @RequirePermissions("ai.prediction.read")
  async getExecutiveSummary(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.aiService.getExecutiveAiSummary(tenant.tenantId, tenant.userId);
  }

  @Get("approvals/:requestId/summary")
  @RequirePermissions("approvals.view")
  async getApprovalSummary(
    @Req() req: AuthenticatedRequest,
    @Param("requestId") requestId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.aiService.getApprovalSummary(tenant.tenantId, requestId);
  }

  @Get("settings")
  @RequirePermissions("ai.settings.manage")
  async getSettings(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.aiService.getAiSettings(tenant.tenantId);
  }

  @Put("settings")
  @RequirePermissions("ai.settings.manage")
  async updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(AiSettingsUpdateSchema)) body: AiSettingsUpdateDto
  ) {
    const tenant = requireTenantContext(req);
    return this.aiService.updateAiSettings(tenant.tenantId, body, tenant.userId);
  }
}
