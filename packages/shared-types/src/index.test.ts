import { describe, expect, it } from "vitest";
import type { TenantContext } from "./index";

describe("shared tenant types", () => {
  it("models a tenant context with explicit membership and permissions", () => {
    const context: TenantContext = {
      tenantId: "tenant-1",
      tenantSlug: "vc-organics",
      userId: "user-1",
      membershipId: "membership-1",
      roles: ["TENANT_OWNER"],
      permissions: ["tenant.dashboard.read"],
      plan: "STANDARD"
    };

    expect(context.tenantSlug).toBe("vc-organics");
    expect(context.permissions).toContain("tenant.dashboard.read");
  });
});

