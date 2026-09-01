import { z } from "zod";

export const CreateTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.enum([
    "HARDWARE",
    "SOFTWARE",
    "ACCESS",
    "NETWORK",
    "SECURITY",
    "FACILITIES",
    "PAYROLL",
    "HR",
    "CUSTOM"
  ]).default("HARDWARE"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  source: z.enum(["PORTAL", "EMAIL", "SLACK", "PHONE", "SYSTEM_GENERATED"]).default("PORTAL"),
  assetId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional().default([])
});

export const UpdateTicketSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  category: z.enum([
    "HARDWARE",
    "SOFTWARE",
    "ACCESS",
    "NETWORK",
    "SECURITY",
    "FACILITIES",
    "PAYROLL",
    "HR",
    "CUSTOM"
  ]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum([
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "ON_HOLD",
    "RESOLVED",
    "CLOSED",
    "REOPENED"
  ]).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional()
});

export const AddTicketCommentSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean().default(false)
});

export const ResolveTicketSchema = z.object({
  resolutionNotes: z.string().min(3),
  satisfactionScore: z.number().int().min(1).max(5).optional().nullable(),
  feedbackNotes: z.string().optional().nullable()
});

export const EscalateTicketSchema = z.object({
  reason: z.string().min(3),
  level: z.number().int().min(1).max(3).default(1),
  escalatedTo: z.string().optional().nullable()
});

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketDto = z.infer<typeof UpdateTicketSchema>;
export type AddTicketCommentDto = z.infer<typeof AddTicketCommentSchema>;
export type ResolveTicketDto = z.infer<typeof ResolveTicketSchema>;
export type EscalateTicketDto = z.infer<typeof EscalateTicketSchema>;
