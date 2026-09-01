import { z } from "zod";

export const workflowStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "ESCALATED",
  "CANCELLED"
]);

export const workflowStepActionSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "DELEGATED",
  "ESCALATED",
  "SKIPPED"
]);

export const stepDefinitionSchema = z.object({
  code: z.string().min(1, "Step code is required"),
  name: z.string().min(1, "Step name is required"),
  assigneeRole: z.string().optional(),
  assigneeUserId: z.string().uuid().optional(),
  slaHours: z.number().int().positive().optional(),
  requireComment: z.boolean().optional().default(false)
});

export const transitionDefinitionSchema = z.object({
  fromStep: z.string().min(1, "From step is required"),
  action: workflowStepActionSchema,
  toStep: z.string().min(1, "To step is required")
});

export const escalationRuleSchema = z.object({
  stepCode: z.string().min(1, "Step code is required"),
  afterHours: z.number().int().positive("After hours must be a positive integer"),
  escalateToRole: z.string().optional(),
  escalateToUserId: z.string().uuid().optional()
});

export const createWorkflowDefinitionSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(50).toUpperCase(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().optional(),
  entityType: z.string().min(1, "Entity type is required"),
  steps: z.array(stepDefinitionSchema).min(1, "Workflow must have at least one step"),
  transitions: z.array(transitionDefinitionSchema).default([]),
  escalationRules: z.array(escalationRuleSchema).default([]),
  isActive: z.boolean().default(true),
  version: z.number().int().positive().default(1)
});

export const CreateWorkflowDefinitionSchema = createWorkflowDefinitionSchema;

export const updateWorkflowDefinitionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  steps: z.array(stepDefinitionSchema).min(1).optional(),
  transitions: z.array(transitionDefinitionSchema).optional(),
  escalationRules: z.array(escalationRuleSchema).optional(),
  isActive: z.boolean().optional()
});

export const UpdateWorkflowDefinitionSchema = updateWorkflowDefinitionSchema;

export const startWorkflowSchema = z.object({
  definitionCode: z.string().min(1, "Workflow definition code is required"),
  entityType: z.string().min(1, "Entity type is required"),
  entityId: z.string().min(1, "Entity ID is required"),
  data: z.record(z.unknown()).optional().default({})
});

export const StartWorkflowSchema = startWorkflowSchema;

export const advanceWorkflowStepSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED", "DELEGATED", "ESCALATED", "SKIPPED"]),
  comment: z.string().optional(),
  data: z.record(z.unknown()).optional()
});

export const AdvanceWorkflowStepSchema = advanceWorkflowStepSchema;

export const delegateWorkflowStepSchema = z.object({
  stepId: z.string().uuid().optional(),
  delegatedToUserId: z.string().uuid("Invalid delegatedToUserId format"),
  comment: z.string().optional()
});

export const DelegateWorkflowStepSchema = delegateWorkflowStepSchema;

export const escalateWorkflowSchema = z.object({
  reason: z.string().optional()
});

export const EscalateWorkflowSchema = escalateWorkflowSchema;

export const workflowQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  status: workflowStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const WorkflowQuerySchema = workflowQuerySchema;

export type StepDefinition = z.infer<typeof stepDefinitionSchema>;
export type TransitionDefinition = z.infer<typeof transitionDefinitionSchema>;
export type EscalationRule = z.infer<typeof escalationRuleSchema>;
export type CreateWorkflowDefinitionInput = z.infer<typeof createWorkflowDefinitionSchema>;
export type UpdateWorkflowDefinitionInput = z.infer<typeof updateWorkflowDefinitionSchema>;
export type StartWorkflowInput = z.infer<typeof startWorkflowSchema>;
export type AdvanceWorkflowStepInput = z.infer<typeof advanceWorkflowStepSchema>;
export type DelegateWorkflowStepInput = z.infer<typeof delegateWorkflowStepSchema>;
export type EscalateWorkflowInput = z.infer<typeof escalateWorkflowSchema>;
export type WorkflowQueryInput = z.infer<typeof workflowQuerySchema>;
