import { TicketPriority } from "@prisma/client";
import { SLAPerformanceView, TicketPriorityType } from "@vc-wms/shared-types";

export interface SLADefinition {
  responseMinutes: number;
  resolutionMinutes: number;
}

export const DEFAULT_SLA_TARGETS: Record<TicketPriority, SLADefinition> = {
  CRITICAL: { responseMinutes: 15, resolutionMinutes: 120 }, // 15m / 2h
  HIGH: { responseMinutes: 120, resolutionMinutes: 480 },     // 2h / 8h
  MEDIUM: { responseMinutes: 480, resolutionMinutes: 1440 },  // 8h / 24h
  LOW: { responseMinutes: 1440, resolutionMinutes: 4320 }     // 24h / 72h
};

export class SLAEngine {
  /**
   * Computes response and resolution due dates based on ticket priority and creation time.
   */
  public static computeDueDates(priority: TicketPriority, createdAt: Date = new Date()): {
    responseDueAt: Date;
    resolutionDueAt: Date;
  } {
    const target = DEFAULT_SLA_TARGETS[priority] || DEFAULT_SLA_TARGETS.MEDIUM;
    const responseDueAt = new Date(createdAt.getTime() + target.responseMinutes * 60 * 1000);
    const resolutionDueAt = new Date(createdAt.getTime() + target.resolutionMinutes * 60 * 1000);

    return { responseDueAt, resolutionDueAt };
  }

  /**
   * Checks whether a ticket has breached its resolution or response SLA.
   */
  public static isBreached(
    resolutionDueAt: Date | null,
    resolvedAt: Date | null,
    currentTime: Date = new Date()
  ): boolean {
    if (!resolutionDueAt) return false;
    const compareTime = resolvedAt || currentTime;
    return compareTime.getTime() > resolutionDueAt.getTime();
  }

  /**
   * Computes MTTR (Mean Time To Resolution) in hours for a set of resolved tickets.
   */
  public static calculateMTTR(tickets: Array<{ createdAt: Date; resolvedAt: Date | null }>): number {
    const resolved = tickets.filter((t) => t.resolvedAt !== null);
    if (resolved.length === 0) return 0;

    const totalHours = resolved.reduce((acc, t) => {
      const diffMs = t.resolvedAt!.getTime() - t.createdAt.getTime();
      return acc + diffMs / (1000 * 60 * 60);
    }, 0);

    return Math.round((totalHours / resolved.length) * 10) / 10;
  }

  /**
   * Aggregates performance compliance metrics across all priorities.
   */
  public static computeSLAStats(
    tickets: Array<{
      priority: TicketPriority;
      createdAt: Date;
      firstRespondedAt: Date | null;
      resolvedAt: Date | null;
      resolutionDueAt: Date | null;
      isSlaBreached: boolean;
    }>
  ): SLAPerformanceView[] {
    const priorities: TicketPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

    return priorities.map((p) => {
      const pTickets = tickets.filter((t) => t.priority === p);
      const total = pTickets.length;
      const breached = pTickets.filter((t) => {
        return t.isSlaBreached || SLAEngine.isBreached(t.resolutionDueAt, t.resolvedAt);
      }).length;

      const compliance = total > 0 ? Math.round(((total - breached) / total) * 1000) / 10 : 100;
      const target = DEFAULT_SLA_TARGETS[p];

      // Average response time
      const responded = pTickets.filter((t) => t.firstRespondedAt !== null);
      const avgResp =
        responded.length > 0
          ? Math.round(
              responded.reduce(
                (sum, t) => sum + (t.firstRespondedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60),
                0
              ) / responded.length
            )
          : 0;

      // Average resolution time
      const resolved = pTickets.filter((t) => t.resolvedAt !== null);
      const avgRes =
        resolved.length > 0
          ? Math.round(
              resolved.reduce(
                (sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60),
                0
              ) / resolved.length
            )
          : 0;

      return {
        priority: p as TicketPriorityType,
        responseTargetMinutes: target.responseMinutes,
        resolveTargetMinutes: target.resolutionMinutes,
        compliancePercentage: compliance,
        totalTickets: total,
        breachedCount: breached,
        avgResponseMinutes: avgResp,
        avgResolutionMinutes: avgRes
      };
    });
  }
}
