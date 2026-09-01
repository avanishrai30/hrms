"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface CfoData {
  monthlyPayrollSpendInr: number;
  annualBudgetConsumptionPercent: number;
  pendingReimbursementsInr: number;
  statutoryDuesInr: number;
  projectedAnnualRunRateInr: number;
  costTrend: "INCREASING" | "STABLE" | "OPTIMIZED";
}

export default function CfoIntelligencePage() {
  const [data, setData] = useState<CfoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCfo() {
      try {
        setLoading(true);
        const res = await apiRequest<CfoData>("/ai/executive/cfo-dashboard");
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCfo();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-muted-foreground">Loading CFO Financial Intelligence...</div>;
  }

  const getTrendTone = (t: string): "neutral" | "success" | "warning" | "danger" => {
    switch (t) {
      case "OPTIMIZED":
        return "success";
      case "STABLE":
        return "neutral";
      default:
        return "warning";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CFO Workforce Finance & Budget Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Monthly payroll cash outflow, statutory tax provisions, annual budget consumption, and expense run rate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={getTrendTone(data.costTrend)}>Cost Trend: {data.costTrend}</Badge>
          <Link href={"/admin/executive-intelligence" as Route}>
            <Button variant="secondary">CEO Cockpit</Button>
          </Link>
          <Link href={"/finance/payroll-analytics" as Route}>
            <Button variant="secondary">Payroll Analytics</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Payroll Outflow</span>
          <div className="text-3xl font-extrabold text-primary">
            ₹{(data.monthlyPayrollSpendInr / 100000).toFixed(2)} Lakhs
          </div>
          <p className="text-xs text-muted-foreground">Direct net payouts</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Budget Consumption</span>
          <div className="text-3xl font-extrabold text-foreground">{data.annualBudgetConsumptionPercent}%</div>
          <p className="text-xs text-muted-foreground">Of allocated annual budget</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Statutory Deductions & Dues</span>
          <div className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-200">
            ₹{(data.statutoryDuesInr / 100000).toFixed(2)}L
          </div>
          <p className="text-xs text-muted-foreground">PF, ESI, TDS, PT liabilities</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Projected Annual Run Rate</span>
          <div className="text-3xl font-extrabold text-success">
            ₹{(data.projectedAnnualRunRateInr / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-xs text-muted-foreground">Comprehensive labor cost</p>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Financial Optimization Actions</h3>
        <div className="space-y-3">
          <div className="p-3 bg-muted/20 border border-border rounded text-xs text-foreground flex items-center justify-between">
            <span>📊 <strong>Statutory Deposit Reminder:</strong> EPF & ESIC monthly challan generation due in 4 days.</span>
            <Button variant="secondary" onClick={() => alert("Redirecting to statutory filings.")}>File Challans</Button>
          </div>
          <div className="p-3 bg-muted/20 border border-border rounded text-xs text-foreground flex items-center justify-between">
            <span>💳 <strong>Pending Reimbursements:</strong> ₹{data.pendingReimbursementsInr.toLocaleString("en-IN")} pending finance team clearance.</span>
            <Button variant="secondary" onClick={() => alert("Batch payout initiated.")}>Batch Disburse</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
