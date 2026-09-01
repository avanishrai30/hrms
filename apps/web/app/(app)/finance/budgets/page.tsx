"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";

export default function FinanceBudgetsPage() {
  const { data } = useQuery({ queryKey: ["finance", "dashboard", "monthly"], queryFn: () => financeApi.dashboard("monthly") });
  const budgets = data?.budgetConsumption ?? [];
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Budgets and cost centers</h1><p className="mt-1 text-sm text-zinc-600">Track department budgets, project allocations, warnings, and utilization.</p></div><Button>New budget</Button></header>
      <Panel><div className="grid gap-3">{budgets.map((budget) => <div className="grid gap-3 rounded-control border border-border p-4 md:grid-cols-[1fr_auto_auto]" key={budget.costCenter}><div><p className="font-medium text-zinc-950">{budget.costCenter}</p><p className="text-sm text-zinc-600">Consumed {budget.consumedAmount.toLocaleString("en-IN")}</p></div><span className="text-sm font-medium">INR {budget.totalBudget.toLocaleString("en-IN")}</span><Badge tone={budget.utilizationPct >= 90 ? "danger" : budget.utilizationPct >= 75 ? "warning" : "neutral"}>{budget.utilizationPct}%</Badge></div>)}
      {budgets.length === 0 ? <p className="text-sm text-zinc-500">No budget data yet.</p> : null}</div></Panel>
    </div>
  );
}
