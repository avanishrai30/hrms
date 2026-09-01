"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge, Button, Panel } from "./ui";
import { accountingApi } from "../lib/finance-api";

type Dataset = "accounts" | "journals" | "periods" | "banks" | "vendors" | "payables" | "receivables" | "intelligence";

const queryMap: Record<Dataset, () => Promise<unknown>> = {
  accounts: accountingApi.accounts,
  journals: accountingApi.journals,
  periods: accountingApi.periods,
  banks: accountingApi.banks,
  vendors: accountingApi.vendors,
  payables: accountingApi.payables,
  receivables: accountingApi.receivables,
  intelligence: accountingApi.intelligence
};

export function FinanceAccountingPage({
  title,
  description,
  dataset,
  report
}: {
  title: string;
  description: string;
  dataset: Dataset;
  report?: string;
}) {
  const { data, isLoading, error } = useQuery<unknown>({ queryKey: ["finance", "accounting", dataset], queryFn: queryMap[dataset] });
  const exportReport = useMutation({ mutationFn: accountingApi.exportAccountingReport });
  const rows = Array.isArray(data) ? data.filter(isRecord) : data && isRecord(data) ? Object.entries(data).map(([key, value]) => ({ key, value: printable(value) })) : [];

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        </div>
        {report ? <Button variant="secondary" disabled={exportReport.isPending} onClick={() => exportReport.mutate({ report, format: "EXCEL" })}>Export</Button> : null}
      </header>
      <Panel>
        {error ? <p className="text-sm text-danger">Unable to load {title.toLowerCase()}.</p> : null}
        {isLoading ? <p className="text-sm text-zinc-500">Loading...</p> : null}
        <div className="grid gap-3">
          {rows.slice(0, 12).map((row, index) => <AccountingRow row={row} key={rowKey(row, index)} />)}
          {!isLoading && rows.length === 0 ? <p className="text-sm text-zinc-500">No records yet.</p> : null}
        </div>
      </Panel>
    </div>
  );
}

function AccountingRow({ row }: { row: Record<string, unknown> }) {
  const title = String(row.name ?? row.accountName ?? row.invoiceNumber ?? row.entryNumber ?? row.key ?? row.code ?? "Record");
  const status = String(row.status ?? row.type ?? row.currency ?? "Active");
  const amount = row.totalAmount ?? row.currentBalance ?? row.totalDebit ?? row.value;
  return (
    <div className="grid gap-3 rounded-control border border-border p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div>
        <p className="font-medium text-zinc-950">{title}</p>
        <p className="text-sm text-zinc-600">{String(row.code ?? nestedName(row.vendor) ?? nestedName(row.customer) ?? row.narration ?? "")}</p>
      </div>
      <span className="text-sm font-medium text-zinc-800">{printable(amount)}</span>
      <Badge tone={status === "PAID" || status === "POSTED" || status === "OPEN" ? "success" : "neutral"}>{status.replaceAll("_", " ")}</Badge>
    </div>
  );
}

function printable(value: unknown) {
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return String(value.length);
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
}

function rowKey(row: Record<string, unknown>, index: number) {
  return String(row.id ?? row.key ?? index);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function nestedName(value: unknown) {
  return isRecord(value) ? value.name : undefined;
}
