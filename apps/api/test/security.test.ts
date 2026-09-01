import { ExecutionContext, HttpException } from "@nestjs/common";
import { collectPermissions, hasPermission } from "@vc-wms/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimiterGuard } from "../src/modules/security/rate-limiter.guard.js";
import {
  recordSuspiciousActivitySchema,
  resolveSuspiciousActivitySchema,
  securityAlertQuerySchema
} from "../src/modules/security/security.schemas.js";
import { SecurityService } from "../src/modules/security/security.service.js";
import { SessionMonitorService } from "../src/modules/security/session-monitor.service.js";

describe("Sprint 8: Security Hardening Tests", () => {
  describe("Security Schemas Validation", () => {
    it("validates securityAlertQuerySchema and resolveSuspiciousActivitySchema", () => {
      const validQuery = {
        severity: "HIGH",
        activityType: "RAPID_TRAVEL",
        isResolved: "false",
        page: "1",
        limit: "25"
      };
      const parsed = securityAlertQuerySchema.parse(validQuery);
      expect(parsed.severity).toBe("HIGH");
      expect(parsed.activityType).toBe("RAPID_TRAVEL");
      expect(parsed.isResolved).toBe(false);
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(25);

      const validResolve = {
        resolutionNote: "Verified with employee over phone call"
      };
      expect(resolveSuspiciousActivitySchema.safeParse(validResolve).success).toBe(true);

      const validRecord = {
        userId: "11111111-1111-1111-1111-111111111111",
        activityType: "FAILED_BIOMETRIC",
        severity: "MEDIUM",
        details: { failureCount: 5 }
      };
      expect(recordSuspiciousActivitySchema.safeParse(validRecord).success).toBe(true);
    });
  });

  describe("RateLimiterGuard", () => {
    it("enforces per-IP sliding window rate limit", () => {
      const guard = new RateLimiterGuard(undefined, {
        ipMaxRequests: 3,
        ipWindowMs: 1000,
        tenantMaxRequests: 10,
        tenantWindowMs: 1000
      });

      const createMockContext = (ip: string) => {
        const headers: Record<string, string> = {};
        const responseHeaders: Record<string, unknown> = {};
        const req = { ip, headers, user: undefined };
        const res = {
          setHeader: (name: string, value: unknown) => {
            responseHeaders[name] = value;
          }
        };
        return {
          context: {
            switchToHttp: () => ({
              getRequest: () => req,
              getResponse: () => res
            }),
            getHandler: () => ({}),
            getClass: () => ({})
          } as unknown as ExecutionContext,
          responseHeaders
        };
      };

      const { context: ctx1, responseHeaders: res1 } = createMockContext("192.168.1.1");
      expect(guard.canActivate(ctx1)).toBe(true);
      expect(res1["X-RateLimit-Remaining-IP"]).toBe(2);

      const { context: ctx2, responseHeaders: res2 } = createMockContext("192.168.1.1");
      expect(guard.canActivate(ctx2)).toBe(true);
      expect(res2["X-RateLimit-Remaining-IP"]).toBe(1);

      const { context: ctx3, responseHeaders: res3 } = createMockContext("192.168.1.1");
      expect(guard.canActivate(ctx3)).toBe(true);
      expect(res3["X-RateLimit-Remaining-IP"]).toBe(0);

      // 4th request from same IP should throw 429
      const { context: ctx4 } = createMockContext("192.168.1.1");
      expect(() => guard.canActivate(ctx4)).toThrow(HttpException);

      // Different IP should still be allowed
      const { context: ctxOther } = createMockContext("10.0.0.1");
      expect(guard.canActivate(ctxOther)).toBe(true);
    });

    it("enforces per-tenant rate limit", () => {
      const guard = new RateLimiterGuard(undefined, {
        ipMaxRequests: 100,
        ipWindowMs: 1000,
        tenantMaxRequests: 2,
        tenantWindowMs: 1000
      });

      const createTenantContext = (tenantId: string, ip: string) => {
        const headers: Record<string, string> = {};
        const responseHeaders: Record<string, unknown> = {};
        const req = { ip, headers, user: { tenantId } };
        const res = {
          setHeader: (name: string, value: unknown) => {
            responseHeaders[name] = value;
          }
        };
        return {
          context: {
            switchToHttp: () => ({
              getRequest: () => req,
              getResponse: () => res
            }),
            getHandler: () => ({}),
            getClass: () => ({})
          } as unknown as ExecutionContext,
          responseHeaders
        };
      };

      const { context: ctx1 } = createTenantContext("tenant-alpha", "10.0.0.1");
      expect(guard.canActivate(ctx1)).toBe(true);

      const { context: ctx2 } = createTenantContext("tenant-alpha", "10.0.0.2");
      expect(guard.canActivate(ctx2)).toBe(true);

      // 3rd request from tenant-alpha should throw 429 even from different IP
      const { context: ctx3 } = createTenantContext("tenant-alpha", "10.0.0.3");
      expect(() => guard.canActivate(ctx3)).toThrow(HttpException);

      // Another tenant should still be allowed
      const { context: ctxBeta } = createTenantContext("tenant-beta", "10.0.0.1");
      expect(guard.canActivate(ctxBeta)).toBe(true);
    });
  });

  describe("SessionMonitorService Anomaly Detection", () => {
    let mockPrisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;
    let mockAudit: { record: ReturnType<typeof vi.fn> };
    let monitor: SessionMonitorService;

    beforeEach(() => {
      mockPrisma = {
        locationVerification: {
          findFirst: vi.fn().mockResolvedValue(null)
        },
        session: {
          findMany: vi.fn().mockResolvedValue([])
        },
        suspiciousActivity: {
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "activity-1", ...data }))
        }
      };

      mockAudit = {
        record: vi.fn().mockResolvedValue({})
      };

      monitor = new SessionMonitorService(mockPrisma as never, mockAudit as never);
    });

    it("calculates accurate Haversine distance", () => {
      // Mumbai (19.0760, 72.8777) to Delhi (28.7041, 77.1025) is ~ 1150 km
      const distance = monitor.calculateDistanceKm(19.0760, 72.8777, 28.7041, 77.1025);
      expect(distance).toBeGreaterThan(1100);
      expect(distance).toBeLessThan(1200);
    });

    it("detects rapid travel anomaly when impossible speed is detected", async () => {
      const mumbaiCoords = { latitude: 19.0760, longitude: 72.8777 };
      const delhiCoords = { latitude: 28.7041, longitude: 77.1025 };

      const time1 = new Date("2026-08-31T10:00:00Z");
      const time2 = new Date("2026-08-31T10:15:00Z"); // 15 minutes later (~4600 km/h)

      const result = await monitor.detectRapidTravel({
        tenantId: "tenant-1",
        userId: "user-1",
        previousCoords: mumbaiCoords,
        previousTimestamp: time1,
        currentCoords: delhiCoords,
        currentTimestamp: time2
      });

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("CRITICAL");
      expect(mockPrisma.suspiciousActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: "tenant-1",
            activityType: "RAPID_TRAVEL",
            severity: "CRITICAL"
          })
        })
      );
      expect(mockAudit.record).toHaveBeenCalled();
    });

    it("does not flag realistic travel speed as rapid travel anomaly", async () => {
      const officeA = { latitude: 19.0760, longitude: 72.8777 };
      const officeB = { latitude: 19.1000, longitude: 72.9000 }; // ~3.5 km away

      const time1 = new Date("2026-08-31T10:00:00Z");
      const time2 = new Date("2026-08-31T10:30:00Z"); // 30 minutes later (7 km/h)

      const result = await monitor.detectRapidTravel({
        tenantId: "tenant-1",
        userId: "user-1",
        previousCoords: officeA,
        previousTimestamp: time1,
        currentCoords: officeB,
        currentTimestamp: time2
      });

      expect(result.isAnomaly).toBe(false);
      expect(mockPrisma.suspiciousActivity.create).not.toHaveBeenCalled();
    });

    it("detects location spoofing when mock GPS, GPS/IP country mismatch, or VPN is present", async () => {
      const resultMock = await monitor.detectLocationSpoof({
        tenantId: "tenant-1",
        userId: "user-1",
        accuracyMeters: 10,
        isMockLocation: true
      });
      expect(resultMock.isAnomaly).toBe(true);
      expect(resultMock.severity).toBe("HIGH");

      const resultMismatch = await monitor.detectLocationSpoof({
        tenantId: "tenant-1",
        userId: "user-1",
        accuracyMeters: 50,
        gpsCountry: "IN",
        ipCountry: "US"
      });
      expect(resultMismatch.isAnomaly).toBe(true);
      expect(resultMismatch.reasons).toContain("Country mismatch: GPS (IN) vs IP (US)");

      const resultNormal = await monitor.detectLocationSpoof({
        tenantId: "tenant-1",
        userId: "user-1",
        accuracyMeters: 15,
        isMockLocation: false
      });
      expect(resultNormal.isAnomaly).toBe(false);
    });

    it("detects multi-device anomaly across concurrent sessions", async () => {
      mockPrisma.session.findMany.mockResolvedValueOnce([
        { id: "s-1", deviceFingerprint: "device-1", ipAddress: "10.0.0.1", createdAt: new Date() },
        { id: "s-2", deviceFingerprint: "device-2", ipAddress: "10.0.0.2", createdAt: new Date() },
        { id: "s-3", deviceFingerprint: "device-3", ipAddress: "10.0.0.3", createdAt: new Date() }
      ]);

      const result = await monitor.detectMultiDeviceAnomaly({
        tenantId: "tenant-1",
        userId: "user-1",
        currentFingerprint: "device-4",
        currentIp: "10.0.0.4"
      });

      expect(result.isAnomaly).toBe(true);
      expect(mockPrisma.suspiciousActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            activityType: "MULTI_DEVICE"
          })
        })
      );
    });

    it("detects unusual hours anomaly during midnight hours", async () => {
      const earlyMorning = new Date("2026-08-31T02:30:00");
      const result = await monitor.detectUnusualHours("tenant-1", "user-1", earlyMorning);
      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("LOW");

      const daytime = new Date("2026-08-31T14:30:00");
      const resultDay = await monitor.detectUnusualHours("tenant-1", "user-1", daytime);
      expect(resultDay.isAnomaly).toBe(false);
    });
  });

  describe("SecurityService Operations", () => {
    let mockPrisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;
    let mockAudit: { record: ReturnType<typeof vi.fn> };
    let securityService: SecurityService;

    beforeEach(() => {
      mockPrisma = {
        suspiciousActivity: {
          findMany: vi.fn().mockResolvedValue([
            { id: "alert-1", activityType: "RAPID_TRAVEL", severity: "HIGH", isResolved: false }
          ]),
          count: vi.fn().mockResolvedValue(1),
          findFirst: vi.fn().mockResolvedValue({
            id: "alert-1",
            tenantId: "tenant-1",
            activityType: "RAPID_TRAVEL",
            severity: "HIGH",
            isResolved: false,
            details: {}
          }),
          update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "alert-1", ...data })),
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "alert-new", ...data })),
          groupBy: vi.fn().mockImplementation(({ by }) => {
            if (by[0] === "severity") {
              return Promise.resolve([
                { severity: "HIGH", _count: { _all: 3 } },
                { severity: "LOW", _count: { _all: 1 } }
              ]);
            }
            if (by[0] === "activityType") {
              return Promise.resolve([
                { activityType: "RAPID_TRAVEL", _count: { _all: 2 } },
                { activityType: "LOCATION_SPOOF", _count: { _all: 2 } }
              ]);
            }
            return Promise.resolve([]);
          })
        },
        tenantMembership: {
          findUnique: vi.fn().mockResolvedValue({ id: "mem-1" })
        }
      };

      mockAudit = {
        record: vi.fn().mockResolvedValue({})
      };

      securityService = new SecurityService(mockPrisma as never, mockAudit as never);
    });

    it("listAlerts filters with tenantId, severity, and pagination", async () => {
      const res = await securityService.listAlerts("tenant-1", {
        severity: "HIGH",
        page: 1,
        limit: 10
      });

      expect(res.items.length).toBe(1);
      expect(mockPrisma.suspiciousActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            severity: "HIGH"
          })
        })
      );
    });

    it("resolveAlert marks alert as resolved with note and audit log", async () => {
      const res = await securityService.resolveAlert(
        "tenant-1",
        "alert-1",
        "admin-user-1",
        "False positive: Employee flew for client meeting"
      );

      expect(res.isResolved).toBe(true);
      expect(res.resolvedById).toBe("admin-user-1");
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-1",
          action: "security.alert_resolved",
          resourceType: "SuspiciousActivity"
        })
      );
    });

    it("getSecurityMetrics aggregates summary, severity, and type metrics", async () => {
      mockPrisma.suspiciousActivity.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4)  // open
        .mockResolvedValueOnce(6)  // resolved
        .mockResolvedValueOnce(2); // last24h

      const metrics = await securityService.getSecurityMetrics("tenant-1");
      expect(metrics.summary.totalAlerts).toBe(10);
      expect(metrics.summary.openAlerts).toBe(4);
      expect(metrics.summary.resolvedAlerts).toBe(6);
      expect(metrics.summary.last24hAlerts).toBe(2);
      expect(metrics.bySeverity.HIGH).toBe(3);
      expect(metrics.byActivityType.RAPID_TRAVEL).toBe(2);
    });
  });

  describe("Security RBAC Permissions", () => {
    it("grants security permissions to TENANT_OWNER, TENANT_ADMIN, and HR_ADMIN", () => {
      for (const role of ["TENANT_OWNER", "TENANT_ADMIN"] as const) {
        const perms = collectPermissions([role]);
        expect(hasPermission(perms, "security.view")).toBe(true);
        expect(hasPermission(perms, "security.manage")).toBe(true);
      }

      const hrPerms = collectPermissions(["HR_ADMIN"]);
      expect(hasPermission(hrPerms, "security.view")).toBe(true);
      expect(hasPermission(hrPerms, "security.manage")).toBe(false);
    });

    it("denies security permissions to MANAGER and EMPLOYEE", () => {
      for (const role of ["MANAGER", "EMPLOYEE"] as const) {
        const perms = collectPermissions([role]);
        expect(hasPermission(perms, "security.view")).toBe(false);
        expect(hasPermission(perms, "security.manage")).toBe(false);
      }
    });
  });
});
