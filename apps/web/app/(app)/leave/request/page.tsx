"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { useLeaveTypes, useLeaveBalances, useSubmitLeaveRequest } from "../../../../lib/queries/use-ess-queries";

export default function ApplyLeavePage() {
  const router = useRouter();
  const { data: leaveTypes = [], isLoading: loadingTypes } = useLeaveTypes();
  const { data: balances = [] } = useLeaveBalances();
  const submitMutation = useSubmitLeaveRequest();

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId) {
      setFormError("Please select a leave type.");
      return;
    }
    if (!startDate || !endDate) {
      setFormError("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setFormError("Start date cannot be after end date.");
      return;
    }
    if (!reason.trim()) {
      setFormError("Please provide a reason for the leave request.");
      return;
    }

    try {
      setFormError(null);
      await submitMutation.mutateAsync({
        leaveTypeId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason: reason.trim(),
        isHalfDay
      });
      router.push("/leave" as Route);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit leave request.");
    }
  };

  const selectedBalance = balances.find((b) => b.leaveType?.id === leaveTypeId || b.id === leaveTypeId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Link
          href={"/leave" as Route}
          className="w-8 h-8 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Apply for Time Off</h1>
          <p className="text-xs text-foreground-muted">Submit a formal time-off or vacation request</p>
        </div>
      </div>

      <div className="rounded-card bg-surface-raised border border-border-subtle p-6 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Leave Type Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Leave Category</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loadingTypes}
              required
            >
              <option value="">Select a leave type...</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
            {selectedBalance && (
              <p className="text-[11px] text-foreground-muted font-medium">
                Available balance for category: <span className="font-bold text-primary">{selectedBalance.availableDays} days</span>
              </p>
            )}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Half Day Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="halfDayToggle"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
            />
            <label htmlFor="halfDayToggle" className="text-xs font-semibold text-foreground cursor-pointer">
              Apply as half-day leave
            </label>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Reason / Purpose</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for manager approval..."
              className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3">
            <Link
              href={"/leave" as Route}
              className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted text-xs font-semibold text-foreground-secondary transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitMutation.isPending ? "Submitting..." : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
