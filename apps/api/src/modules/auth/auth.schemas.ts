import { z } from "zod";

export const emailLoginSchema = z.object({
  tenantSlug: z.string().min(2),
  identifier: z.string().min(3),
  password: z.string().min(8),
  deviceFingerprint: z.string().min(8)
});

export const platformLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const requestOtpSchema = z.object({
  tenantSlug: z.string().min(2),
  identifier: z.string().min(3)
});

export const verifyOtpSchema = z.object({
  tenantSlug: z.string().min(2),
  identifier: z.string().min(3),
  challengeId: z.string().uuid(),
  code: z.string().length(6),
  deviceFingerprint: z.string().min(8)
});

export type EmailLoginDto = z.infer<typeof emailLoginSchema>;
export type PlatformLoginDto = z.infer<typeof platformLoginSchema>;
export type RequestOtpDto = z.infer<typeof requestOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

