import { z } from "zod";

export const CreateVendorSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  address: z.record(z.unknown()).optional()
});
export type CreateVendorDto = z.infer<typeof CreateVendorSchema>;

export const CreateContractSchema = z.object({
  vendorId: z.string().uuid(),
  contractNumber: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  valueInInr: z.number().nonnegative(),
  termsAndNotes: z.string().optional(),
  slaRating: z.number().min(1).max(5).default(5.0)
});
export type CreateContractDto = z.infer<typeof CreateContractSchema>;

export const CreateComplianceSchema = z.object({
  vendorId: z.string().uuid(),
  complianceType: z.string().min(1),
  documentNumber: z.string().optional(),
  validUntil: z.string().optional(),
  isVerified: z.boolean().default(false),
  status: z.enum(["COMPLIANT", "NON_COMPLIANT", "EXPIRING_SOON", "EXPIRED"]).default("COMPLIANT"),
  notes: z.string().optional()
});
export type CreateComplianceDto = z.infer<typeof CreateComplianceSchema>;
