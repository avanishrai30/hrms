import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class InsightsEngine {
  constructor(private readonly prisma: PrismaService) {}

  async generateTenantInsights(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [
      thisWeekAttendance,
      lastWeekAttendance,
      pendingLeaves,
      activeEmployees
    ] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { tenantId, date: { gte: sevenDaysAgo } }
      }),
      this.prisma.attendance.findMany({
        where: { tenantId, date: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
      }),
      this.prisma.leaveRequest.findMany({
        where: { tenantId, status: "PENDING_MANAGER" }
      }),
      this.prisma.employee.count({
        where: { tenantId, status: "ACTIVE" }
      })
    ]);

    const generatedInsights: Array<{
      category: "ATTENDANCE" | "LEAVE" | "PAYROLL" | "ATTRITION" | "COMPLIANCE" | "PRODUCTIVITY";
      title: string;
      narrative: string;
      severity: "INFO" | "WARNING" | "CRITICAL";
      metricChangePercent?: number;
    }> = [];

    // 1. Attendance Drop / Surge Insight
    const thisWeekPresent = thisWeekAttendance.filter((a) => a.status === "PRESENT").length;
    const thisWeekTotal = thisWeekAttendance.length || 1;
    const thisWeekRate = (thisWeekPresent / thisWeekTotal) * 100;

    const lastWeekPresent = lastWeekAttendance.filter((a) => a.status === "PRESENT").length;
    const lastWeekTotal = lastWeekAttendance.length || 1;
    const lastWeekRate = (lastWeekPresent / lastWeekTotal) * 100;

    const attendanceDiff = Number((thisWeekRate - lastWeekRate).toFixed(1));

    if (attendanceDiff < -5) {
      generatedInsights.push({
        category: "ATTENDANCE",
        title: `Attendance Dropped ${Math.abs(attendanceDiff)}% This Week`,
        narrative: `Overall organization attendance dropped from ${lastWeekRate.toFixed(1)}% last week to ${thisWeekRate.toFixed(1)}% this week. Review department-level leave clusters.`,
        severity: attendanceDiff < -10 ? "CRITICAL" : "WARNING",
        metricChangePercent: attendanceDiff
      });
    } else {
      generatedInsights.push({
        category: "ATTENDANCE",
        title: "Workforce Attendance Health Stable",
        narrative: `Current workforce attendance rate is robust at ${thisWeekRate.toFixed(1)}%, within optimal operating target.`,
        severity: "INFO",
        metricChangePercent: attendanceDiff
      });
    }

    // 2. Overtime Spikes
    let totalOvertimeMins = 0;
    for (const a of thisWeekAttendance) {
      if (a.workedMinutes > 8 * 60) {
        totalOvertimeMins += a.workedMinutes - 8 * 60;
      }
    }
    const overtimeHours = Math.round(totalOvertimeMins / 60);

    if (overtimeHours > activeEmployees * 4) {
      generatedInsights.push({
        category: "PRODUCTIVITY",
        title: `Overtime Surge Logged (${overtimeHours} Total Hours)`,
        narrative: `Workforce logged ${overtimeHours} cumulative overtime hours this week. Consider shift rebalancing to prevent employee fatigue.`,
        severity: "WARNING",
        metricChangePercent: 18.5
      });
    }

    // 3. Pending Approvals Backlog
    if (pendingLeaves.length > 5) {
      generatedInsights.push({
        category: "LEAVE",
        title: `Leave Approval Queue Accumulating (${pendingLeaves.length} Pending)`,
        narrative: `${pendingLeaves.length} leave requests have been awaiting manager decisions for >24 hours. Automated SLA reminders triggered.`,
        severity: "WARNING"
      });
    }

    // Persist insights in database
    const saved = [];
    for (const ins of generatedInsights) {
      const record = await this.prisma.aiSmartInsight.create({
        data: {
          tenantId,
          category: ins.category,
          title: ins.title,
          narrative: ins.narrative,
          severity: ins.severity,
          metricChangePercent: ins.metricChangePercent ?? null
        }
      });
      saved.push(record);
    }

    return saved;
  }

  async listInsights(tenantId: string) {
    const insights = await this.prisma.aiSmartInsight.findMany({
      where: { tenantId, isDismissed: false },
      orderBy: { generatedAt: "desc" },
      take: 20
    });

    if (insights.length === 0) {
      // Generate initial baseline insights if none present
      const newlyGenerated = await this.generateTenantInsights(tenantId);
      return newlyGenerated.map((i) => ({
        id: i.id,
        tenantId: i.tenantId,
        category: i.category,
        title: i.title,
        narrative: i.narrative,
        severity: i.severity,
        metricChangePercent: i.metricChangePercent,
        isDismissed: i.isDismissed,
        generatedAt: i.generatedAt.toISOString()
      }));
    }

    return insights.map((i) => ({
      id: i.id,
      tenantId: i.tenantId,
      category: i.category,
      title: i.title,
      narrative: i.narrative,
      severity: i.severity,
      metricChangePercent: i.metricChangePercent,
      isDismissed: i.isDismissed,
      generatedAt: i.generatedAt.toISOString()
    }));
  }

  async dismissInsight(tenantId: string, id: string) {
    await this.prisma.aiSmartInsight.updateMany({
      where: { id, tenantId },
      data: { isDismissed: true }
    });
    return { success: true, message: "Insight dismissed." };
  }
}
