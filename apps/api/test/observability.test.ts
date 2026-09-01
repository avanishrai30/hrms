import { ExecutionContext } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StructuredLoggerService } from "../src/modules/observability/logger.service.js";
import { MetricsService } from "../src/modules/observability/metrics.service.js";
import { RequestLoggerInterceptor } from "../src/modules/observability/request-logger.interceptor.js";

describe("Sprint 7: Observability Module Tests", () => {
  describe("StructuredLoggerService", () => {
    it("formats structured JSON logs with context, tenantId, requestId, and metadata", () => {
      const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

      const logger = new StructuredLoggerService("AuthModule", "tenant-123", "req-456");
      logger.info("User login successful", undefined, { userId: "user-1" });

      expect(stdoutSpy).toHaveBeenCalled();
      const output = JSON.parse(stdoutSpy.mock.calls[0]![0] as string);
      expect(output.level).toBe("info");
      expect(output.context).toBe("AuthModule");
      expect(output.tenantId).toBe("tenant-123");
      expect(output.requestId).toBe("req-456");
      expect(output.message).toBe("User login successful");
      expect(output.metadata?.userId).toBe("user-1");
      expect(output.timestamp).toBeDefined();

      // Error level output to stderr
      logger.error("Authentication failed", "Error stack trace", "AuthModule", { code: "INVALID_CREDENTIALS" });
      expect(stderrSpy).toHaveBeenCalled();
      const errorOutput = JSON.parse(stderrSpy.mock.calls[0]![0] as string);
      expect(errorOutput.level).toBe("error");
      expect(errorOutput.error?.stack).toBe("Error stack trace");

      stdoutSpy.mockRestore();
      stderrSpy.mockRestore();
    });

    it("creates child loggers with withContext()", () => {
      const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const parentLogger = new StructuredLoggerService("ParentService", "tenant-1");
      const childLogger = parentLogger.withContext("ChildService", "tenant-2", "req-999");

      childLogger.log("Child message");
      const output = JSON.parse(stdoutSpy.mock.calls[0]![0] as string);
      expect(output.context).toBe("ChildService");
      expect(output.tenantId).toBe("tenant-2");
      expect(output.requestId).toBe("req-999");

      stdoutSpy.mockRestore();
    });
  });

  describe("MetricsService", () => {
    let metricsService: MetricsService;

    beforeEach(() => {
      metricsService = new MetricsService();
    });

    it("aggregates request count, status code distribution, and tenant metrics", () => {
      metricsService.recordRequest("GET", "/api/v1/attendance", 200, 45, "tenant-1");
      metricsService.recordRequest("POST", "/api/v1/attendance/check-in", 201, 120, "tenant-1");
      metricsService.recordRequest("GET", "/api/v1/employees/11111111-1111-1111-1111-111111111111", 404, 30, "tenant-2");
      metricsService.recordRequest("POST", "/api/v1/payroll/runs", 500, 850, "tenant-1");

      const summary = metricsService.getMetricsSummary();
      expect(summary.totalRequests).toBe(4);
      expect(summary.successfulRequests).toBe(2);
      expect(summary.clientErrorRequests).toBe(1);
      expect(summary.serverErrorRequests).toBe(1);
      expect(summary.statusCodes["200"]).toBe(1);
      expect(summary.statusCodes["201"]).toBe(1);
      expect(summary.statusCodes["404"]).toBe(1);
      expect(summary.statusCodes["500"]).toBe(1);
      expect(summary.activeTenantCount).toBe(2);

      const tenant1Metrics = metricsService.getTenantMetrics("tenant-1");
      expect(tenant1Metrics.requestCount).toBe(3);

      const tenant2Metrics = metricsService.getTenantMetrics("tenant-2");
      expect(tenant2Metrics.requestCount).toBe(1);
    });

    it("calculates latency histogram buckets and percentiles", () => {
      // Record 100 requests with varying latencies
      for (let i = 1; i <= 100; i++) {
        metricsService.recordRequest("GET", "/api/v1/health", 200, i * 10);
      }

      const summary = metricsService.getMetricsSummary();
      expect(summary.latencyHistogram.le50ms).toBeGreaterThan(0);
      expect(summary.latencyHistogram.le100ms).toBeGreaterThan(0);
      expect(summary.p50DurationMs).toBeGreaterThan(0);
      expect(summary.p95DurationMs).toBeGreaterThan(summary.p50DurationMs);
      expect(summary.p99DurationMs).toBeGreaterThanOrEqual(summary.p95DurationMs);
      expect(summary.averageDurationMs).toBeGreaterThan(0);
    });

    it("normalizes route paths to prevent high cardinality and tracks top routes", () => {
      metricsService.recordRequest("GET", "/api/v1/employees/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", 200, 20);
      metricsService.recordRequest("GET", "/api/v1/employees/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", 200, 30);
      metricsService.recordRequest("GET", "/api/v1/employees/cccccccc-cccc-cccc-cccc-cccccccccccc", 200, 40);

      const summary = metricsService.getMetricsSummary();
      const topRoute = summary.topRoutes.find((r) => r.route === "GET /api/v1/employees/:id");
      expect(topRoute).toBeDefined();
      expect(topRoute?.count).toBe(3);
      expect(topRoute?.avgDurationMs).toBe(30);
    });

    it("tracks error rates by error type and resets correctly", () => {
      metricsService.incrementErrorRate("UnauthorizedException", "tenant-1");
      metricsService.incrementErrorRate("UnauthorizedException", "tenant-1");
      metricsService.incrementErrorRate("ValidationException", "tenant-2");

      let summary = metricsService.getMetricsSummary();
      expect(summary.errorCounts["UnauthorizedException"]).toBe(2);
      expect(summary.errorCounts["ValidationException"]).toBe(1);

      metricsService.reset();
      summary = metricsService.getMetricsSummary();
      expect(summary.totalRequests).toBe(0);
      expect(summary.activeTenantCount).toBe(0);
      expect(Object.keys(summary.errorCounts).length).toBe(0);
    });
  });

  describe("RequestLoggerInterceptor", () => {
    let metricsService: MetricsService;
    let interceptor: RequestLoggerInterceptor;

    beforeEach(() => {
      metricsService = new MetricsService();
      interceptor = new RequestLoggerInterceptor(metricsService);
    });

    it("logs successful request and records metrics", async () => {
      const mockReq = {
        method: "GET",
        originalUrl: "/api/v1/attendance",
        headers: { "x-request-id": "custom-req-id" },
        user: { tenantId: "tenant-abc" }
      };
      const mockRes = {
        statusCode: 200,
        setHeader: vi.fn()
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes
        })
      } as unknown as ExecutionContext;

      const mockCallHandler = {
        handle: () => of({ data: "ok" })
      };

      const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockContext, mockCallHandler).subscribe({
          next: () => {
            expect(mockRes.setHeader).toHaveBeenCalledWith("X-Request-Id", "custom-req-id");
            expect(metricsService.getMetricsSummary().totalRequests).toBe(1);
            expect(metricsService.getMetricsSummary().successfulRequests).toBe(1);
            expect(stdoutSpy).toHaveBeenCalled();
            stdoutSpy.mockRestore();
            resolve();
          }
        });
      });
    });

    it("logs failed request and increments error metrics", async () => {
      const mockReq = {
        method: "POST",
        originalUrl: "/api/v1/auth/login",
        headers: {},
        user: { tenantId: "tenant-xyz" }
      };
      const mockRes = {
        statusCode: 401,
        setHeader: vi.fn()
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes
        })
      } as unknown as ExecutionContext;

      const error = Object.assign(new Error("Invalid password"), { status: 401 });

      const mockCallHandler = {
        handle: () => throwError(() => error)
      };

      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

      await new Promise<void>((resolve) => {
        interceptor.intercept(mockContext, mockCallHandler).subscribe({
          error: (err) => {
            expect(err.message).toBe("Invalid password");
            expect(metricsService.getMetricsSummary().totalRequests).toBe(1);
            expect(metricsService.getMetricsSummary().clientErrorRequests).toBe(1);
            expect(stderrSpy).toHaveBeenCalled();
            stderrSpy.mockRestore();
            resolve();
          }
        });
      });
    });
  });
});
