/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpStatus, HttpException, ForbiddenException } from "@nestjs/common";
import { GlobalExceptionFilter } from "../src/modules/common/global-exception.filter.js";
import { AiToolRegistryService } from "../src/modules/ai/tools/ai-tool-registry.service.js";
import { RateLimiterGuard } from "../src/modules/security/rate-limiter.guard.js";
import { ROLE_PERMISSIONS } from "@vc-wms/auth";

describe("Task 10 — Platform Admin & Production Hardening Test Suite", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  describe("1. Global Exception Filter & Information Leakage Redaction", () => {
    let filter: GlobalExceptionFilter;
    let mockResponse: any;
    let mockRequest: any;
    let mockHost: any;

    beforeEach(() => {
      filter = new GlobalExceptionFilter();
      mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      mockRequest = {
        url: "/api/v1/tenant/settings",
        originalUrl: "/api/v1/tenant/settings",
        method: "PATCH"
      };
      mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest
        })
      };
    });

    it("should format standard HttpException into consistent production structure", () => {
      process.env.NODE_ENV = "production";
      const exception = new ForbiddenException("Missing required permission: tenant.settings.update");

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          path: "/api/v1/tenant/settings",
          message: "Missing required permission: tenant.settings.update"
        })
      );
    });

    it("should redact Prisma database internals, queries, and table names in production", () => {
      process.env.NODE_ENV = "production";
      const prismaUniqueViolation = {
        name: "PrismaClientKnownRequestError",
        code: "P2002",
        message: 'Unique constraint failed on the fields: (`tenant_id`,`slug`). SELECT * FROM "tenants" WHERE "slug" = $1'
      };

      filter.catch(prismaUniqueViolation, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const jsonResponse = mockResponse.json.mock.calls[0][0];
      expect(jsonResponse.statusCode).toBe(400);
      expect(jsonResponse.code).toBe("P2002");
      // Must NOT leak SQL or raw database details
      expect(jsonResponse.message).toBe("A record with this unique identifier already exists.");
      expect(JSON.stringify(jsonResponse)).not.toContain("SELECT");
      expect(JSON.stringify(jsonResponse)).not.toContain("tenants");
    });

    it("should sanitize unexpected runtime errors in production mode", () => {
      process.env.NODE_ENV = "production";
      const internalError = new Error("Database connection timed out at postgresql://postgres:password123@10.0.0.5:5432/hrms");

      filter.catch(internalError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const jsonResponse = mockResponse.json.mock.calls[0][0];
      expect(jsonResponse.message).toBe("An unexpected error occurred. Please contact support if the problem persists.");
      expect(JSON.stringify(jsonResponse)).not.toContain("password123");
      expect(JSON.stringify(jsonResponse)).not.toContain("postgresql://");
    });

    it("should include debug message in non-production environments", () => {
      process.env.NODE_ENV = "development";
      const internalError = new Error("Debug stack trace details for local developer");

      filter.catch(internalError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const jsonResponse = mockResponse.json.mock.calls[0][0];
      expect(jsonResponse.message).toBe("Debug stack trace details for local developer");
    });
  });

  describe("2. AI Tool Registry & Human Confirmation Security", () => {
    let mockPrisma: any;
    let mockAudit: any;
    let mockKnowledge: any;
    let registry: AiToolRegistryService;

    const tenantA = "11111111-1111-1111-1111-111111111111";
    const tenantB = "22222222-2222-2222-2222-222222222222";
    const userA = "user-a";
    const userB = "user-b";

    beforeEach(() => {
      mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: userA, email: "alice@acme.com" })
        },
        employee: {
          findFirst: vi.fn().mockResolvedValue({ id: "emp-alice", tenantId: tenantA, email: "alice@acme.com" })
        },
        leaveRequest: {
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "leave-1", ...data }))
        }
      };
      mockAudit = { record: vi.fn().mockResolvedValue(undefined) };
      mockKnowledge = { searchKnowledge: vi.fn().mockResolvedValue([]) };

      registry = new AiToolRegistryService(mockPrisma, mockAudit, mockKnowledge);
    });

    it("should generate random confirmation token for mutating tools and require human confirmation", async () => {
      const result = await registry.executeTool({
        tenantId: tenantA,
        userId: userA,
        userPermissions: ["leave.create", "leave.view"],
        toolName: "submit_leave_request",
        parameters: {
          leaveTypeId: "annual",
          startDate: "2026-10-01",
          endDate: "2026-10-03",
          reason: "Annual vacation"
        }
      });

      expect(result.type).toBe("PROPOSAL");
      if (result.type === "PROPOSAL") {
        expect(result.confirmationToken).toBeDefined();
        expect(typeof result.confirmationToken).toBe("string");
        expect(result.confirmationToken.length).toBeGreaterThan(30);
        expect(result.previewText).toContain("Submit leave request");
      }
    });

    it("should strictly reject cross-tenant execution of a confirmation token", async () => {
      const proposal = await registry.executeTool({
        tenantId: tenantA,
        userId: userA,
        userPermissions: ["leave.create", "leave.view"],
        toolName: "submit_leave_request",
        parameters: {
          leaveTypeId: "annual",
          startDate: "2026-10-01",
          endDate: "2026-10-03"
        }
      });

      expect(proposal.type).toBe("PROPOSAL");
      if (proposal.type === "PROPOSAL") {
        // Attempt confirmation from Tenant B
        await expect(
          registry.confirmToolExecution({
            tenantId: tenantB, // Wrong tenant!
            userId: userA,
            userPermissions: ["leave.create"],
            confirmationToken: proposal.confirmationToken
          })
        ).rejects.toThrow("Unauthorized: proposal token does not match active security context.");
      }
    });

    it("should strictly reject cross-user execution of a confirmation token", async () => {
      const proposal = await registry.executeTool({
        tenantId: tenantA,
        userId: userA,
        userPermissions: ["leave.create", "leave.view"],
        toolName: "submit_leave_request",
        parameters: {
          leaveTypeId: "annual",
          startDate: "2026-10-01",
          endDate: "2026-10-03"
        }
      });

      expect(proposal.type).toBe("PROPOSAL");
      if (proposal.type === "PROPOSAL") {
        // Attempt confirmation from User B in same tenant
        await expect(
          registry.confirmToolExecution({
            tenantId: tenantA,
            userId: userB, // Wrong user!
            userPermissions: ["leave.create"],
            confirmationToken: proposal.confirmationToken
          })
        ).rejects.toThrow("Unauthorized: proposal token does not match active security context.");
      }
    });

    it("should reject execution if required permission was revoked between proposal and confirmation", async () => {
      const proposal = await registry.executeTool({
        tenantId: tenantA,
        userId: userA,
        userPermissions: ["leave.create", "leave.view"],
        toolName: "submit_leave_request",
        parameters: {
          leaveTypeId: "annual",
          startDate: "2026-10-01",
          endDate: "2026-10-03"
        }
      });

      expect(proposal.type).toBe("PROPOSAL");
      if (proposal.type === "PROPOSAL") {
        // Permission was revoked
        await expect(
          registry.confirmToolExecution({
            tenantId: tenantA,
            userId: userA,
            userPermissions: ["leave.view"], // Missing leave.create!
            confirmationToken: proposal.confirmationToken
          })
        ).rejects.toThrow("User lacks permission to execute 'submit_leave_request'.");
      }
    });
  });

  describe("3. Production Rate Limiting & Denial of Service Protection", () => {
    it("should enforce per-IP rate limiting and return 429 when threshold is reached", () => {
      const guard = new RateLimiterGuard(undefined, {
        ipMaxRequests: 3,
        ipWindowMs: 60000,
        tenantMaxRequests: 100,
        tenantWindowMs: 60000
      });

      const setHeaderMock = vi.fn();
      const createMockContext = (ip: string) => ({
        switchToHttp: () => ({
          getRequest: () => ({
            ip,
            headers: {}
          }),
          getResponse: () => ({
            setHeader: setHeaderMock
          })
        }),
        getHandler: () => ({}),
        getClass: () => ({})
      }) as any;

      // 3 allowed hits
      expect(guard.canActivate(createMockContext("192.168.1.100"))).toBe(true);
      expect(guard.canActivate(createMockContext("192.168.1.100"))).toBe(true);
      expect(guard.canActivate(createMockContext("192.168.1.100"))).toBe(true);

      // 4th hit must throw 429
      expect(() => guard.canActivate(createMockContext("192.168.1.100"))).toThrow(HttpException);
      expect(setHeaderMock).toHaveBeenCalledWith("Retry-After", expect.any(Number));
    });

    it("should enforce per-tenant rate limiting independently", () => {
      const guard = new RateLimiterGuard(undefined, {
        ipMaxRequests: 100,
        ipWindowMs: 60000,
        tenantMaxRequests: 2,
        tenantWindowMs: 60000
      });

      const createTenantContext = (tenantId: string, ip: string) => ({
        switchToHttp: () => ({
          getRequest: () => ({
            ip,
            user: { tenantId },
            headers: {}
          }),
          getResponse: () => ({
            setHeader: vi.fn()
          })
        }),
        getHandler: () => ({}),
        getClass: () => ({})
      }) as any;

      // Tenant A hits
      expect(guard.canActivate(createTenantContext("tenant-a", "10.0.0.1"))).toBe(true);
      expect(guard.canActivate(createTenantContext("tenant-a", "10.0.0.2"))).toBe(true);
      expect(() => guard.canActivate(createTenantContext("tenant-a", "10.0.0.3"))).toThrow(HttpException);

      // Tenant B should still be allowed
      expect(guard.canActivate(createTenantContext("tenant-b", "10.0.0.4"))).toBe(true);
    });
  });

  describe("4. RBAC Roles & System Permission Integrity", () => {
    it("should ensure TENANT_ADMIN has access to administrative and security features", () => {
      const adminPermissions = ROLE_PERMISSIONS.TENANT_ADMIN;
      expect(adminPermissions).toContain("tenant.settings.read");
      expect(adminPermissions).toContain("tenant.settings.update");
      expect(adminPermissions).toContain("tenant.branding.read");
      expect(adminPermissions).toContain("tenant.branding.update");
      expect(adminPermissions).toContain("roles.read");
      expect(adminPermissions).toContain("users.read");
      expect(adminPermissions).toContain("security.view");
      expect(adminPermissions).toContain("security.manage");
    });

    it("should ensure EMPLOYEE role cannot access tenant settings or security management", () => {
      const employeePermissions = ROLE_PERMISSIONS.EMPLOYEE;
      expect(employeePermissions).not.toContain("tenant.settings.update");
      expect(employeePermissions).not.toContain("tenant.branding.update");
      expect(employeePermissions).not.toContain("security.manage");
      expect(employeePermissions).not.toContain("roles.create");
      expect(employeePermissions).not.toContain("payroll.process");
    });
  });
});
