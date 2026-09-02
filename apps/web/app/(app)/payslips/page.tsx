"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Download,
  ShieldCheck,
  Inbox,
  AlertCircle
} from "lucide-react";
import { useMyPayslips } from "../../../lib/queries/use-ess-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { downloadAuthenticatedFile } from "../../../lib/api";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EmployeePayslipsPage() {
  const gate = usePermissionGate(["payslip.view", "payroll.view"]);

  const { data: payslips = [], isLoading, isError, refetch } = useMyPayslips(gate.isAuthorized);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="space-y-3">
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
            You do not have permission (`payslip.view`) to access payslip records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Payslips & Compensation</h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Official monthly remuneration statements, tax deductions, and download records.
        </p>
      </div>

      {downloadError && (
        <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* 2. Payslip Cards List */}
      <div className="space-y-4">
        {isError ? (
          <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-danger mx-auto" />
            <p className="text-xs font-semibold text-foreground">Payslips service unavailable</p>
            <p className="text-[11px] text-foreground-muted">Unable to retrieve payroll records.</p>
            <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
              Retry
            </button>
          </div>
        ) : payslips.length > 0 ? (
          <div className="space-y-3">
            {payslips.map((p) => {
              const monthName = MONTH_NAMES[p.month - 1] || `Month ${p.month}`;
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
                        <h3 className="text-sm font-bold text-foreground">
                          {monthName} {p.year}
                        </h3>
                        <span className="px-2 py-0.5 rounded-pill bg-success/20 text-success text-[10px] font-bold">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground-muted font-mono mt-0.5">
                        Generated: {new Date(p.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-foreground-muted uppercase font-bold block">Gross</span>
                      <span className="text-xs font-mono font-semibold text-foreground-secondary tabular-nums">
                        ₹{p.grossSalary.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-foreground-muted uppercase font-bold block">Deductions</span>
                      <span className="text-xs font-mono font-semibold text-danger tabular-nums">
                        -₹{p.deductions.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="text-right pl-4 border-l border-border-subtle">
                      <span className="text-[10px] text-foreground-muted uppercase font-bold block">Net Pay</span>
                      <span className="text-sm font-mono font-bold text-primary tabular-nums">
                        ₹{p.netSalary.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownload(p.id, p.month, p.year)}
                      disabled={downloadingId === p.id}
                      className="p-2.5 rounded-control bg-surface-muted hover:bg-primary hover:text-white text-foreground-secondary transition shadow-sm disabled:opacity-50"
                      title="Download Payslip PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
            <Inbox className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No payslips available</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Payslip statements will appear here once monthly payroll is processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
