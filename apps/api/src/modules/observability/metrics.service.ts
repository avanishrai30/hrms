import { Injectable } from "@nestjs/common";

export interface LatencyHistogram {
  le50ms: number;
  le100ms: number;
  le250ms: number;
  le500ms: number;
  le1000ms: number;
  le2500ms: number;
  gt2500ms: number;
}

export interface MetricsSummary {
  totalRequests: number;
  successfulRequests: number;
  clientErrorRequests: number;
  serverErrorRequests: number;
  statusCodes: Record<string, number>;
  averageDurationMs: number;
  p50DurationMs: number;
  p90DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
  latencyHistogram: LatencyHistogram;
  activeTenantCount: number;
  errorCounts: Record<string, number>;
  topRoutes: Array<{ route: string; count: number; avgDurationMs: number }>;
}

@Injectable()
export class MetricsService {
  private totalRequests = 0;
  private successfulRequests = 0;
  private clientErrorRequests = 0;
  private serverErrorRequests = 0;
  private statusCodes = new Map<number, number>();
  private routeStats = new Map<string, { count: number; totalDurationMs: number }>();
  private activeTenants = new Set<string>();
  private tenantRequestCounts = new Map<string, number>();
  private errorCounts = new Map<string, number>();
  private durations: number[] = [];
  private readonly maxStoredDurations = 10000;

  private latencyHistogram: LatencyHistogram = {
    le50ms: 0,
    le100ms: 0,
    le250ms: 0,
    le500ms: 0,
    le1000ms: 0,
    le2500ms: 0,
    gt2500ms: 0
  };

  recordRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    tenantId?: string
  ) {
    this.totalRequests++;

    // Track status codes
    const currentStatusCount = this.statusCodes.get(statusCode) ?? 0;
    this.statusCodes.set(statusCode, currentStatusCount + 1);

    if (statusCode >= 200 && statusCode < 400) {
      this.successfulRequests++;
    } else if (statusCode >= 400 && statusCode < 500) {
      this.clientErrorRequests++;
    } else if (statusCode >= 500) {
      this.serverErrorRequests++;
    }

    // Track route
    const routeKey = `${method} ${this.normalizePath(path)}`;
    const routeStat = this.routeStats.get(routeKey) ?? { count: 0, totalDurationMs: 0 };
    routeStat.count++;
    routeStat.totalDurationMs += durationMs;
    this.routeStats.set(routeKey, routeStat);

    // Track tenant
    if (tenantId) {
      this.recordActiveTenant(tenantId);
      const tenantCount = this.tenantRequestCounts.get(tenantId) ?? 0;
      this.tenantRequestCounts.set(tenantId, tenantCount + 1);
    }

    // Track duration histogram
    if (durationMs <= 50) this.latencyHistogram.le50ms++;
    else if (durationMs <= 100) this.latencyHistogram.le100ms++;
    else if (durationMs <= 250) this.latencyHistogram.le250ms++;
    else if (durationMs <= 500) this.latencyHistogram.le500ms++;
    else if (durationMs <= 1000) this.latencyHistogram.le1000ms++;
    else if (durationMs <= 2500) this.latencyHistogram.le2500ms++;
    else this.latencyHistogram.gt2500ms++;

    // Store for percentile calculations
    if (this.durations.length < this.maxStoredDurations) {
      this.durations.push(durationMs);
    } else {
      // Reservoir sampling replacement to maintain representative sample
      const replaceIdx = Math.floor(Math.random() * this.totalRequests);
      if (replaceIdx < this.maxStoredDurations) {
        this.durations[replaceIdx] = durationMs;
      }
    }
  }

  recordActiveTenant(tenantId: string) {
    this.activeTenants.add(tenantId);
  }

  incrementErrorRate(errorType: string, tenantId?: string) {
    const current = this.errorCounts.get(errorType) ?? 0;
    this.errorCounts.set(errorType, current + 1);

    if (tenantId) {
      const tenantErrorKey = `tenant_${tenantId}_${errorType}`;
      const tenantCurrent = this.errorCounts.get(tenantErrorKey) ?? 0;
      this.errorCounts.set(tenantErrorKey, tenantCurrent + 1);
    }
  }

  private normalizePath(path: string): string {
    // Strip UUIDs and IDs to prevent high cardinality
    return path
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
      .replace(/\/\d+/g, "/:id");
  }

  private calculatePercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
  }

  getMetricsSummary(): MetricsSummary {
    const sorted = [...this.durations].sort((a, b) => a - b);
    const totalDuration = this.durations.reduce((acc, v) => acc + v, 0);
    const averageDurationMs = this.durations.length > 0 ? totalDuration / this.durations.length : 0;

    const statusCodesObj: Record<string, number> = {};
    for (const [code, count] of this.statusCodes.entries()) {
      statusCodesObj[String(code)] = count;
    }

    const errorsObj: Record<string, number> = {};
    for (const [err, count] of this.errorCounts.entries()) {
      errorsObj[err] = count;
    }

    const topRoutes = Array.from(this.routeStats.entries())
      .map(([route, stat]) => ({
        route,
        count: stat.count,
        avgDurationMs: stat.count > 0 ? Math.round(stat.totalDurationMs / stat.count) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      clientErrorRequests: this.clientErrorRequests,
      serverErrorRequests: this.serverErrorRequests,
      statusCodes: statusCodesObj,
      averageDurationMs: Math.round(averageDurationMs * 100) / 100,
      p50DurationMs: this.calculatePercentile(sorted, 50),
      p90DurationMs: this.calculatePercentile(sorted, 90),
      p95DurationMs: this.calculatePercentile(sorted, 95),
      p99DurationMs: this.calculatePercentile(sorted, 99),
      latencyHistogram: { ...this.latencyHistogram },
      activeTenantCount: this.activeTenants.size,
      errorCounts: errorsObj,
      topRoutes
    };
  }

  getTenantMetrics(tenantId: string) {
    return {
      tenantId,
      requestCount: this.tenantRequestCounts.get(tenantId) ?? 0
    };
  }

  reset() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.clientErrorRequests = 0;
    this.serverErrorRequests = 0;
    this.statusCodes.clear();
    this.routeStats.clear();
    this.activeTenants.clear();
    this.tenantRequestCounts.clear();
    this.errorCounts.clear();
    this.durations = [];
    this.latencyHistogram = {
      le50ms: 0,
      le100ms: 0,
      le250ms: 0,
      le500ms: 0,
      le1000ms: 0,
      le2500ms: 0,
      gt2500ms: 0
    };
  }
}
