import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const createTenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  legalName: z.string().min(2),
  plan: z.enum(["TRIAL", "STANDARD", "PRO", "ENTERPRISE"]).default("STANDARD"),
  primaryDomain: z.string().min(3).optional(),
  timezone: z.string().default("Asia/Kolkata"),
  locale: z.string().default("en-IN"),
  currency: z.string().length(3).default("INR")
});

export const updateTenantSchema = createTenantSchema.partial().omit({ slug: true });

export const tenantStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"])
});

export const updateSettingsSchema = z.object({
  timezone: z.string().min(2).optional(),
  locale: z.string().min(2).optional(),
  currency: z.string().length(3).optional(),
  weekStartDay: z.number().int().min(0).max(6).optional(),
  payrollCycleDay: z.number().int().min(1).max(28).optional(),
  attendanceTimezone: z.string().min(2).optional(),
  defaultWorkingDaysPerMonth: z.number().int().min(1).max(31).optional(),
  metadata: z.record(z.unknown()).optional()
});

export const updateBrandingSchema = z.object({
  displayName: z.string().min(2),
  logoObjectKey: z.string().nullable().optional(),
  faviconObjectKey: z.string().nullable().optional(),
  primaryColor: hexColor,
  secondaryColor: hexColor,
  accentColor: hexColor,
  pwaName: z.string().min(2),
  pwaShortName: z.string().min(2).max(16)
});

export const upsertFeatureFlagSchema = z.object({
  key: z.string().min(3),
  enabled: z.boolean(),
  config: z.record(z.unknown()).default({})
});

export const createDomainSchema = z.object({
  domain: z.string().min(3),
  isPrimary: z.boolean().default(false)
});

export type CreateTenantDto = z.infer<typeof createTenantSchema>;
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
export type TenantStatusDto = z.infer<typeof tenantStatusSchema>;
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
export type UpdateBrandingDto = z.infer<typeof updateBrandingSchema>;
export type UpsertFeatureFlagDto = z.infer<typeof upsertFeatureFlagSchema>;
export type CreateDomainDto = z.infer<typeof createDomainSchema>;

