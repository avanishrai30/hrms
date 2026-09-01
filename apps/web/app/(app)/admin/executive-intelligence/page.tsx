"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface ExecutiveRisksResponse {
  ceo: {
    totalEmployees: number;
    revenuePerEmployee: number;
    totalWorkforceCostInr: number;
    hiringVelocityDays: number;
    attritionRiskPercent: number;
    productivityIndex: number;
    growthForecastPercent: number;
  };
  chro: {
    averageEngagementScore: number;
    highPerformersPercent: number;
    learningRoiIndex: number;
    successionReadinessPercent: number;
    benchStrengthScore: number;
    flightRiskCount: number;
  };
  cfo: {
    monthlyPayrollSpendInr: number;
    annualBudgetConsumptionPercent: number;
    pendingReimbursementsInr: number;
    statutoryDuesInr: number;
    projectedAnnualRunRateInr: number;
    costTrend: "INCREASING" | "STABLE" | "OPTIMIZED";
  };
  risks: Array<{
    category: "TALENT" | "COST" | "COMPLIANCE" | "ATTRITION" | "OPERATIONS";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    title: string;
    impact: string;
    recommendedAction: string;
  }>;
}

export default function CeoExecutiveIntelligencePage() {
  const [data, setData] = useState<ExecutiveRisksResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIntelligence() {
      try {
        setLoading(true);
        const res = await apiRequest<ExecutiveRisksResponse>("/ai/executive/risks");
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadIntelligence();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-muted-foreground">Synthesizing Executive AI Intelligence...</div>;
  }

  const getSeverityTone = (s: string): "neutral" | "success" | "warning" | "danger" => {
    switch (s) {
      case "CRITICAL":
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CEO Executive Command & AI Intelligence Center</h1>
          <p className="text-sm text-muted-foreground">
            Multi-stream workforce analytics, enterprise productivity index, revenue per employee, and AI risk interventions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/chro-intelligence" as Route}>
            <Button variant="secondary">CHRO Intelligence</Button>
          </Link>
          <Link href={"/admin/cfo-intelligence" as Route}>
            <Button variant="secondary">CFO Intelligence</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Revenue Per Employee</span>
          <div className="text-3xl font-extrabold text-primary">
            ₹{(data.ceo.revenuePerEmployee / 100000).toFixed(1)}L
          </div>
          <p className="text-xs text-muted-foreground">Total Headcount: {data.ceo.totalEmployees}</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Productivity Index</span>
          <div className="text-3xl font-extrabold text-success">{data.ceo.productivityIndex} / 100</div>
          <p className="text-xs text-muted-foreground">Goal velocity weighted</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Annual Attrition Risk</span>
          <div className="text-3xl font-extrabold text-warning">{data.ceo.attritionRiskPercent}%</div>
          <p className="text-xs text-muted-foreground">Hiring Velocity: {data.ceo.hiringVelocityDays} days</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">12-Month Growth Forecast</span>
          <div className="text-3xl font-extrabold text-foreground">+{data.ceo.growthForecastPercent}%</div>
          <p className="text-xs text-muted-foreground">Workforce ROI positive</p>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold">Autonomous AI Risk Detection & Strategic Actions</h3>
          <span className="text-xs text-muted-foreground">Real-time LLM inference</span>
        </div>

        <div className="divide-y divide-border">
          {data.risks.map((r, idx) => (
            <div key={idx} className="py-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge tone={getSeverityTone(r.severity)}>{r.severity}</Badge>
                <span className="text-xs font-bold text-muted-foreground">{r.category}</span>
                <h4 className="text-sm font-bold text-foreground">{r.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{r.impact}</p>
              <div className="p-3 bg-muted/20 border border-border rounded text-xs text-foreground">
                <strong>Recommended Executive Intervention:</strong> {r.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
