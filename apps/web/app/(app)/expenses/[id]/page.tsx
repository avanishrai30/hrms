"use client";

import { use } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: claim, isLoading } = useQuery({ queryKey: ["finance", "expenses", id], queryFn: () => financeApi.expense(id) });
  const statusMutation = useMutation({
    mutationFn: (action: string) => financeApi.updateExpenseStatus(id, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finance", "expenses", id] })
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge tone={claim?.status === "PAID" || claim?.status === "APPROVED" ? "success" : "warning"}>{claim?.status?.replaceAll("_", " ") ?? "Loading"}</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{claim?.title ?? id}</h1>
          <p className="mt-1 text-sm text-zinc-600">{claim?.claimNumber ?? "Expense claim detail with policy, receipt, approval, and audit context."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate("MANAGER_APPROVE")}>Manager approve</Button>
          <Button disabled={statusMutation.isPending} onClick={() => statusMutation.mutate("FINANCE_APPROVE")}>Finance approve</Button>
          <Button variant="danger" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate("REJECT")}>Reject</Button>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel>
          <h2 className="text-base font-semibold text-zinc-950">Line items</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {isLoading ? <p className="text-zinc-500">Loading line items...</p> : null}
            {(claim?.items ?? []).map((item) => (
              <div className="rounded-control border border-border p-3" key={item.id}>
                <p className="font-medium text-zinc-950">{item.description ?? item.category}</p>
                <p className="text-zinc-600">{item.category} - {claim?.currency} {item.amount.toLocaleString("en-IN")} - {item.receipts?.length ?? 0} receipt{(item.receipts?.length ?? 0) === 1 ? "" : "s"}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-base font-semibold text-zinc-950">Timeline</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-600">
            {(claim?.approvals ?? []).map((approval) => <p key={`${approval.action}-${approval.actionAt}`}>{approval.action} {approval.remarks ? `- ${approval.remarks}` : ""}</p>)}
            {(claim?.audits ?? []).map((audit) => <p key={`${audit.action}-${audit.createdAt}`}>{audit.action} {audit.newStatus ? `to ${audit.newStatus}` : ""}</p>)}
            {!claim?.approvals?.length && !claim?.audits?.length ? <p>No timeline events yet.</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
