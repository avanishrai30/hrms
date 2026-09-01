import { z } from "zod";

export const InitiateExitClearanceSchema = z.object({
  employeeId: z.string().uuid(),
  resignationDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  lastWorkingDay: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  notes: z.string().optional().nullable()
});

export const CompleteClearanceTaskSchema = z.object({
  remarks: z.string().optional().nullable(),
  assetsRecovered: z.array(z.string()).optional().default([]),
  duesAmount: z.number().min(0).default(0)
});

export type InitiateExitClearanceDto = z.infer<typeof InitiateExitClearanceSchema>;
export type CompleteClearanceTaskDto = z.infer<typeof CompleteClearanceTaskSchema>;
