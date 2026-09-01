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
import type { Request } from "express";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  aiAssistantSchema,
  createApiClientSchema,
  createApiKeySchema,
  createApiScopeSchema,
  createAutomationRuleSchema,
  createConnectorSchema,
  createKnowledgeArticleSchema,
  createKnowledgeCategorySchema,
  createSsoSchema,
  createWebhookSchema,
  installMarketplaceAppSchema,
  issueTokenSchema,
  publishKnowledgeArticleSchema,
  replayWebhookSchema,
  runAutomationSchema,
  usageLogSchema,
  validateSsoSchema
} from "./integrations.schemas.js";
import { IntegrationsService } from "./integrations.service.js";

@Controller("api/v1/integrations")
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get("dashboard")
  @RequirePermissions("integrations.view")
  async dashboard(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.dashboard(ctx.tenantId);
  }

  @Get("scopes")
  @RequirePermissions("integrations.api.view")
  async listScopes(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listScopes(ctx.tenantId);
  }

  @Post("scopes")
  @RequirePermissions("integrations.api.manage")
  async createScope(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createApiScopeSchema.parse(body);
    return this.integrationsService.createScope(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("api-keys")
  @RequirePermissions("integrations.api.view")
  async listApiKeys(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listApiKeys(ctx.tenantId);
  }

  @Post("api-keys")
  @RequirePermissions("integrations.api.manage")
  async createApiKey(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createApiKeySchema.parse(body);
    return this.integrationsService.createApiKey(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Delete("api-keys/:id")
  @RequirePermissions("integrations.api.manage")
  async revokeApiKey(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.revokeApiKey(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      id
    );
  }

  @Post("api-clients")
  @RequirePermissions("integrations.api.manage")
  async createApiClient(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createApiClientSchema.parse(body);
    return this.integrationsService.createApiClient(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("tokens")
  @RequirePermissions("integrations.api.manage")
  async issueToken(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = issueTokenSchema.parse(body);
    return this.integrationsService.issueToken(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("usage-logs")
  @RequirePermissions("integrations.api.view")
  async logUsage(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = usageLogSchema.parse(body);
    return this.integrationsService.logUsage(ctx.tenantId, dto);
  }

  @Get("webhooks")
  @RequirePermissions("integrations.webhooks.view")
  async listWebhooks(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listWebhooks(ctx.tenantId);
  }

  @Post("webhooks")
  @RequirePermissions("integrations.webhooks.manage")
  async createWebhook(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createWebhookSchema.parse(body);
    return this.integrationsService.createWebhook(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("webhooks/replay")
  @RequirePermissions("integrations.webhooks.manage")
  async replayWebhook(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = replayWebhookSchema.parse(body);
    return this.integrationsService.replayWebhook(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("webhooks/analytics")
  @RequirePermissions("integrations.webhooks.view")
  async webhookAnalytics(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.webhookAnalytics(ctx.tenantId);
  }

  @Get("automation/rules")
  @RequirePermissions("automation.view")
  async listAutomationRules(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listAutomationRules(ctx.tenantId);
  }

  @Post("automation/rules")
  @RequirePermissions("automation.manage")
  async createAutomationRule(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createAutomationRuleSchema.parse(body);
    return this.integrationsService.createAutomationRule(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("automation/run")
  @RequirePermissions("automation.run")
  async runAutomation(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = runAutomationSchema.parse(body);
    return this.integrationsService.runAutomation(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("connectors/catalog")
  @RequirePermissions("integrations.connectors.view")
  async connectorCatalog() {
    return this.integrationsService.connectorCatalog();
  }

  @Get("connectors")
  @RequirePermissions("integrations.connectors.view")
  async listConnectors(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listConnectors(ctx.tenantId);
  }

  @Post("connectors")
  @RequirePermissions("integrations.connectors.manage")
  async createConnector(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createConnectorSchema.parse(body);
    return this.integrationsService.createConnector(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("sso")
  @RequirePermissions("integrations.sso.view")
  async listSso(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listSso(ctx.tenantId);
  }

  @Post("sso")
  @RequirePermissions("integrations.sso.manage")
  async createSso(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createSsoSchema.parse(body);
    return this.integrationsService.createSso(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("sso/validate")
  @RequirePermissions("integrations.sso.view")
  async validateSso(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = validateSsoSchema.parse(body);
    return this.integrationsService.validateSso(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Post("ai-assistant")
  @RequirePermissions("ai.assistant.view")
  async aiAssistant(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = aiAssistantSchema.parse(body);
    return this.integrationsService.aiAssistant(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("knowledge")
  @RequirePermissions("knowledge.view")
  async listKnowledge(@Req() req: Request, @Query("query") query?: string) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listKnowledge(ctx.tenantId, query);
  }

  @Get("knowledge/categories")
  @RequirePermissions("knowledge.view")
  async listKnowledgeCategories(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.listKnowledgeCategories(ctx.tenantId);
  }

  @Post("knowledge/categories")
  @RequirePermissions("knowledge.manage")
  async createKnowledgeCategory(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createKnowledgeCategorySchema.parse(body);
    return this.integrationsService.createKnowledgeCategory(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Get("knowledge/:id")
  @RequirePermissions("knowledge.view")
  async getKnowledgeArticle(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.getKnowledgeArticle(ctx.tenantId, id);
  }

  @Post("knowledge")
  @RequirePermissions("knowledge.manage")
  async createKnowledgeArticle(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = createKnowledgeArticleSchema.parse(body);
    return this.integrationsService.createKnowledgeArticle(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }

  @Put("knowledge/:id/publish")
  @RequirePermissions("knowledge.manage")
  async publishKnowledgeArticle(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const ctx = requireTenantContext(req);
    const dto = publishKnowledgeArticleSchema.parse(body);
    return this.integrationsService.publishKnowledgeArticle(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      id,
      dto
    );
  }

  @Get("marketplace")
  @RequirePermissions("marketplace.view")
  async marketplace(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.integrationsService.marketplace(ctx.tenantId);
  }

  @Post("marketplace/install")
  @RequirePermissions("marketplace.manage")
  async installMarketplaceApp(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = installMarketplaceAppSchema.parse(body);
    return this.integrationsService.installMarketplaceApp(
      ctx.tenantId,
      { userId: ctx.userId, membershipId: ctx.membershipId },
      dto
    );
  }
}
