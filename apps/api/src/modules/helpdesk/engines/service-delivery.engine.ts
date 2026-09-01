/**
 * TASK 32 — HR SHARED SERVICES & SERVICE DELIVERY ANALYTICS ENGINE
 * Measures helpdesk ticket SLA compliance, resolution velocities, first response metrics, and employee CSAT ratings.
 */

export interface TicketMetricInput {
  totalTickets: number;
  resolvedTickets: number;
  slaBreachedCount: number;
  firstResponseWithinSlaCount: number;
  totalResolutionHours: number;
  totalFirstResponseMinutes: number;
  categoryCounts: Record<string, number>;
  csatRatings: number[]; // 1 to 5 scale ratings
}

export interface ServiceDeliveryAnalyticsResult {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  slaCompliancePercent: number; // 0 to 100%
  firstResponseSlaPercent: number; // 0 to 100%
  avgResolutionHours: number;
  avgFirstResponseMinutes: number;
  csatAverage: number; // 1 to 5
  topTicketCategory: string;
  categoryDistribution: Record<string, number>;
  healthStatus: "EXCELLENT" | "GOOD" | "AT_RISK" | "CRITICAL";
}

export class ServiceDeliveryEngine {
  /**
   * Compute comprehensive Service Delivery / Shared Services KPI metrics.
   */
  static computeMetrics(input: TicketMetricInput): ServiceDeliveryAnalyticsResult {
    const total = input.totalTickets;
    const resolved = input.resolvedTickets;
    const open = Math.max(0, total - resolved);

    const slaCompliancePercent =
      total > 0
        ? Math.max(0, Math.round(((total - input.slaBreachedCount) / total) * 1000) / 10)
        : 100;

    const firstResponseSlaPercent =
      total > 0
        ? Math.min(100, Math.round((input.firstResponseWithinSlaCount / total) * 1000) / 10)
        : 100;

    const avgResolutionHours =
      resolved > 0
        ? Math.round((input.totalResolutionHours / resolved) * 10) / 10
        : 0;

    const avgFirstResponseMinutes =
      total > 0
        ? Math.round((input.totalFirstResponseMinutes / total) * 10) / 10
        : 0;

    const csatAverage =
      input.csatRatings.length > 0
        ? Math.round(
            (input.csatRatings.reduce((acc, curr) => acc + curr, 0) / input.csatRatings.length) * 10
          ) / 10
        : 5.0;

    let topCategory = "GENERAL";
    let maxCount = -1;
    for (const [cat, count] of Object.entries(input.categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    }

    let healthStatus: "EXCELLENT" | "GOOD" | "AT_RISK" | "CRITICAL" = "GOOD";
    if (slaCompliancePercent >= 95 && csatAverage >= 4.5) {
      healthStatus = "EXCELLENT";
    } else if (slaCompliancePercent >= 85 && csatAverage >= 4.0) {
      healthStatus = "GOOD";
    } else if (slaCompliancePercent >= 70) {
      healthStatus = "AT_RISK";
    } else {
      healthStatus = "CRITICAL";
    }

    return {
      totalTickets: total,
      resolvedTickets: resolved,
      openTickets: open,
      slaCompliancePercent,
      firstResponseSlaPercent,
      avgResolutionHours,
      avgFirstResponseMinutes,
      csatAverage,
      topTicketCategory: topCategory,
      categoryDistribution: input.categoryCounts,
      healthStatus
    };
  }
}
