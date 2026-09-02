import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const seedSource = readFileSync(new URL("../prisma/seed.ts", import.meta.url), "utf8");

describe("bootstrap seed password reconciliation", () => {
  it("updates existing seeded platform and tenant user password hashes from BOOTSTRAP_PASSWORD", () => {
    expect(seedSource).toContain("process.env.BOOTSTRAP_PASSWORD");
    expect(seedSource).toContain("update: { passwordHash: bootstrapPasswordHash, role: \"PLATFORM_SUPER_ADMIN\", status: \"ACTIVE\" }");
    expect(seedSource).toContain("update: { passwordHash: tenantUserPasswordHash, status: \"ACTIVE\" }");
  });
});
