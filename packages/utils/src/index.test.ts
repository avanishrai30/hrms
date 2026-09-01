import { describe, expect, it } from "vitest";
import { assertTenantScopedPath, tenantCacheKey, tenantObjectKey } from "./index";

describe("tenant utility helpers", () => {
  it("builds tenant-scoped cache keys", () => {
    expect(tenantCacheKey("tenant-1", "employees", "list")).toBe("tenant:tenant-1:employees:list");
  });

  it("builds tenant-scoped storage keys", () => {
    expect(tenantObjectKey("tenant-1", "documents", "employee-1", "file-1")).toBe(
      "tenants/tenant-1/documents/employee-1/file-1"
    );
  });

  it("rejects storage keys outside tenant scope", () => {
    expect(() => assertTenantScopedPath("tenant-1", "tenants/tenant-2/documents/file")).toThrow(
      "Object key is outside the active tenant scope."
    );
  });
});

