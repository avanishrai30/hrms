import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { AiService } from "../ai/ai.service.js";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { QueueService } from "../queue/queue.service.js";
import { validateSsrfUrl } from "../common/ssrf-validator.js";
import {
  ApiCredentialEngine,
  ApiRateLimitEngine,
  AutomationEngine,
  WebhookDeliveryEngine,
  connectorCatalog
} from "./integrations.engine.js";
import type {
  AiAssistantDto,
  CreateApiClientDto,
  CreateApiKeyDto,
  CreateApiScopeDto,
  CreateAutomationRuleDto,
  CreateConnectorDto,
  CreateKnowledgeArticleDto,
  CreateKnowledgeCategoryDto,
  CreateSsoDto,
  CreateWebhookDto,
  InstallMarketplaceAppDto,
  IssueTokenDto,
  PublishKnowledgeArticleDto,
  ReplayWebhookDto,
  RunAutomationDto,
  UsageLogDto,
  ValidateSsoDto
} from "./integrations.schemas.js";

interface Actor {
  userId: string;
  membershipId: string;
}

@Injectable()
export class IntegrationsService {
  private readonly credentials = new ApiCredentialEngine();
  private readonly rateLimits = new ApiRateLimitEngine();
  private readonly webhooks = new WebhookDeliveryEngine();
  private readonly automation = new AutomationEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly queueService: QueueService,
    private readonly aiService: AiService
  ) {}

  dashboard(tenantId: string) {
    return Promise.all([
      this.prisma.apiKey.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.apiWebhook.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.automationRule.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.externalIntegration.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.apiUsageLog.count({ where: { tenantId } }),
      this.prisma.apiSubscription.count({ where: { tenantId, deliveryStatus: "DEAD_LETTER" } })
    ]).then(([apiKeys, webhooks, automations, connectors, usageLogs, deadLetters]) => ({
      apiKeys,
      webhooks,
      automations,
      connectors,
      usageLogs,
      deadLetters,
      catalogSize: connectorCatalog.length
    }));
  }

  listScopes(tenantId: string) {
    return this.prisma.apiScope.findMany({ where: { tenantId, deletedAt: null }, orderBy: { code: "asc" } });
  }

  async createScope(tenantId: string, actor: Actor, dto: CreateApiScopeDto) {
    const scope = await this.prisma.apiScope.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "integrations.api_scope.created", "api_scope", scope.id, scope);
    return scope;
  }

  listApiKeys(tenantId: string) {
    return this.prisma.apiKey.findMany({ where: { tenantId, deletedAt: null }, include: { usageLogs: { take: 5, orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } });
  }

  async createApiKey(tenantId: string, actor: Actor, dto: CreateApiKeyDto) {
    await this.assertScopes(tenantId, dto.scopes);
    const secret = this.credentials.createSecret("wms_live");
    const key = await this.prisma.apiKey.create({
      data: {
        tenantId,
        name: dto.name,
        keyHash: secret.hash,
        prefix: secret.prefix,
        scopes: dto.scopes,
        rateLimitPerMinute: dto.rateLimitPerMinute,
        expiresAt: dto.expiresAt,
        createdBy: actor.userId
      }
    });
    await this.audit(tenantId, actor, "integrations.api_key.created", "api_key", key.id, { id: key.id, prefix: key.prefix, scopes: key.scopes });
    return { apiKey: key, secret: secret.raw };
  }

  async revokeApiKey(tenantId: string, actor: Actor, id: string) {
    const before = await this.prisma.apiKey.findFirst({ where: { tenantId, id, deletedAt: null } });
    if (!before) throw new NotFoundException("API key not found.");
    const key = await this.prisma.apiKey.update({ where: { id: before.id }, data: { status: "REVOKED", deletedAt: new Date() } });
    await this.audit(tenantId, actor, "integrations.api_key.revoked", "api_key", key.id, { before, after: key });
    return key;
  }

  async createApiClient(tenantId: string, actor: Actor, dto: CreateApiClientDto) {
    await this.assertScopes(tenantId, dto.scopes);
    const clientId = this.credentials.createSecret("client").raw;
    const secret = this.credentials.createSecret("secret");
    const client = await this.prisma.apiClient.create({
      data: {
        tenantId,
        name: dto.name,
        clientId,
        clientSecretHash: secret.hash,
        redirectUris: dto.redirectUris,
        scopes: dto.scopes,
        createdBy: actor.userId
      }
    });
    await this.audit(tenantId, actor, "integrations.api_client.created", "api_client", client.id, { id: client.id, clientId, scopes: client.scopes });
    return { client, secret: secret.raw };
  }

  async issueToken(tenantId: string, actor: Actor, dto: IssueTokenDto) {
    const client = await this.prisma.apiClient.findFirst({ where: { tenantId, id: dto.clientId, status: "ACTIVE", deletedAt: null } });
    if (!client) throw new NotFoundException("API client not found.");
    const denied = dto.scopes.filter((scope) => !client.scopes.includes(scope));
    if (denied.length) throw new BadRequestException(`Client is missing scopes: ${denied.join(", ")}`);
    const access = this.credentials.createSecret("access");
    const refresh = this.credentials.createSecret("refresh");
    const token = await this.prisma.apiToken.create({
      data: {
        tenantId,
        clientIdRef: client.id,
        accessTokenHash: access.hash,
        refreshTokenHash: refresh.hash,
        scopes: dto.scopes,
        expiresAt: new Date(Date.now() + dto.expiresInSeconds * 1000)
      }
    });
    await this.audit(tenantId, actor, "integrations.api_token.issued", "api_token", token.id, { clientId: client.id, scopes: token.scopes });
    return { token, accessToken: access.raw, refreshToken: refresh.raw };
  }

  async logUsage(tenantId: string, dto: UsageLogDto) {
    if (dto.apiKeyId) {
      const apiKey = await this.prisma.apiKey.findFirst({ where: { tenantId, id: dto.apiKeyId, deletedAt: null } });
      if (!apiKey) throw new NotFoundException("API key not found.");
      const since = new Date(Date.now() - 60_000);
      const count = await this.prisma.apiUsageLog.count({ where: { tenantId, apiKeyId: apiKey.id, createdAt: { gte: since } } });
      const allowed = this.rateLimits.isAllowed(count, apiKey.rateLimitPerMinute);
      if (!allowed.allowed) throw new BadRequestException("API rate limit exceeded.");
      await this.prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
    }
    return this.prisma.apiUsageLog.create({ data: { tenantId, ...dto } });
  }

  async listWebhooks(tenantId: string) {
    const webhooks = await this.prisma.apiWebhook.findMany({
      where: { tenantId, deletedAt: null },
      include: { subscriptions: { take: 10, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" }
    });
    return webhooks.map((wh) => {
      const copy = { ...wh };
      delete (copy as { secretHash?: string }).secretHash;
      return copy;
    });
  }

  async createWebhook(tenantId: string, actor: Actor, dto: CreateWebhookDto) {
    try {
      await validateSsrfUrl(dto.url);
    } catch (err: unknown) {
      throw new BadRequestException((err as Error).message || "Invalid or prohibited webhook destination URL.");
    }

    const secret = this.credentials.createSecret("whsec");
    const webhook = await this.prisma.apiWebhook.create({
      data: {
        tenantId,
        name: dto.name,
        url: dto.url,
        events: dto.events,
        secretHash: secret.hash,
        retryCount: dto.retryCount,
        createdBy: actor.userId
      }
    });
    await this.audit(tenantId, actor, "integrations.webhook.created", "api_webhook", webhook.id, { id: webhook.id, events: webhook.events });
    const safeWebhook = { ...webhook };
    delete (safeWebhook as { secretHash?: string }).secretHash;
    return { webhook: safeWebhook, signingSecret: secret.raw };
  }

  async emitWebhookEvent(tenantId: string, event: string, payload: Record<string, unknown>) {
    const webhooks = await this.prisma.apiWebhook.findMany({ where: { tenantId, status: "ACTIVE", deletedAt: null, events: { has: event } } });
    const deliveries = [];
    for (const webhook of webhooks) {
      const status = this.webhooks.classify(202, 1, webhook.retryCount);
      const subscription = await this.prisma.apiSubscription.create({
        data: {
          tenantId,
          webhookId: webhook.id,
          event,
          payload: payload as Prisma.InputJsonValue,
          attempts: 1,
          deliveryStatus: status,
          lastDeliveredAt: status === "DELIVERED" ? new Date() : undefined,
          nextAttemptAt: status === "FAILED" ? this.webhooks.nextAttempt(1) : undefined
        }
      });
      await this.queueService.addJob("webhooks", event, { tenantId, subscriptionId: subscription.id, webhookId: webhook.id, payload });
      deliveries.push(subscription);
    }
    return deliveries;
  }

  async replayWebhook(tenantId: string, actor: Actor, dto: ReplayWebhookDto) {
    const subscription = await this.prisma.apiSubscription.findFirst({ where: { tenantId, id: dto.subscriptionId }, include: { webhook: true } });
    if (!subscription) throw new NotFoundException("Webhook delivery not found.");
    const replay = await this.prisma.apiSubscription.create({
      data: {
        tenantId,
        webhookId: subscription.webhookId,
        event: subscription.event,
        payload: subscription.payload ?? {},
        attempts: 0,
        deliveryStatus: "PENDING"
      }
    });
    await this.queueService.addJob("webhooks", `replay:${subscription.event}`, { tenantId, subscriptionId: replay.id, webhookId: subscription.webhookId, payload: replay.payload });
    await this.audit(tenantId, actor, "integrations.webhook.replayed", "api_subscription", replay.id, { originalId: subscription.id });
    return replay;
  }

  webhookAnalytics(tenantId: string) {
    return this.prisma.apiSubscription.groupBy({ by: ["deliveryStatus"], where: { tenantId }, _count: true });
  }

  listAutomationRules(tenantId: string) {
    return this.prisma.automationRule.findMany({ where: { tenantId, deletedAt: null }, include: { runs: { take: 5, orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } });
  }

  async createAutomationRule(tenantId: string, actor: Actor, dto: CreateAutomationRuleDto) {
    const rule = await this.prisma.automationRule.create({
      data: {
        tenantId,
        name: dto.name,
        triggerType: dto.triggerType,
        conditions: dto.conditions as unknown as Prisma.InputJsonValue,
        actions: dto.actions as unknown as Prisma.InputJsonValue,
        isActive: dto.isActive,
        createdBy: actor.userId
      }
    });
    await this.audit(tenantId, actor, "integrations.automation_rule.created", "automation_rule", rule.id, rule);
    return rule;
  }

  async runAutomation(tenantId: string, actor: Actor, dto: RunAutomationDto) {
    const rules = await this.prisma.automationRule.findMany({ where: { tenantId, triggerType: dto.triggerType, isActive: true, deletedAt: null } });
    const runs = [];
    for (const rule of rules) {
      const conditions = rule.conditions as unknown as Array<{ field: string; operator: string; value: unknown }>;
      const actions = rule.actions as unknown as Array<{ type: string; payload: Record<string, unknown> }>;
      if (!this.automation.conditionsPass(conditions, dto.payload)) continue;
      const actionResults = actions.map((action) => this.automation.actionResult(action));
      const run = await this.prisma.automationRun.create({
        data: {
          tenantId,
          ruleId: rule.id,
          status: "COMPLETED",
          triggerPayload: dto.payload as Prisma.InputJsonValue,
          actionResults: actionResults as unknown as Prisma.InputJsonValue
        }
      });
      await this.queueService.addJob("automation", rule.triggerType, { tenantId, runId: run.id, actions: actionResults });
      runs.push(run);
    }
    await this.audit(tenantId, actor, "integrations.automation.executed", "automation_run", undefined, { triggerType: dto.triggerType, runs: runs.length });
    return runs;
  }

  connectorCatalog() {
    return connectorCatalog;
  }

  listConnectors(tenantId: string) {
    return this.prisma.externalIntegration.findMany({ where: { tenantId, deletedAt: null }, orderBy: { displayName: "asc" } });
  }

  async createConnector(tenantId: string, actor: Actor, dto: CreateConnectorDto) {
    const connector = await this.prisma.externalIntegration.create({
      data: {
        tenantId,
        provider: dto.provider,
        category: dto.category,
        displayName: dto.displayName,
        scopes: dto.scopes,
        encryptedConfig: this.credentials.encryptConfig(dto.config),
        createdBy: actor.userId
      }
    });
    await this.audit(tenantId, actor, "integrations.connector.created", "external_integration", connector.id, { provider: connector.provider, category: connector.category });
    return connector;
  }

  listSso(tenantId: string) {
    return this.prisma.sSOConfiguration.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: "desc" } });
  }

  async createSso(tenantId: string, actor: Actor, dto: CreateSsoDto) {
    const config = await this.prisma.sSOConfiguration.create({
      data: {
        tenantId,
        name: dto.name,
        protocol: dto.protocol,
        issuer: dto.issuer,
        clientId: dto.clientId,
        encryptedSecret: dto.secret ? this.credentials.encryptConfig({ secret: dto.secret }) : undefined,
        metadataUrl: dto.metadataUrl,
        roleMapping: dto.roleMapping as Prisma.InputJsonValue,
        groupMapping: dto.groupMapping as Prisma.InputJsonValue,
        jitProvisioning: dto.jitProvisioning,
        autoDeactivation: dto.autoDeactivation,
        createdBy: actor.userId
      }
    });
    await this.audit(tenantId, actor, "integrations.sso.created", "sso_configuration", config.id, { protocol: config.protocol, issuer: config.issuer });
    return config;
  }

  async validateSso(tenantId: string, actor: Actor, dto: ValidateSsoDto) {
    const config = await this.prisma.sSOConfiguration.findFirst({ where: { tenantId, id: dto.configurationId, isActive: true, deletedAt: null } });
    if (!config) throw new NotFoundException("SSO configuration not found.");
    const mappedRole = Object.entries(config.roleMapping as Record<string, string>).find(([group]) => dto.groups.includes(group))?.[1] ?? "EMPLOYEE";
    const result = { email: dto.email, protocol: config.protocol, jitProvisioning: config.jitProvisioning, mappedRole, sessionSync: true, autoDeactivation: config.autoDeactivation };
    await this.audit(tenantId, actor, "integrations.sso.validated", "sso_configuration", config.id, result);
    return result;
  }

  async aiAssistant(tenantId: string, actor: Actor, dto: AiAssistantDto) {
    const response = await this.aiService.handleChatPrompt(tenantId, actor.userId, dto.permissions, { prompt: dto.prompt, contextType: "HR" });
    await this.audit(tenantId, actor, "integrations.ai_assistant.queried", "ai_assistant", response.messageId, { intent: response.intent });
    return response;
  }

  listKnowledge(tenantId: string, query?: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }] } : {})
      },
      include: { category: true, versions: { take: 1, orderBy: { version: "desc" } }, attachments: true },
      orderBy: { updatedAt: "desc" }
    });
  }

  async getKnowledgeArticle(tenantId: string, id: string) {
    const article = await this.prisma.knowledgeArticle.findFirst({
      where: { tenantId, id, deletedAt: null },
      include: { category: true, versions: { orderBy: { version: "desc" } }, attachments: true }
    });
    if (!article) throw new NotFoundException("Knowledge article not found.");
    return article;
  }

  listKnowledgeCategories(tenantId: string) {
    return this.prisma.knowledgeCategory.findMany({ where: { tenantId, deletedAt: null }, include: { articles: true }, orderBy: { name: "asc" } });
  }

  async createKnowledgeCategory(tenantId: string, actor: Actor, dto: CreateKnowledgeCategoryDto) {
    const category = await this.prisma.knowledgeCategory.create({ data: { tenantId, ...dto, createdBy: actor.userId } });
    await this.audit(tenantId, actor, "integrations.knowledge_category.created", "knowledge_category", category.id, category);
    return category;
  }

  async createKnowledgeArticle(tenantId: string, actor: Actor, dto: CreateKnowledgeArticleDto) {
    if (dto.categoryId) await this.assertKnowledgeCategory(tenantId, dto.categoryId);
    const article = await this.prisma.knowledgeArticle.create({
      data: {
        tenantId,
        categoryId: dto.categoryId,
        title: dto.title,
        slug: dto.slug,
        summary: dto.summary,
        createdBy: actor.userId,
        versions: { create: { tenantId, version: 1, content: dto.content, changeNote: dto.changeNote, createdBy: actor.userId } }
      },
      include: { versions: true }
    });
    await this.audit(tenantId, actor, "integrations.knowledge_article.created", "knowledge_article", article.id, article);
    return article;
  }

  async publishKnowledgeArticle(tenantId: string, actor: Actor, id: string, dto: PublishKnowledgeArticleDto) {
    const article = await this.getKnowledgeArticle(tenantId, id);
    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: { status: dto.status, approvedAt: ["APPROVED", "PUBLISHED"].includes(dto.status) ? new Date() : article.approvedAt, approvedBy: ["APPROVED", "PUBLISHED"].includes(dto.status) ? actor.userId : article.approvedBy }
    });
    await this.audit(tenantId, actor, "integrations.knowledge_article.status_updated", "knowledge_article", updated.id, { before: article.status, after: dto.status });
    return updated;
  }

  async marketplace(tenantId: string) {
    const existing = await this.prisma.marketplaceApp.findMany({ where: { tenantId, deletedAt: null }, include: { installs: true }, orderBy: { name: "asc" } });
    if (existing.length) return existing;
    await this.prisma.marketplaceApp.createMany({
      data: connectorCatalog.map((app) => ({
        tenantId,
        provider: app.provider,
        category: app.category,
        name: app.name,
        description: `${app.name} connector`,
        requiredScopes: [`${app.category.toLowerCase()}.read`],
        billingReady: true
      }))
    });
    return this.prisma.marketplaceApp.findMany({ where: { tenantId, deletedAt: null }, include: { installs: true }, orderBy: { name: "asc" } });
  }

  async installMarketplaceApp(tenantId: string, actor: Actor, dto: InstallMarketplaceAppDto) {
    const app = await this.prisma.marketplaceApp.findFirst({ where: { tenantId, id: dto.appId, deletedAt: null } });
    if (!app) throw new NotFoundException("Marketplace app not found.");
    const install = await this.prisma.marketplaceInstall.upsert({
      where: { tenantId_appId: { tenantId, appId: app.id } },
      create: { tenantId, appId: app.id, permissions: dto.permissions, installedBy: actor.userId },
      update: { permissions: dto.permissions, status: "ACTIVE", deletedAt: null, usageCount: { increment: 1 } }
    });
    await this.audit(tenantId, actor, "integrations.marketplace_app.installed", "marketplace_install", install.id, install);
    return install;
  }

  private async assertScopes(tenantId: string, scopes: string[]) {
    if (!scopes.length) return;
    const existing = await this.prisma.apiScope.findMany({ where: { tenantId, code: { in: scopes }, deletedAt: null } });
    const missing = scopes.filter((scope) => !existing.some((item) => item.code === scope));
    if (missing.length) throw new BadRequestException(`Unknown API scopes: ${missing.join(", ")}`);
  }

  private async assertKnowledgeCategory(tenantId: string, id: string) {
    const category = await this.prisma.knowledgeCategory.findFirst({ where: { tenantId, id, deletedAt: null } });
    if (!category) throw new BadRequestException("Knowledge category does not belong to this tenant.");
  }

  private audit(tenantId: string, actor: Actor, action: string, resourceType: string, resourceId: string | undefined, metadata: unknown) {
    return this.auditService.record({
      tenantId,
      actorUserId: actor.userId,
      actorMembershipId: actor.membershipId,
      action,
      resourceType,
      resourceId,
      metadata: metadata as Prisma.InputJsonValue
    });
  }
}
