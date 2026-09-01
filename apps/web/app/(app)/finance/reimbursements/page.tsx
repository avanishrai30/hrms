"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";

export default function FinanceReimbursementsPage() {
  const queryClient = useQueryClient();
  const { data: reimbursements = [], isLoading } = useQuery({ queryKey: ["finance", "reimbursements"], queryFn: financeApi.reimbursements });
  const pay = useMutation({
    mutationFn: (claimId: string) => financeApi.updateExpenseStatus(claimId, { action: "PAY" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finance", "reimbursements"] })
  });

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Reimbursements</h1><p className="mt-1 text-sm text-zinc-600">Process approved expenses through payroll-linked or direct payout tracking.</p></header>
      <Panel><div className="grid gap-3">
        {isLoading ? <p className="text-sm text-zinc-500">Loading reimbursement queue...</p> : null}
        {reimbursements.map((claim) => <div className="flex items-center justify-between rounded-control border border-border p-4" key={claim.id}><div><p className="font-medium text-zinc-950">{claim.claimNumber}</p><p className="text-sm text-zinc-600">{claim.currency} {(claim.approvedAmount ?? claim.totalAmount).toLocaleString("en-IN")} - {claim.employee?.fullName ?? "Employee"}</p></div><div className="flex items-center gap-2"><Badge tone={claim.status === "PAID" ? "success" : "warning"}>{claim.status === "PAID" ? "Paid" : "Queued"}</Badge>{claim.status !== "PAID" ? <Button variant="secondary" disabled={pay.isPending} onClick={() => pay.mutate(claim.id)}>Mark paid</Button> : null}</div></div>)}
        {!isLoading && reimbursements.length === 0 ? <p className="text-sm text-zinc-500">No reimbursements pending.</p> : null}
      </div></Panel>
    </div>
  );
}
