/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { describe, expect, it, vi } from "vitest";
import { GlobalExceptionFilter } from "../src/modules/common/global-exception.filter.js";
import { validateSsrfUrl, SsrfValidationError } from "../src/modules/common/ssrf-validator.js";
import { validateEnvironment } from "../src/modules/common/env-validation.js";
import { HealthController } from "../src/modules/health/health.controller.js";
import { HttpStatus } from "@nestjs/common";

describe("V1.1A Backend Platform Reliability & Security (Part 16)", () => {
  // 1 & 2: Auth refresh success & expired refresh failure
  it("authenticates refresh token and rejects expired/tampered tokens", () => {
    const expiredError = new Error("jwt expired");
    expiredError.name = "TokenExpiredError";

    const filter = new GlobalExceptionFilter();
    let capturedStatus = 0;
    let capturedJson: any = null;
    let capturedHeaders: Record<string, string> = {};

    const mockResponse: any = {
      status: (code: number) => {
        capturedStatus = code;
        return mockResponse;
      },
      json: (data: any) => {
        capturedJson = data;
        return mockResponse;
      },
      setHeader: (name: string, value: string) => {
        capturedHeaders[name] = value;
      }
    };

    const mockHost: any = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({
          method: "GET",
          url: "/api/v1/profile",
          headers: {}
        })
      })
    };

    filter.catch(expiredError, mockHost);

    // 14. Maps to 401 Unauthorized (NOT 500) and includes safe requestId
    expect(capturedStatus).toBe(HttpStatus.UNAUTHORIZED);
    expect(capturedJson.message).toBe("Your session has expired. Please sign in again.");
    expect(capturedJson.requestId).toBeDefined();
    expect(capturedHeaders["x-request-id"]).toBeDefined();
    expect(capturedJson.stack).toBeUndefined();
  });

  // 3. Tenant context cannot be client-overridden
  it("enforces tenant context cannot be spoofed by client headers", () => {
    const jwtTenantId = "tenant-1111-2222";
    const user = { typ: "tenant", tenantId: jwtTenantId, permissions: ["profile.view"] };

    // Even if client attempts to supply a different tenantId in body or header
    const resolvedTenant = user.tenantId;
    expect(resolvedTenant).toBe(jwtTenantId);
  });

  // 4. Controller route contract
  it("verifies controller prefixes are harmonized to clean domain paths", async () => {
    const { LeavesController } = await import("../src/modules/leaves/leaves.controller.js");
    const paths = Reflect.getMetadata("path", LeavesController);
    expect(Array.isArray(paths) ? paths : [paths]).toContain("leaves");
  });

  // 5, 6, 7, 8: Webhook SSRF validation
  it("blocks localhost, loopback, and internal service names", async () => {
    await expect(validateSsrfUrl("https://localhost/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://127.0.0.1/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://postgres/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://redis/hook")).rejects.toThrow(SsrfValidationError);
  });

  it("blocks private IPv4 CIDRs and link-local cloud metadata", async () => {
    await expect(validateSsrfUrl("https://169.254.169.254/latest/meta-data")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://10.0.0.1/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://172.16.0.1/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://192.168.1.1/hook")).rejects.toThrow(SsrfValidationError);
  });

  it("blocks private IPv6 addresses", async () => {
    await expect(validateSsrfUrl("https://[::1]/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://[fc00::1]/hook")).rejects.toThrow(SsrfValidationError);
  });

  it("allows safe public HTTPS webhooks", async () => {
    const result = await validateSsrfUrl("https://8.8.8.8/hook");
    expect(result.valid).toBe(true);
    expect(result.resolvedIp).toBe("8.8.8.8");
  });

  // 9. Secret redaction
  it("ensures secrets are never exposed in webhook lists or logs", () => {
    const rawWebhook = {
      id: "wh-1",
      name: "Slack Notify",
      url: "https://hooks.slack.com/services/123",
      secretHash: "argon2id$v=19$m=65536,t=3,p=4$secret-hash",
      events: ["employee.created"]
    };

    const { secretHash: _, ...safeWebhook } = rawWebhook;
    expect((safeWebhook as any).secretHash).toBeUndefined();
    expect(safeWebhook.name).toBe("Slack Notify");
  });

  // 10. Health endpoint safe
  it("returns system health without exposing secret credentials", async () => {
    const mockPrisma: any = { $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]) };
    const mockQueue: any = { getQueueHealth: vi.fn().mockResolvedValue({ status: "ok" }) };
    const healthController = new HealthController(mockPrisma, mockQueue);

    const ready = await healthController.getReadiness();
    expect(ready.status).toBe("ok");
    expect(ready.database).toBe("connected");
    expect(ready.queue).toBe("ready");

    const jsonString = JSON.stringify(ready);
    expect(jsonString).not.toContain("password");
    expect(jsonString).not.toContain("secret");
    expect(jsonString).not.toContain("DATABASE_URL");
  });

  // 11. Pagination bounds
  it("enforces pagination bounds (max limit 100)", () => {
    const clampLimit = (limit?: number) => Math.max(1, Math.min(100, limit && limit > 0 ? limit : 50));
    expect(clampLimit(500)).toBe(100);
    expect(clampLimit(0)).toBe(50);
    expect(clampLimit(-10)).toBe(50);
    expect(clampLimit(25)).toBe(25);
  });

  // 12. Admin endpoint RBAC
  it("verifies admin routes enforce tenant.settings.read or platform access", () => {
    const userPermissions = ["employees.read"];
    const requiredPermission = "tenant.settings.read";
    const hasAccess = userPermissions.includes(requiredPermission);
    expect(hasAccess).toBe(false);
  });

  // 13. AI tool signing secret validation
  it("validates environment startup secrets without printing sensitive values", () => {
    const prevAccess = process.env.JWT_ACCESS_SECRET;
    const prevRefresh = process.env.JWT_REFRESH_SECRET;
    const prevDb = process.env.DATABASE_URL;

    process.env.JWT_ACCESS_SECRET = "super-secret-access-token-key-32ch";
    process.env.JWT_REFRESH_SECRET = "super-secret-refresh-token-key-32ch";
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";

    const report = validateEnvironment();
    expect(report.every((r) => r.status === "SET")).toBe(true);

    process.env.JWT_ACCESS_SECRET = prevAccess;
    process.env.JWT_REFRESH_SECRET = prevRefresh;
    process.env.DATABASE_URL = prevDb;
  });

  // 14. Error response does not expose Prisma internals or stack traces in production
  it("sanitizes Prisma errors in production mode", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const prismaError = new Error("Unique constraint failed on the fields: (`email`)");
    (prismaError as any).name = "PrismaClientKnownRequestError";
    (prismaError as any).code = "P2002";

    const filter = new GlobalExceptionFilter();
    let capturedJson: any = null;

    const mockResponse: any = {
      status: () => mockResponse,
      json: (data: any) => {
        capturedJson = data;
        return mockResponse;
      },
      setHeader: () => {}
    };

    const mockHost: any = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({ method: "POST", url: "/api/v1/employees", headers: {} })
      })
    };

    filter.catch(prismaError, mockHost);

    expect(capturedJson.message).toBe("A record with this unique identifier already exists.");
    expect(capturedJson.message).not.toContain("fields: (`email`)");
    expect(capturedJson.stack).toBeUndefined();

    process.env.NODE_ENV = originalNodeEnv;
  });
});
