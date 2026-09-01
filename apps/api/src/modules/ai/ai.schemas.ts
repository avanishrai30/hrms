import { z } from "zod";

export const AiPromptRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  prompt: z.string().min(1).max(4000),
  contextType: z.enum(["GENERAL", "HR", "PAYROLL", "LEAVE", "COMPLIANCE", "POLICY", "ANALYTICS"]).default("GENERAL"),
  modelOverride: z.string().optional()
});
export type AiPromptRequestDto = z.infer<typeof AiPromptRequestSchema>;

export const AiKnowledgeUploadSchema = z.object({
  title: z.string().min(2).max(200),
  category: z.enum(["POLICY", "LEAVE", "COMPLIANCE", "BENEFITS", "CODE_OF_CONDUCT", "CUSTOM"]).default("POLICY"),
  content: z.string().min(10).max(100000),
  filePath: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});
export type AiKnowledgeUploadDto = z.infer<typeof AiKnowledgeUploadSchema>;

export const AiKnowledgeSearchSchema = z.object({
  query: z.string().min(1).max(500),
  category: z.string().optional(),
  topK: z.coerce.number().int().min(1).max(20).default(5)
});
export type AiKnowledgeSearchDto = z.infer<typeof AiKnowledgeSearchSchema>;

export const AiDocumentExtractSchema = z.object({
  documentType: z.enum(["RESUME", "OFFER_LETTER", "POLICY_PDF", "GOVERNMENT_ID", "INVOICE", "CUSTOM"]).default("RESUME"),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  rawText: z.string().optional(),
  fileBase64: z.string().optional()
});
export type AiDocumentExtractDto = z.infer<typeof AiDocumentExtractSchema>;

export const AiNlReportGenerateSchema = z.object({
  query: z.string().min(3).max(1000),
  format: z.enum(["JSON", "CSV", "PDF"]).default("JSON")
});
export type AiNlReportGenerateDto = z.infer<typeof AiNlReportGenerateSchema>;

export const AiSettingsUpdateSchema = z.object({
  activeProvider: z.enum(["GEMINI", "OPENAI", "LOCAL_MOCK"]).optional(),
  geminiApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  modelName: z.string().min(1).max(100).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(128).max(16384).optional(),
  enablePiiMasking: z.boolean().optional(),
  enablePromptShield: z.boolean().optional(),
  enableAutoInsights: z.boolean().optional(),
  enableWorkforcePredictions: z.boolean().optional()
});
export type AiSettingsUpdateDto = z.infer<typeof AiSettingsUpdateSchema>;
