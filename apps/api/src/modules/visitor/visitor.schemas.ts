import { z } from "zod";

export const PreRegisterVisitorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  idProofType: z.string().optional().nullable(),
  idProofNum: z.string().optional().nullable(),
  hostId: z.string().uuid(),
  purpose: z.string().min(1),
  expectedTime: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  notes: z.string().optional().nullable()
});

export const CheckInVisitorSchema = z.object({
  visitId: z.string().uuid().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional().nullable(),
  hostId: z.string().uuid().optional(),
  purpose: z.string().optional(),
  badgeNumber: z.string().optional().nullable()
});

export const CheckOutVisitorSchema = z.object({
  visitId: z.string().uuid()
});

export const CreateGatePassSchema = z.object({
  type: z.enum([
    "MATERIAL_OUTWARD",
    "MATERIAL_INWARD",
    "EMPLOYEE_EXIT",
    "CONTRACTOR_EXIT"
  ]).default("MATERIAL_OUTWARD"),
  itemDescription: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  serialNumbers: z.array(z.string()).optional().default([]),
  destination: z.string().min(1),
  vehicleNumber: z.string().optional().nullable(),
  driverName: z.string().optional().nullable(),
  returnExpected: z.boolean().default(false),
  expectedReturn: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  notes: z.string().optional().nullable()
});

export const ApproveGatePassSchema = z.object({
  role: z.enum(["MANAGER", "SECURITY"]),
  approved: z.boolean().default(true),
  notes: z.string().optional().nullable()
});

export const CreateContractorSchema = z.object({
  companyName: z.string().min(1),
  contractCode: z.string().min(1),
  contactPerson: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional().nullable(),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  totalWorkers: z.number().int().min(1).default(1),
  safetyDocUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const AddContractorWorkerPassSchema = z.object({
  contractorId: z.string().uuid(),
  workerName: z.string().min(1),
  badgeNumber: z.string().min(1),
  allowedZones: z.array(z.string()).optional().default([]),
  validFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  validUntil: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
});

export type PreRegisterVisitorDto = z.infer<typeof PreRegisterVisitorSchema>;
export type CheckInVisitorDto = z.infer<typeof CheckInVisitorSchema>;
export type CheckOutVisitorDto = z.infer<typeof CheckOutVisitorSchema>;
export type CreateGatePassDto = z.infer<typeof CreateGatePassSchema>;
export type ApproveGatePassDto = z.infer<typeof ApproveGatePassSchema>;
export type CreateContractorDto = z.infer<typeof CreateContractorSchema>;
export type AddContractorWorkerPassDto = z.infer<typeof AddContractorWorkerPassSchema>;
