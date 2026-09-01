"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Panel } from "../../../components/ui";
import { financeApi } from "../../../lib/finance-api";
import { getOfflineQueue } from "../../../lib/offline-storage";

export default function ExpensesPage() {
  const { data: claims = [], isLoading, error } = useQuery({ queryKey: ["finance", "expenses"], queryFn: financeApi.expenses });
  const queued = getOfflineQueue().filter((item) => item.endpoint.startsWith("/finance/expenses"));

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Expenses</h1>
          <p className="mt-1 text-sm text-zinc-600">Create claims, attach receipts, and track reimbursement status.</p>
        </div>
        <Link href={"/expenses/new" as Route}><Button>New claim</Button></Link>
      </header>
      {queued.length ? <Panel className="border-amber-200 bg-amber-50"><p className="text-sm font-medium text-amber-800">{queued.length} offline expense action{queued.length === 1 ? "" : "s"} waiting to sync.</p></Panel> : null}
      <Panel>
        {error ? <p className="mb-4 text-sm text-danger">Unable to load expenses. Offline drafts remain available in this browser.</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr><th className="py-3">Claim</th><th>Employee</th><th>Amount</th><th>Status</th><th>Receipts</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? <tr><td className="py-3 text-zinc-500" colSpan={5}>Loading claims...</td></tr> : null}
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td className="py-3"><Link className="font-medium text-zinc-950 hover:text-primary" href={`/expenses/${claim.id}` as Route}>{claim.title}<span className="block text-xs text-zinc-500">{claim.claimNumber}</span></Link></td>
                  <td>{claim.employee?.fullName ?? "Unassigned"}</td>
                  <td>{claim.currency} {claim.totalAmount.toLocaleString("en-IN")}</td>
                  <td><Badge tone={tone(claim.status)}>{claim.status.replaceAll("_", " ")}</Badge></td>
                  <td>{claim.items?.flatMap((item) => item.receipts ?? []).length ?? 0}</td>
                </tr>
              ))}
              {!isLoading && claims.length === 0 ? <tr><td className="py-3 text-zinc-500" colSpan={5}>No expense claims yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function tone(status: string) {
  if (["APPROVED", "PAID"].includes(status)) return "success" as const;
  if (["REJECTED", "CANCELLED"].includes(status)) return "danger" as const;
  if (["SUBMITTED", "UNDER_REVIEW"].includes(status)) return "warning" as const;
  return "neutral" as const;
}
