"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge, Button, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";

export default function FinanceExpensesPage() {
  const { data: claims = [] } = useQuery({ queryKey: ["finance", "expenses"], queryFn: financeApi.expenses });
  const exportRegister = useMutation({ mutationFn: financeApi.exportReport });
  const counts = useMemo(() => claims.reduce<Record<string, number>>((acc, claim) => {
    acc[claim.status] = (acc[claim.status] ?? 0) + 1;
    return acc;
  }, {}), [claims]);

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Finance expenses</h1><p className="mt-1 text-sm text-zinc-600">Review claims, policy exceptions, receipts, GST, and payout readiness.</p></div><Button disabled={exportRegister.isPending} onClick={() => exportRegister.mutate({ report: "EXPENSE_REGISTER", format: "EXCEL" })}>Export register</Button></header>
      <Panel><div className="grid gap-3">{["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "PAID"].map((status) => <div className="flex items-center justify-between rounded-control border border-border p-4" key={status}><span className="font-medium text-zinc-950">{status.replaceAll("_", " ")} claims</span><Badge tone={status === "REJECTED" ? "danger" : status === "APPROVED" || status === "PAID" ? "success" : "neutral"}>{counts[status] ?? 0}</Badge></div>)}</div></Panel>
    </div>
  );
}
