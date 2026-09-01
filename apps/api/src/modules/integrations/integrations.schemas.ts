import { z } from "zod";

export const integrationEventSchema = z.enum([
  "employee.created",
  "employee.updated",
  "employee.deleted",
  "attendance.created",
  "attendance.corrected",
  "leave.approved",
  "leave.rejected",
  "payroll.processed",
  "payroll.paid",
  "compliance.filed",
  "expense.approved",
  "reimbursement.paid",
  "candidate.applied",
  "candidate.hired",
  "asset.assigned",
  "asset.returned",
  "ticket.created",
  "ticket.closed",
  "visitor.checked_in",
  "visitor.checked_out"
]);

export const createApiScopeSchema = z.object({
  code: z.string().min(3),
  description: z.string().optional()
});

export const createApiKeySchema = z.object({
  name: z.string().min(2),
  scopes: z.array(z.string()).default([]),
  rateLimitPerMinute: z.number().int().positive().max(10000).default(60),
  expiresAt: z.coerce.date().optional()
});

export const createApiClientSchema = z.object({
  name: z.string().min(2),
  redirectUris: z.array(z.string().url()).default([]),
  scopes: z.array(z.string()).default([])
});

export const issueTokenSchema = z.object({
  clientId: z.string().uuid(),
  scopes: z.array(z.string()).default([]),
  expiresInSeconds: z.number().int().positive().default(3600)
});

export const usageLogSchema = z.object({
  apiKeyId: z.string().uuid().optional(),
  path: z.string().min(1),
  method: z.string().min(2),
  statusCode: z.number().int().min(100).max(599),
  latencyMs: z.number().int().min(0).default(0),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

export const createWebhookSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  events: z.array(integrationEventSchema).min(1),
  retryCount: z.number().int().min(0).max(10).default(3)
});

export const replayWebhookSchema = z.object({
  subscriptionId: z.string().uuid()
});

const conditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "CONTAINS", "DATE_BASED", "DEPARTMENT_BASED", "ROLE_BASED"]),
  value: z.unknown()
});

const actionSchema = z.object({
  type: z.enum(["SEND_EMAIL", "SEND_SMS", "SEND_WHATSAPP", "SEND_PUSH", "CREATE_TASK", "CREATE_APPROVAL", "CREATE_TICKET", "ASSIGN_ASSET", "GENERATE_DOCUMENT", "CALL_WEBHOOK", "CALL_EXTERNAL_API"]),
  payload: z.record(z.unknown()).default({})
});

export const createAutomationRuleSchema = z.object({
  name: z.string().min(2),
  triggerType: z.enum(["EMPLOYEE_CREATED", "ATTENDANCE_MARKED", "LEAVE_APPROVED", "PAYROLL_PROCESSED", "EXPENSE_SUBMITTED", "CANDIDATE_HIRED", "ASSET_ASSIGNED", "TICKET_CLOSED", "VISITOR_CHECKED_IN"]),
  conditions: z.array(conditionSchema).default([]),
  actions: z.array(actionSchema).min(1),
  isActive: z.boolean().default(true)
});

export const runAutomationSchema = z.object({
  triggerType: z.string().min(2),
  payload: z.record(z.unknown()).default({})
});

export const createConnectorSchema = z.object({
  provider: z.string().min(2),
  category: z.enum(["PRODUCTIVITY", "COMMUNICATION", "HR", "ACCOUNTING", "STORAGE", "IDENTITY"]),
  displayName: z.string().min(2),
  scopes: z.array(z.string()).default([]),
  config: z.record(z.unknown()).default({})
});

export const createSsoSchema = z.object({
  name: z.string().min(2),
  protocol: z.enum(["OAUTH2", "OIDC", "SAML2"]),
  issuer: z.string().optional(),
  clientId: z.string().optional(),
  secret: z.string().optional(),
  metadataUrl: z.string().url().optional(),
  roleMapping: z.record(z.unknown()).default({}),
  groupMapping: z.record(z.unknown()).default({}),
  jitProvisioning: z.boolean().default(true),
  autoDeactivation: z.boolean().default(false)
});

export const validateSsoSchema = z.object({
  configurationId: z.string().uuid(),
  email: z.string().email(),
  groups: z.array(z.string()).default([]),
  attributes: z.record(z.unknown()).default({})
});

export const aiAssistantSchema = z.object({
  prompt: z.string().min(1),
  permissions: z.array(z.string()).default([])
});

export const createKnowledgeCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional()
});

export const createKnowledgeArticleSchema = z.object({
  categoryId: z.string().uuid().optional(),
  title: z.string().min(2),
  slug: z.string().min(2),
  summary: z.string().optional(),
  content: z.string().min(2),
  changeNote: z.string().optional()
});

export const publishKnowledgeArticleSchema = z.object({
  status: z.enum(["IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"])
});

export const installMarketplaceAppSchema = z.object({
  appId: z.string().uuid(),
  permissions: z.array(z.string()).default([])
});

export type CreateApiScopeDto = z.infer<typeof createApiScopeSchema>;
export type CreateApiKeyDto = z.infer<typeof createApiKeySchema>;
export type CreateApiClientDto = z.infer<typeof createApiClientSchema>;
export type IssueTokenDto = z.infer<typeof issueTokenSchema>;
export type UsageLogDto = z.infer<typeof usageLogSchema>;
export type CreateWebhookDto = z.infer<typeof createWebhookSchema>;
export type ReplayWebhookDto = z.infer<typeof replayWebhookSchema>;
export type CreateAutomationRuleDto = z.infer<typeof createAutomationRuleSchema>;
export type RunAutomationDto = z.infer<typeof runAutomationSchema>;
export type CreateConnectorDto = z.infer<typeof createConnectorSchema>;
export type CreateSsoDto = z.infer<typeof createSsoSchema>;
export type ValidateSsoDto = z.infer<typeof validateSsoSchema>;
export type AiAssistantDto = z.infer<typeof aiAssistantSchema>;
export type CreateKnowledgeCategoryDto = z.infer<typeof createKnowledgeCategorySchema>;
export type CreateKnowledgeArticleDto = z.infer<typeof createKnowledgeArticleSchema>;
export type PublishKnowledgeArticleDto = z.infer<typeof publishKnowledgeArticleSchema>;
export type InstallMarketplaceAppDto = z.infer<typeof installMarketplaceAppSchema>;
