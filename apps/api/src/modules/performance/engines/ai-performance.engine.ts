import { Injectable } from "@nestjs/common";

export interface PerformanceRiskAssessment {
  employeeId: string;
  employeeName: string;
  burnoutRiskScore: number; // 0 - 100
  disengagementRiskScore: number; // 0 - 100
  lowPerformanceRiskScore: number; // 0 - 100
  primaryRiskDrivers: string[];
  recommendedInterventions: string[];
}

export interface SuggestedGoal {
  title: string;
  category: "OKR" | "KRA";
  description: string;
  suggestedKeyResults: Array<{ title: string; metricType: string; targetValue: number }>;
}

@Injectable()
export class AiPerformanceEngine {
  /**
   * Evaluates employee performance and wellbeing risk telemetry
   */
  assessPerformanceRisks(data: {
    employeeId: string;
    employeeName: string;
    avgGoalProgress: number; // 0 - 100
    oneOnOneFrequencyDays: number; // days since last 1:1
    negativeFeedbackCount: number;
    hoursWorkedOvertimeWeekly?: number;
  }): PerformanceRiskAssessment {
    let burnout = 15;
    let disengagement = 10;
    let lowPerf = 10;
    const drivers: string[] = [];
    const interventions: string[] = [];

    if (data.avgGoalProgress < 40) {
      lowPerf += 45;
      disengagement += 30;
      drivers.push(`Stalled Goal Velocity: Goal progress is at ${data.avgGoalProgress}%.`);
      interventions.push("Conduct obstacle-clearing 1:1 to realign milestone targets.");
    }

    if (data.oneOnOneFrequencyDays > 30) {
      disengagement += 35;
      burnout += 15;
      drivers.push(`Manager Isolation: No 1:1 meeting recorded in ${data.oneOnOneFrequencyDays} days.`);
      interventions.push("Schedule immediate bi-weekly 1:1 check-in.");
    }

    if (data.negativeFeedbackCount >= 2) {
      lowPerf += 25;
      disengagement += 20;
      drivers.push(`Performance Friction: Received ${data.negativeFeedbackCount} developmental feedback items.`);
      interventions.push("Provide targeted mentoring on flagged competencies.");
    }

    if ((data.hoursWorkedOvertimeWeekly || 0) > 12) {
      burnout += 45;
      drivers.push(`High Workload: Averaging ${data.hoursWorkedOvertimeWeekly}h weekly overtime.`);
      interventions.push("Rebalance workload distribution to mitigate burnout risk.");
    }

    return {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      burnoutRiskScore: Math.min(95, burnout),
      disengagementRiskScore: Math.min(95, disengagement),
      lowPerformanceRiskScore: Math.min(95, lowPerf),
      primaryRiskDrivers: drivers.length > 0 ? drivers : ["Workforce metrics healthy and balanced."],
      recommendedInterventions: interventions.length > 0 ? interventions : ["Maintain regular cadence."]
    };
  }

  /**
   * Generates role-based recommended OKRs and KRAs
   */
  generateSuggestedGoals(role: string, department: string): SuggestedGoal[] {
    const isTech = /engineer|developer|architect|tech/i.test(role) || /engineering/i.test(department);
    const isSales = /sales|business|revenue/i.test(role) || /sales/i.test(department);

    if (isTech) {
      return [
        {
          title: "Optimize Service Latency & Reliability",
          category: "OKR",
          description: "Improve critical path response times and ensure system uptime SLAs.",
          suggestedKeyResults: [
            { title: "Reduce P99 API response time to under 150ms", metricType: "NUMERIC", targetValue: 150 },
            { title: "Achieve 99.95% production uptime across core services", metricType: "PERCENTAGE", targetValue: 99.95 },
            { title: "Increase automated test coverage to >= 85%", metricType: "PERCENTAGE", targetValue: 85 }
          ]
        },
        {
          title: "Deliver Next-Gen Platform Features on Schedule",
          category: "KRA",
          description: "Ship sprint deliverables with high architectural quality and zero regression bugs.",
          suggestedKeyResults: [
            { title: "Deliver 100% of committed sprint user stories", metricType: "PERCENTAGE", targetValue: 100 },
            { title: "Maintain zero critical bugs in production", metricType: "NUMERIC", targetValue: 0 }
          ]
        }
      ];
    }

    if (isSales) {
      return [
        {
          title: "Accelerate Enterprise Revenue Growth",
          category: "OKR",
          description: "Expand pipeline value and close high-tier enterprise accounts.",
          suggestedKeyResults: [
            { title: "Achieve ₹1.5 Cr in new Annual Recurring Revenue (ARR)", metricType: "CURRENCY", targetValue: 15000000 },
            { title: "Maintain deal win-rate above 35%", metricType: "PERCENTAGE", targetValue: 35 }
          ]
        }
      ];
    }

    // Default Operational / Cross-functional
    return [
      {
        title: "Operational Excellence & Process Automation",
        category: "OKR",
        description: "Streamline cross-functional workflows and eliminate process bottlenecks.",
        suggestedKeyResults: [
          { title: "Automate 80% of repetitive operational tasks", metricType: "PERCENTAGE", targetValue: 80 },
          { title: "Achieve 95% stakeholder satisfaction score", metricType: "PERCENTAGE", targetValue: 95 }
        ]
      }
    ];
  }

  /**
   * Generates actionable coaching tips for managers
   */
  generateManagerCoachingTips(data: {
    employeeName: string;
    ratingLabel: string;
    strengths?: string;
    areasOfGrowth?: string;
  }): string[] {
    const tips: string[] = [];

    if (data.ratingLabel === "OUTSTANDING" || data.ratingLabel === "EXCEEDS_EXPECTATIONS") {
      tips.push(`Discuss long-term career trajectory with ${data.employeeName} to maintain high retention engagement.`);
      tips.push(`Provide opportunities for ${data.employeeName} to mentor high-potential junior colleagues.`);
    } else if (data.ratingLabel === "NEEDS_IMPROVEMENT" || data.ratingLabel === "UNSATISFACTORY") {
      tips.push(`Establish a weekly 30-minute structured coaching session focusing on: ${data.areasOfGrowth || "core execution"}.`);
      tips.push(`Set clear, bite-sized weekly milestones to build confidence and measurable progress.`);
    } else {
      tips.push(`Reinforce observed strengths (${data.strengths || "steady execution"}) and explore stretch goals for the next review cycle.`);
    }

    return tips;
  }
}
