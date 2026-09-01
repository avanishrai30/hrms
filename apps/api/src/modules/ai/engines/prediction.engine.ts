import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class PredictionEngine {
  constructor(private readonly prisma: PrismaService) {}

  async calculateEmployeeAttritionRisk(tenantId: string, employeeId: string) {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [employee, attendances, leaves, compensationHistory] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: employeeId, tenantId },
        include: { department: true, designation: true }
      }),
      this.prisma.attendance.findMany({
        where: { tenantId, employeeId, date: { gte: sixtyDaysAgo } }
      }),
      this.prisma.leaveRequest.findMany({
        where: { tenantId, employeeId, startDate: { gte: sixtyDaysAgo } }
      }),
      this.prisma.employeeCompensationHistory.findMany({
        where: { tenantId, employeeId },
        orderBy: { effectiveFrom: "desc" },
        take: 1
      })
    ]);

    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }

    let score = 20; // Baseline low risk
    const factors: Array<{ factor: string; impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; description: string; weight: number }> = [];

    // Factor 1: Absenteeism Rate
    const totalDays = attendances.length || 1;
    const absentDays = attendances.filter((a) => a.status === "ABSENT").length;
    const absenteeismRate = Number(((absentDays / totalDays) * 100).toFixed(1));

    if (absenteeismRate > 15) {
      score += 25;
      factors.push({
        factor: "High Absenteeism",
        impact: "NEGATIVE",
        description: `Unplanned absenteeism rate is ${absenteeismRate}% over the past 60 days.`,
        weight: 25
      });
    } else {
      factors.push({
        factor: "Attendance Consistency",
        impact: "POSITIVE",
        description: `Consistent attendance maintained with ${absenteeismRate}% absence rate.`,
        weight: -5
      });
    }

    // Factor 2: Salary Stagnation
    const lastRevision = compensationHistory[0]?.effectiveFrom || employee.joiningDate;
    const monthsSinceRevision = Math.floor((Date.now() - lastRevision.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (monthsSinceRevision > 18) {
      score += 25;
      factors.push({
        factor: "Compensation Stagnation",
        impact: "NEGATIVE",
        description: `No salary revision in the last ${monthsSinceRevision} months.`,
        weight: 25
      });
    } else if (monthsSinceRevision <= 6) {
      score -= 10;
      factors.push({
        factor: "Recent Compensation Review",
        impact: "POSITIVE",
        description: `Salary reviewed ${monthsSinceRevision} months ago.`,
        weight: -10
      });
    }

    // Factor 3: Leave Pattern Spikes
    const urgentLeaves = leaves.filter((l) => l.status === "APPROVED").length;
    if (urgentLeaves >= 4) {
      score += 15;
      factors.push({
        factor: "Frequent Leave Invocations",
        impact: "NEGATIVE",
        description: `${urgentLeaves} leave requests submitted in the last 60 days.`,
        weight: 15
      });
    }

    const finalScore = Math.min(99, Math.max(5, score));
    const recommendations: string[] = [];

    if (finalScore >= 70) {
      recommendations.push("Schedule an immediate 1-on-1 retention catchup.");
      recommendations.push("Review compensation benchmark against market rate.");
      recommendations.push("Explore internal project rotation or career progression.");
    } else if (finalScore >= 40) {
      recommendations.push("Monitor attendance trend and team workload distribution.");
      recommendations.push("Conduct periodic pulse feedback survey.");
    } else {
      recommendations.push("Employee engagement is healthy. Maintain regular recognition.");
    }

    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      employeeCode: employee.employeeCode,
      department: employee.department.name,
      designation: employee.designation.name,
      predictionType: "ATTRITION_RISK" as const,
      riskScore: finalScore,
      confidence: 0.88,
      signals: {
        factors,
        absenteeismRate,
        salaryStagnationMonths: monthsSinceRevision,
        leaveCount: urgentLeaves
      },
      recommendations
    };
  }

  async calculateEmployeeBurnoutRisk(tenantId: string, employeeId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [employee, attendances] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: employeeId, tenantId },
        include: { department: true, designation: true }
      }),
      this.prisma.attendance.findMany({
        where: { tenantId, employeeId, date: { gte: thirtyDaysAgo } }
      })
    ]);

    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }

    let burnoutScore = 15;
    const factors: Array<{ factor: string; impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; description: string; weight: number }> = [];

    // Calculate total worked minutes & overtime
    let totalWorkedMins = 0;
    let weekendWorkDays = 0;
    for (const att of attendances) {
      totalWorkedMins += att.workedMinutes;
      const dayOfWeek = att.date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendWorkDays++;
      }
    }

    const avgDailyHours = attendances.length > 0 ? totalWorkedMins / attendances.length / 60 : 8;
    const totalOvertimeHours = Math.max(0, Math.round((totalWorkedMins - attendances.length * 8 * 60) / 60));

    if (avgDailyHours > 9.5 || totalOvertimeHours > 30) {
      burnoutScore += 35;
      factors.push({
        factor: "Excessive Working Hours",
        impact: "NEGATIVE",
        description: `Averaging ${avgDailyHours.toFixed(1)} hrs/day with ${totalOvertimeHours} hrs overtime this month.`,
        weight: 35
      });
    }

    if (weekendWorkDays >= 3) {
      burnoutScore += 30;
      factors.push({
        factor: "Frequent Weekend Work",
        impact: "NEGATIVE",
        description: `Active on ${weekendWorkDays} weekend days in the last 30 days.`,
        weight: 30
      });
    }

    const finalBurnout = Math.min(99, Math.max(5, burnoutScore));
    const recommendations: string[] = [];

    if (finalBurnout >= 70) {
      recommendations.push("Enforce mandatory compensatory time-off (Comp-Off).");
      recommendations.push("Rebalance team deliverables and delegate high-priority tasks.");
      recommendations.push("Initiate proactive manager check-in on workload fatigue.");
    } else {
      recommendations.push("Workload distribution is within sustainable healthy thresholds.");
    }

    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      employeeCode: employee.employeeCode,
      department: employee.department.name,
      designation: employee.designation.name,
      predictionType: "BURNOUT_RISK" as const,
      riskScore: finalBurnout,
      confidence: 0.85,
      signals: {
        factors,
        avgDailyHours: Number(avgDailyHours.toFixed(1)),
        overtimeHoursTotal: totalOvertimeHours,
        weekendWorkDays
      },
      recommendations
    };
  }

  async calculateHeadcountForecast(tenantId: string) {
    const currentCount = await this.prisma.employee.count({
      where: { tenantId, status: "ACTIVE" }
    });

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [recentHires, recentExits] = await Promise.all([
      this.prisma.employee.count({
        where: { tenantId, joiningDate: { gte: ninetyDaysAgo } }
      }),
      this.prisma.employee.count({
        where: { tenantId, status: "INACTIVE", updatedAt: { gte: ninetyDaysAgo } }
      })
    ]);

    // Monthly net growth rate
    const monthlyHires = recentHires / 3;
    const monthlyExits = recentExits / 3;
    const monthlyNetGrowth = Math.max(-5, monthlyHires - monthlyExits);

    const forecast30 = Math.round(currentCount + monthlyNetGrowth * 1);
    const forecast90 = Math.round(currentCount + monthlyNetGrowth * 3);
    const forecast180 = Math.round(currentCount + monthlyNetGrowth * 6);

    return {
      predictionType: "HEADCOUNT_FORECAST" as const,
      currentHeadcount: currentCount,
      growthTrendMonthly: Number(monthlyNetGrowth.toFixed(1)),
      forecastHorizon: {
        thirtyDays: forecast30,
        ninetyDays: forecast90,
        oneEightyDays: forecast180
      },
      confidence: 0.82,
      recommendations: [
        "Align campus & lateral hiring pipelines with projected 90-day targets.",
        "Ensure workstation and infrastructure provisioning matches headcount pace."
      ]
    };
  }
}
