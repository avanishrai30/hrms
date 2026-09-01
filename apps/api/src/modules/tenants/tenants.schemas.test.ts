import { describe, expect, it } from "vitest";
import { createTenantSchema, updateBrandingSchema } from "./tenants.schemas.js";

describe("tenant schemas", () => {
  it("accepts VC Organics as tenant one with custom domain", () => {
    const result = createTenantSchema.safeParse({
      name: "VC Organics",
      slug: "vc-organics",
      legalName: "VC Organics",
      primaryDomain: "hr.vcorganics.com"
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsafe branding colors", () => {
    const result = updateBrandingSchema.safeParse({
      displayName: "VC Organics",
      primaryColor: "green",
      secondaryColor: "#335c67",
      accentColor: "#f2b84b",
      pwaName: "VC Organics Workforce",
      pwaShortName: "VC-WMS"
    });

    expect(result.success).toBe(false);
  });
});

