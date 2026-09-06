"use client";

import { useEffect, useState, use } from "react";
import type { Route } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { apiRequest, downloadAuthenticatedFile } from "../../../../lib/api";
import { formatMoney } from "../../../../lib/money";
import type { PayslipView } from "@vc-wms/shared-types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatPeriod(month?: number, year?: number) {
  if (!month || !year) return "-";
  return `${MONTH_NAMES[month - 1] ?? `Month ${month}`} ${year}`;
}

function formatDays(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : String(value);
}

export default function PayslipDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [payslip, setPayslip] = useState<PayslipView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiRequest<PayslipView>(`/payslips/${id}`);
        setPayslip(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load payslip details.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloadError(null);
      await downloadAuthenticatedFile(`/payslips/${id}/download`, `payslip_${id}.pdf`);
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : "Failed to download payslip");
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-foreground-muted">Loading payslip...</div>;
  }

  if (error || !payslip) {
    return (
      <div className="space-y-4">
        <div className="rounded-card border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
          {error ?? "Payslip not found."}
        </div>
        <Link
          href={"/payslips" as Route}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to My Payslips
        </Link>
      </div>
    );
  }

  const earnings = payslip.payrollRunEmployee?.breakdowns?.filter((b) => b.type === "EARNING") ?? [];
  const deductions = payslip.payrollRunEmployee?.breakdowns?.filter((b) => b.type === "DEDUCTION") ?? [];
  const employerContribs =
    payslip.payrollRunEmployee?.breakdowns?.filter((b) => b.type === "EMPLOYER_CONTRIBUTION") ?? [];
  const currency = payslip.payrollRun?.currency;
  const signed = payslip.signatureStatus === "SIGNED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={"/payslips" as Route}
            className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground border border-border-subtle bg-surface-raised px-3 py-1.5 rounded-control shadow-xs transition"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Payslip for {formatPeriod(payslip.month, payslip.year)}
            </h1>
            <span className="text-xs text-foreground-muted">Version {payslip.version} | {payslip.status}</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition flex items-center justify-center gap-2"
        >
          <Download className="size-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {downloadError && (
        <div className="rounded-control border border-danger/20 bg-danger/10 p-3 text-xs text-danger flex items-center gap-2">
          <AlertCircle className="size-4" />
          {downloadError}
        </div>
      )}

      <div className="rounded-card border border-border-subtle bg-surface-raised shadow-card overflow-hidden">
        <div className="bg-foreground text-background p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-background/70 tracking-wider">
              Official Payslip
            </span>
            <h2 className="text-2xl font-black mt-1">{formatPeriod(payslip.month, payslip.year)}</h2>
            <p className="text-xs text-background/70 mt-0.5">
              Generated from a locked payroll run
            </p>
          </div>
          <div className="sm:text-right space-y-1">
            <div className="text-xs text-background/70 font-mono">Document Version: v{payslip.version}</div>
            <div className="text-xs text-background/70">
              Released: {new Date(payslip.generatedAt).toLocaleDateString()}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-background/10 border border-background/20 px-2.5 py-1 rounded text-xs font-semibold text-background">
              <ShieldCheck className="size-3.5" />
              {signed ? "Signed" : payslip.signatureStatus}
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-b border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <Value label="Employee Name" value={payslip.employee?.fullName ?? "-"} />
          <Value label="Employee Code" value={payslip.employee?.employeeCode ?? "-"} />
          <Value label="Department" value={payslip.employee?.department?.name ?? "-"} />
          <Value label="Designation" value={payslip.employee?.designation?.name ?? "-"} />
          <Value
            label="Payable / Working Days"
            value={`${formatDays(payslip.payrollRunEmployee?.payableDays)} / ${formatDays(payslip.payrollRunEmployee?.workingDays)} Days`}
          />
          <Value
            label="Present / Paid Leave"
            value={`${formatDays(payslip.payrollRunEmployee?.presentDays)} Present / ${formatDays(payslip.payrollRunEmployee?.paidLeaveDays)} Leave`}
          />
          <Value
            label="Holidays / Half Days"
            value={`${formatDays(payslip.payrollRunEmployee?.holidayDays)} Holidays / ${formatDays(payslip.payrollRunEmployee?.halfDays)} Half`}
          />
          <Value label="Absent Days" value={`${formatDays(payslip.payrollRunEmployee?.absentDays)} Days`} tone="danger" />
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Breakdown
            title="Earnings Breakdown"
            rows={[
              ...earnings.map((e) => ({ id: e.id, label: e.name, value: formatMoney(e.proratedAmount, currency) })),
              ...(payslip.payrollRunEmployee?.adjustments ?? [])
                .filter((a) => a.amount > 0)
                .map((a) => ({ id: a.id, label: `${a.title} (${a.type})`, value: `+${formatMoney(a.amount, currency)}`, tone: "success" as const }))
            ]}
            totalLabel="Total Gross Salary"
            totalValue={formatMoney(payslip.grossSalary, currency)}
          />
          <Breakdown
            title="Statutory & Other Deductions"
            rows={[
              ...deductions.map((d) => ({ id: d.id, label: d.name, value: formatMoney(d.proratedAmount, currency), tone: "warning" as const })),
              ...(payslip.payrollRunEmployee?.adjustments ?? [])
                .filter((a) => a.amount < 0)
                .map((a) => ({ id: a.id, label: `${a.title} (${a.type})`, value: `-${formatMoney(Math.abs(a.amount), currency)}`, tone: "danger" as const }))
            ]}
            totalLabel="Total Deductions"
            totalValue={formatMoney(payslip.deductions, currency)}
            totalTone="warning"
          />
        </div>

        {employerContribs.length > 0 && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border-subtle text-xs">
            <span className="text-[11px] font-bold text-foreground-muted uppercase">
              Employer Contributions
            </span>
            <div className="mt-2 flex flex-wrap gap-6">
              {employerContribs.map((ec) => (
                <div key={ec.id} className="flex gap-2">
                  <span className="text-foreground-muted">{ec.name}:</span>
                  <span className="font-semibold text-foreground">{formatMoney(ec.proratedAmount, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 bg-foreground text-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-background/70 font-semibold">
              Net Take-Home
            </span>
            <div className="text-sm text-background/60">Final amount after deductions and adjustments</div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-background">
            {formatMoney(payslip.netSalary, currency)}
          </div>
        </div>

        <div className="p-4 bg-muted/30 text-center text-[10px] text-foreground-muted border-t border-border-subtle">
          This payslip was generated from a locked payroll run and is confidential to the employee and authorized payroll administrators.
        </div>
      </div>
    </div>
  );
}

function Value({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" }) {
  return (
    <div>
      <span className="text-foreground-muted font-semibold uppercase text-[10px]">{label}</span>
      <div className={`font-bold mt-0.5 ${tone === "danger" ? "text-danger" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  totalLabel,
  totalValue,
  totalTone = "default"
}: {
  title: string;
  rows: Array<{ id: string; label: string; value: string; tone?: "default" | "success" | "warning" | "danger" }>;
  totalLabel: string;
  totalValue: string;
  totalTone?: "default" | "warning";
}) {
  const totalColor = totalTone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase font-bold text-foreground-muted tracking-wider border-b border-border-subtle pb-2">
        {title}
      </h3>
      <div className="divide-y divide-border-subtle text-xs">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={row.id} className="py-2 flex justify-between gap-4">
              <span className="text-foreground-secondary">{row.label}</span>
              <span className={`font-semibold ${row.tone === "success" ? "text-success" : row.tone === "warning" ? "text-warning" : row.tone === "danger" ? "text-danger" : "text-foreground"}`}>
                {row.value}
              </span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-foreground-muted">No line items recorded.</div>
        )}
      </div>
      <div className="border-t-2 border-border-subtle pt-2 flex justify-between text-xs font-bold">
        <span>{totalLabel}</span>
        <span className={totalColor}>{totalValue}</span>
      </div>
    </div>
  );
}
