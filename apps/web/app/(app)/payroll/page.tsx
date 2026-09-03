"use client";

import React, { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Play,
  History,
  FileCheck,
  ShieldAlert
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import { formatMoney } from "../../../lib/money";
import type { PayrollRunView } from "@vc-wms/shared-types";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function PayrollDashboardPage() {
  const [latestRun, setLatestRun] = useState<PayrollRunView | null>(null);
  const [recentRuns, setRecentRuns] = useState<PayrollRunView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month generation modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [runNotes, setRunNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Dangerous action modal (Lock / Approve)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    runId: string;
    action: "lock" | "approve";
    title: string;
    consequence: string;
  }>({
    isOpen: false,
    runId: "",
    action: "lock",
    title: "",
    consequence: ""
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [latest, list] = await Promise.all([
        apiRequest<PayrollRunView | null>("/payroll/runs/latest").catch(() => null),
        apiRequest<{ runs: PayrollRunView[] }>("/payroll/runs?limit=10").catch(() => ({ runs: [] }))
      ]);
      setLatestRun(latest);
      setRecentRuns(list.runs ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payroll data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      setError(null);
      const newRun = await apiRequest<PayrollRunView>("/payroll/runs", {
        method: "POST",
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          notes: runNotes || undefined
        })
      });

      setShowGenerateModal(false);
      setRunNotes("");
      setLatestRun(newRun);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate payroll run.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!confirmModal.runId) return;
    try {
      setIsProcessingAction(true);
      setError(null);
      await apiRequest(`/payroll/runs/${confirmModal.runId}/${confirmModal.action}`, {
        method: "POST"
      });
      setConfirmModal({ ...confirmModal, isOpen: false });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${confirmModal.action} payroll run.`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const openLockConfirmation = (runId: string) => {
    setConfirmModal({
      isOpen: true,
      runId,
      action: "lock",
      title: "Lock & Finalize Payroll Run",
      consequence:
        "Once locked, all gross salaries, attendance proration, statutory deductions (PF/ESI/TDS), and adjustments become immutable. No further recalculations or edits can be made."
    });
  };

  const openApproveConfirmation = (runId: string) => {
    setConfirmModal({
      isOpen: true,
      runId,
      action: "approve",
      title: "Approve Payroll Run",
      consequence:
        "Approving this payroll run confirms finance authorization for salary disbursement and publishes payslips to employee self-service portals."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LOCKED":
        return <Badge variant="secondary">🔒 Locked</Badge>;
      case "APPROVED":
        return <Badge variant="success">✓ Approved</Badge>;
      case "GENERATED":
        return <Badge variant="outline">Draft (Generated)</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Enterprise Payroll Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Attendance-integrated compensation calculation, statutory tax proration, and immutable disbursement runs.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href={"/payroll/history" as Route}>
              <History className="size-3.5 mr-1.5" />
              <span>History</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={"/payroll/run" as Route}>
              <FileCheck className="size-3.5 mr-1.5" />
              <span>Workbench</span>
            </Link>
          </Button>
          <Button size="sm" onClick={() => setShowGenerateModal(true)}>
            <Play className="size-3.5 mr-1.5" />
            <span>Process New Month</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Runs</span>
            <div className="text-2xl font-extrabold font-mono text-foreground">{recentRuns.length}</div>
            <span className="text-[11px] text-muted-foreground">Recorded payroll cycles</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locked Cycles</span>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              {recentRuns.filter((r) => r.status === "LOCKED").length}
            </div>
            <span className="text-[11px] text-muted-foreground">Immutable finalized runs</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Sign-off</span>
            <div className="text-2xl font-extrabold font-mono text-amber-600">
              {recentRuns.filter((r) => r.status === "GENERATED").length}
            </div>
            <span className="text-[11px] text-muted-foreground">Draft runs awaiting approval</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employer Contributions</span>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              {latestRun?.totalEmployerContributions
                ? formatMoney(latestRun.totalEmployerContributions, latestRun.currency)
                : "—"}
            </div>
            <span className="text-[11px] text-muted-foreground">Latest cycle statutory match</span>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Payroll Runs Table */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Recent Payroll Runs
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified run ledger with dangerous action guards.
            </p>
          </div>
          <Link href={"/payroll/history" as Route} className="text-xs font-semibold text-primary hover:underline">
            View All History &rarr;
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading payroll history…</div>
          ) : recentRuns.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No payroll runs recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground bg-muted/20">
                    <th className="py-2.5 px-4 font-semibold">Period</th>
                    <th className="py-2.5 px-4 font-semibold">Headcount</th>
                    <th className="py-2.5 px-4 font-semibold">Gross Total</th>
                    <th className="py-2.5 px-4 font-semibold">Deductions</th>
                    <th className="py-2.5 px-4 font-semibold">Net Disbursed</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentRuns.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {monthNames[r.month - 1]} {r.year}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">{r.totalEmployees}</td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {formatMoney(r.totalGross, r.currency)}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {formatMoney(r.totalDeductions, r.currency)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        {formatMoney(r.totalNet, r.currency)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
                            <Link href={"/payroll/run" as Route}>Workbench</Link>
                          </Button>
                          {r.status === "GENERATED" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700"
                                onClick={() => openLockConfirmation(r.id)}
                              >
                                <Lock className="size-3 mr-1" />
                                Lock
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                                onClick={() => openApproveConfirmation(r.id)}
                              >
                                <CheckCircle2 className="size-3 mr-1" />
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process New Month Dialog */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Monthly Payroll</DialogTitle>
            <DialogDescription>
              Calculate wages, attendance adjustments, and statutory deductions for the selected cycle.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateSubmit} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="month">Month</Label>
                <select
                  id="month"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthNames.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Cycle Notes</Label>
              <Input
                id="notes"
                placeholder="e.g. Standard monthly disbursement cycle"
                value={runNotes}
                onChange={(e) => setRunNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Calculating…" : "Calculate & Generate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dangerous Action Confirmation Dialog */}
      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(isOpen) => setConfirmModal({ ...confirmModal, isOpen })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5" />
              {confirmModal.title}
            </DialogTitle>
            <DialogDescription>
              Please confirm this financial lifecycle action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                Irreversible Financial Consequence
              </p>
              <p className="text-[11px] leading-relaxed opacity-95">
                {confirmModal.consequence}
              </p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              variant={confirmModal.action === "lock" ? "destructive" : "default"}
              onClick={handleExecuteAction}
              disabled={isProcessingAction}
            >
              {isProcessingAction ? "Executing…" : `Confirm ${confirmModal.action === "lock" ? "Lock" : "Approval"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
