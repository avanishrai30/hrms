"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Panel } from "../../../components/ui";
import { financeApi } from "../../../lib/finance-api";

export default function MyReimbursementsPage() {
  const { data: reimbursements = [], isLoading } = useQuery({ queryKey: ["finance", "reimbursements"], queryFn: financeApi.reimbursements });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      <header><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">My reimbursements</h1><p className="mt-1 text-sm text-zinc-600">Track approved claims, payroll-linked payouts, and direct reimbursement status.</p></header>
      <Panel>
        <div className="grid gap-3">
          {isLoading ? <p className="text-sm text-zinc-500">Loading reimbursements...</p> : null}
          {reimbursements.map((claim) => <div className="flex items-center justify-between rounded-control border border-border p-4" key={claim.id}><div><p className="font-medium text-zinc-950">{claim.claimNumber}</p><p className="text-sm text-zinc-600">{claim.currency} {(claim.approvedAmount ?? claim.totalAmount).toLocaleString("en-IN")} - {claim.employee?.fullName ?? "Employee"}</p></div><Badge tone={claim.status === "PAID" ? "success" : "warning"}>{claim.status === "PAID" ? "Paid" : "Queued"}</Badge></div>)}
          {!isLoading && reimbursements.length === 0 ? <p className="text-sm text-zinc-500">No reimbursements in queue.</p> : null}
        </div>
      </Panel>
    </div>
  );
}
