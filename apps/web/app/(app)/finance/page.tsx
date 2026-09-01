"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { Badge, Panel } from "../../../components/ui";
import { financeApi } from "../../../lib/finance-api";

export default function FinancePage() {
  const { data, isLoading } = useQuery({ queryKey: ["finance", "dashboard", "monthly"], queryFn: () => financeApi.dashboard("monthly") });
  const cards = [
    { href: "/finance/expenses", label: "Monthly spend", value: money(data?.monthlySpend ?? 0), tone: "success" as const },
    { href: "/finance/travel", label: "Travel spend", value: money(data?.travelSpend ?? 0), tone: "neutral" as const },
    { href: "/finance/budgets", label: "Budget utilization", value: `${average(data?.budgetConsumption.map((item) => item.utilizationPct) ?? [])}%`, tone: "warning" as const },
    { href: "/finance/reimbursements", label: "Pending reimbursements", value: String(data?.pendingReimbursements ?? 0), tone: "danger" as const }
  ];

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Finance command center</h1><p className="mt-1 text-sm text-zinc-600">Expense, travel, reimbursement, budget, and cost-center operations.</p></header>
      {isLoading ? <Panel><p className="text-sm text-zinc-500">Loading finance dashboard...</p></Panel> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <Link href={card.href as Route} key={card.href}><Panel><div className="flex items-center justify-between gap-3"><p className="text-sm text-zinc-600">{card.label}</p><Badge tone={card.tone}>{card.value}</Badge></div></Panel></Link>)}
      </div>
      <Panel>
        <h2 className="text-base font-semibold text-zinc-950">Executive finance dashboard</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Metric label="Policy violations" value={String(data?.policyViolations ?? 0)} />
          <Metric label="Pending approvals" value={String(data?.pendingApprovals ?? 0)} />
          <Metric label="Forecast burn rate" value={money(data?.forecastBurnRate ?? 0)} />
          <Metric label="Approval turnaround" value={`${data?.averageApprovalTimeHours ?? 0}h`} />
          <Metric label="Settlement time" value={`${data?.averageSettlementTimeHours ?? 0}h`} />
          <Metric label="Reimbursement cycle" value={`${data?.reimbursementCycleHours ?? 0}h`} />
        </div>
      </Panel>
      <Panel>
        <h2 className="text-base font-semibold text-zinc-950">Cost center ranking</h2>
        <div className="mt-4 grid gap-3">
          {(data?.budgetConsumption ?? []).slice(0, 6).map((budget) => <div className="flex items-center justify-between rounded-control border border-border p-3" key={budget.costCenter}><span className="text-sm font-medium text-zinc-900">{budget.costCenter}</span><Badge tone={budget.utilizationPct >= 90 ? "danger" : budget.utilizationPct >= 75 ? "warning" : "neutral"}>{budget.utilizationPct}%</Badge></div>)}
          {!data?.budgetConsumption?.length ? <p className="text-sm text-zinc-500">No budget consumption data yet.</p> : null}
        </div>
      </Panel>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-control border border-border p-4"><p className="text-sm text-zinc-600">{label}</p><p className="mt-2 text-xl font-semibold tabular-nums text-zinc-950">{value}</p></div>;
}

function money(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}
