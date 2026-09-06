"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Download,
  ShieldCheck,
  Inbox,
  AlertCircle,
  ReceiptText,
  Layers3
} from "lucide-react";
import type {
  EmployeeCompensationView,
  PayrollRunEmployeeView
} from "@vc-wms/shared-types";
import { useMyPayslips, type PayslipItem } from "../../../lib/queries/use-ess-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { apiRequest, downloadAuthenticatedFile } from "../../../lib/api";
import { formatMoney } from "../../../lib/money";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type PayslipTab = "overview" | "structure" | "payslips" | "history";

const tabs: Array<{ id: PayslipTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "structure", label: "Salary Structure" },
  { id: "payslips", label: "Payslips" },
  { id: "history", label: "History" }
];

function formatPeriod(month?: number, year?: number) {
  if (!month || !year) return "-";
  return `${MONTH_NAMES[month - 1] ?? `Month ${month}`} ${year}`;
}

export default function EmployeePayslipsPage() {
  const gate = usePermissionGate(["payslip.view"]);
  const { data: payslips = [], isLoading, isError, refetch } = useMyPayslips(gate.isAuthorized);
  const { data: compensation } = useQuery({
    queryKey: ["ess-compensation", "me"],
    queryFn: () => apiRequest<EmployeeCompensationView | null>("/compensation/me").catch(() => null),
    enabled: gate.isAuthorized,
    staleTime: 120000
  });
  const { data: payrollRows = [] } = useQuery({
    queryKey: ["ess-payroll", "me"],
    queryFn: () => apiRequest<PayrollRunEmployeeView[]>("/payroll/me").catch(() => []),
    enabled: gate.isAuthorized,
    staleTime: 120000
  });

  const [activeTab, setActiveTab] = useState<PayslipTab>("overview");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const latestPayslip = payslips[0];
  const currency = latestPayslip?.payrollRun?.currency ?? compensation?.currency;
  const structureItems = compensation?.items ?? [];
  const latestPayrollRow = payrollRows[0];

  const summaryCards = useMemo(
    () => [
      {
        label: "Current Monthly CTC",
        value: formatMoney(compensation?.monthlyCtc, compensation?.currency),
        detail: compensation?.status ?? "Not assigned"
      },
      {
        label: "Latest Net Pay",
        value: formatMoney(latestPayslip?.netSalary, currency),
        detail: formatPeriod(latestPayslip?.month, latestPayslip?.year)
      },
      {
        label: "Payslip Count",
        value: String(payslips.length),
        detail: "Employee-visible releases"
      },
      {
        label: "Last Payroll State",
        value: latestPayrollRow?.status ?? latestPayslip?.status ?? "-",
        detail: latestPayrollRow ? "Calculated employee row" : "Latest payslip"
      }
    ],
    [compensation, currency, latestPayrollRow, latestPayslip, payslips.length]
  );

  const handleDownload = async (id: string, month: number, year: number) => {
    try {
      setDownloadError(null);
      setDownloadingId(id);
      await downloadAuthenticatedFile(`/payslips/${id}/download`, `payslip_${year}_${month}.pdf`);
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : "Failed to download payslip PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <SkeletonLoader className="h-24 w-full rounded-card" />
          <SkeletonLoader className="h-24 w-full rounded-card" />
          <SkeletonLoader className="h-24 w-full rounded-card" />
          <SkeletonLoader className="h-24 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Compensation Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission to access payslip records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Compensation</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Salary structure, payroll outcomes, and official payslip downloads.
          </p>
        </div>
        <div className="inline-flex rounded-control border border-border-subtle bg-surface-raised p-1 shadow-xs overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-[6px] px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-foreground text-background shadow-xs"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {downloadError && (
        <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {(activeTab === "overview" || activeTab === "structure") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-card bg-surface-raised border border-border-subtle p-4 shadow-card">
              <span className="text-[10px] text-foreground-muted uppercase font-bold tracking-wide">{card.label}</span>
              <div className="mt-1 text-xl font-mono font-bold text-foreground tabular-nums">{card.value}</div>
              <p className="mt-1 text-[11px] text-foreground-muted">{card.detail}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Latest Payslip</h2>
            </div>
            {latestPayslip ? (
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <Value label="Period" value={formatPeriod(latestPayslip.month, latestPayslip.year)} />
                <Value label="Gross" value={formatMoney(latestPayslip.grossSalary, currency)} mono />
                <Value label="Deductions" value={formatMoney(latestPayslip.deductions, currency)} mono tone="danger" />
                <Value label="Net Pay" value={formatMoney(latestPayslip.netSalary, currency)} mono tone="primary" />
              </div>
            ) : (
              <EmptyState title="No released payslip" detail="Your monthly statements will appear after payroll finalization." />
            )}
          </div>

          <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Compensation Snapshot</h2>
            </div>
            {compensation ? (
              <div className="p-5 space-y-3 text-xs">
                <Row label="Annual CTC" value={formatMoney(compensation.annualCtc, compensation.currency)} strong />
                <Row label="Effective From" value={new Date(compensation.effectiveFrom).toLocaleDateString()} />
                <Row label="Structure Items" value={String(structureItems.length)} />
              </div>
            ) : (
              <EmptyState title="No active structure" detail="Your assigned compensation structure is not available yet." />
            )}
          </div>
        </div>
      )}

      {activeTab === "structure" && (
        <Ledger title="Salary Structure">
          {structureItems.length > 0 ? (
            structureItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-xs border-b border-border-subtle last:border-0">
                <div>
                  <div className="font-semibold text-foreground">{item.component?.name ?? item.componentId}</div>
                  <div className="text-[11px] text-foreground-muted">{item.component?.type ?? "Component"}</div>
                </div>
                <div className="font-mono text-foreground-secondary">{formatMoney(item.monthlyAmount, compensation?.currency)}</div>
                <div className="font-mono font-semibold text-foreground">{formatMoney(item.annualAmount, compensation?.currency)}</div>
              </div>
            ))
          ) : (
            <EmptyState title="No salary structure found" detail="Structure details will appear after HR assigns compensation." />
          )}
        </Ledger>
      )}

      {activeTab === "payslips" && (
        <>
          {isError ? (
            <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-danger mx-auto" />
              <p className="text-xs font-semibold text-foreground">Payslips service unavailable</p>
              <p className="text-[11px] text-foreground-muted">Unable to retrieve payroll records.</p>
              <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
                Retry
              </button>
            </div>
          ) : (
            <PayslipLedger payslips={payslips} downloadingId={downloadingId} onDownload={handleDownload} />
          )}
        </>
      )}

      {activeTab === "history" && (
        <Ledger title="Payroll History">
          {payrollRows.length > 0 ? (
            payrollRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-xs border-b border-border-subtle last:border-0">
                <div>
                  <div className="font-semibold text-foreground">{row.employee?.fullName ?? "Payroll row"}</div>
                  <div className="text-[11px] text-foreground-muted">
                    Payable {row.payableDays} / {row.workingDays} days
                  </div>
                </div>
                <div className="font-mono text-foreground-secondary">{formatMoney(row.grossSalary, currency)}</div>
                <div className="font-mono font-bold text-primary">{formatMoney(row.netSalary, currency)}</div>
              </div>
            ))
          ) : (
            <EmptyState title="No payroll history found" detail="Calculated payroll rows will appear after payroll processing." />
          )}
        </Ledger>
      )}
    </div>
  );
}

function Ledger({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PayslipLedger({
  payslips,
  downloadingId,
  onDownload
}: {
  payslips: PayslipItem[];
  downloadingId: string | null;
  onDownload: (id: string, month: number, year: number) => void;
}) {
  if (payslips.length === 0) {
    return <EmptyState title="No payslips available" detail="Payslip statements will appear here once monthly payroll is processed." />;
  }

  return (
    <div className="space-y-3">
      {payslips.map((p) => {
        const currency = p.payrollRun?.currency;
        return (
          <div
            key={p.id}
            className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card hover:border-primary/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-panel bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{formatPeriod(p.month, p.year)}</h3>
                  <span className="px-2 py-0.5 rounded-pill bg-success/20 text-success text-[10px] font-bold">
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted font-mono mt-0.5">
                  Generated {new Date(p.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4 sm:gap-6 self-stretch sm:self-auto">
              <Metric label="Gross" value={formatMoney(p.grossSalary, currency)} />
              <Metric label="Deductions" value={formatMoney(p.deductions, currency)} tone="danger" />
              <div className="flex items-center justify-end gap-3 border-l border-border-subtle pl-4">
                <Metric label="Net Pay" value={formatMoney(p.netSalary, currency)} tone="primary" />
                <button
                  onClick={() => onDownload(p.id, p.month, p.year)}
                  disabled={downloadingId === p.id}
                  className="p-2.5 rounded-control bg-surface-muted hover:bg-primary hover:text-white text-foreground-secondary transition shadow-sm disabled:opacity-50"
                  title="Download Payslip PDF"
                  aria-label={`Download payslip for ${formatPeriod(p.month, p.year)}`}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" | "primary" }) {
  const color = tone === "danger" ? "text-danger" : tone === "primary" ? "text-primary" : "text-foreground-secondary";
  return (
    <div className="text-right">
      <span className="text-[10px] text-foreground-muted uppercase font-bold block">{label}</span>
      <span className={`text-xs font-mono font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

function Value({ label, value, mono = false, tone = "default" }: { label: string; value: string; mono?: boolean; tone?: "default" | "danger" | "primary" }) {
  const color = tone === "danger" ? "text-danger" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div>
      <span className="text-foreground-muted uppercase text-[10px] font-bold">{label}</span>
      <div className={`mt-1 font-semibold ${mono ? "font-mono tabular-nums" : ""} ${color}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-foreground-muted">{label}</span>
      <span className={`${strong ? "font-mono font-bold" : "font-semibold"} text-foreground`}>{value}</span>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="py-14 px-6 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
      <Inbox className="w-8 h-8 mb-2 opacity-50" />
      <p className="text-xs font-bold text-foreground">{title}</p>
      <p className="text-[11px] text-foreground-muted mt-0.5">{detail}</p>
    </div>
  );
}
