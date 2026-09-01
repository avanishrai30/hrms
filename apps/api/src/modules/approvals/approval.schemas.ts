import { z } from "zod";

export const approvalStrategySchema = z.enum([
  "SEQUENTIAL",
  "PARALLEL",
  "HIERARCHICAL"
]);

export const approvalStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED"
]);

export const approvalActionTypeSchema = z.enum([
  "APPROVED",
  "REJECTED",
  "DELEGATED",
  "ESCALATED"
]);

export const approvalLevelSchema = z.object({
  level: z.number().int().positive("Level must be a positive integer"),
  name: z.string().min(1, "Level name is required"),
  approverRole: z.string().optional(),
  approverUserId: z.string().uuid().optional()
});

export const createApprovalTemplateSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(50).toUpperCase(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  entityType: z.string().min(1, "Entity type is required"),
  levels: z.array(approvalLevelSchema).min(1, "Template must have at least one level"),
  approverStrategy: approvalStrategySchema.default("SEQUENTIAL"),
  isActive: z.boolean().default(true)
});

export const CreateApprovalTemplateSchema = createApprovalTemplateSchema;

export const updateApprovalTemplateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  entityType: z.string().optional(),
  levels: z.array(approvalLevelSchema).min(1).optional(),
  approverStrategy: approvalStrategySchema.optional(),
  isActive: z.boolean().optional()
});

export const UpdateApprovalTemplateSchema = updateApprovalTemplateSchema;

export const submitApprovalRequestSchema = z
  .object({
    templateCode: z.string().optional(),
    approvalTemplateId: z.string().uuid().optional(),
    entityType: z.string().min(1, "Entity type is required"),
    entityId: z.string().min(1, "Entity ID is required"),
    data: z.record(z.unknown()).optional().default({})
  })
  .refine((data) => !!data.templateCode || !!data.approvalTemplateId, {
    message: "Either templateCode or approvalTemplateId must be provided"
  });

export const SubmitApprovalRequestSchema = submitApprovalRequestSchema;

export const approvalActionSchema = z.object({
  comment: z.string().optional()
});

export const ApprovalActionSchema = approvalActionSchema;

export const delegateApprovalSchema = z.object({
  delegateToUserId: z.string().uuid("Invalid delegateToUserId format"),
  comment: z.string().optional()
});

export const DelegateApprovalSchema = delegateApprovalSchema;

export const approvalQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  status: approvalStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const ApprovalQuerySchema = approvalQuerySchema;

export type ApprovalLevel = z.infer<typeof approvalLevelSchema>;
export type CreateApprovalTemplateInput = z.infer<typeof createApprovalTemplateSchema>;
export type UpdateApprovalTemplateInput = z.infer<typeof updateApprovalTemplateSchema>;
export type SubmitApprovalRequestInput = z.infer<typeof submitApprovalRequestSchema>;
export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;
export type DelegateApprovalInput = z.infer<typeof delegateApprovalSchema>;
export type ApprovalQueryInput = z.infer<typeof approvalQuerySchema>;
