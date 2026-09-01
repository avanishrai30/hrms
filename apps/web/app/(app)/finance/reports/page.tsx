"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";

const reports = [
  { label: "Expense Register", code: "EXPENSE_REGISTER" },
  { label: "Travel Register", code: "TRAVEL_REGISTER" },
  { label: "Budget Consumption", code: "BUDGET_CONSUMPTION" },
  { label: "Advance Ledger", code: "ADVANCE_LEDGER" },
  { label: "Settlement Ledger", code: "SETTLEMENT_LEDGER" },
  { label: "Reimbursement Register", code: "REIMBURSEMENT_REGISTER" },
  { label: "Policy Violation Report", code: "POLICY_VIOLATION" }
];

export default function FinanceReportsPage() {
  const [lastExport, setLastExport] = useState<string>("");
  const exportReport = useMutation({ mutationFn: financeApi.exportReport, onSuccess: (result) => setLastExport(`${result.format} export generated: ${result.content.slice(0, 120)}`) });
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Finance reports</h1><p className="mt-1 text-sm text-zinc-600">Export CSV, Excel-ready, PDF, and JSON compliance outputs.</p></header>
      <Panel><div className="grid gap-3 md:grid-cols-2">{reports.map((report) => <div className="flex items-center justify-between rounded-control border border-border p-4" key={report.code}><p className="font-medium text-zinc-950">{report.label}</p><Button variant="secondary" disabled={exportReport.isPending} onClick={() => exportReport.mutate({ report: report.code, format: "CSV" })}>Export</Button></div>)}</div></Panel>
      {lastExport ? <Panel><p className="break-all text-sm text-zinc-700">{lastExport}</p></Panel> : null}
    </div>
  );
}
