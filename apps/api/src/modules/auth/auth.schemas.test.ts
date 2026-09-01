import { describe, expect, it } from "vitest";
import { emailLoginSchema, requestOtpSchema, verifyOtpSchema } from "./auth.schemas.js";

describe("auth schemas", () => {
  it("accepts tenant-aware email login input", () => {
    const result = emailLoginSchema.safeParse({
      tenantSlug: "vc-organics",
      identifier: "owner@vcorganics.com",
      password: "ChangeMe123!",
      deviceFingerprint: "test-device-123"
    });

    expect(result.success).toBe(true);
  });

  it("rejects short OTP codes", () => {
    const result = verifyOtpSchema.safeParse({
      tenantSlug: "vc-organics",
      identifier: "owner@vcorganics.com",
      challengeId: "00000000-0000-0000-0000-000000000001",
      code: "123",
      deviceFingerprint: "test-device-123"
    });

    expect(result.success).toBe(false);
  });

  it("requires a tenant slug for OTP requests", () => {
    expect(requestOtpSchema.safeParse({ tenantSlug: "", identifier: "owner@vcorganics.com" }).success).toBe(false);
  });
});

