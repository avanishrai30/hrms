"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../../lib/api";
import type { LeaveBalanceView, LeaveTypeView } from "@vc-wms/shared-types";

export default function LeaveRequestPage() {
  const router = useRouter();
  const [types, setTypes] = useState<LeaveTypeView[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceView[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<"FIRST_HALF" | "SECOND_HALF">("FIRST_HALF");
  const [reason, setReason] = useState("");
  const [attachmentKey, setAttachmentKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [typeData, balData] = await Promise.all([
          apiRequest<LeaveTypeView[]>("/leaves/types"),
          apiRequest<LeaveBalanceView[]>("/leaves/balances/me")
        ]);
        setTypes(typeData);
        setBalances(balData);
        if (typeData.length > 0 && typeData[0]) {
          setSelectedTypeId(typeData[0].id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load leave configuration.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  const selectedBalance = balances.find((b) => b.leaveTypeId === selectedTypeId);
  const selectedType = types.find((t) => t.id === selectedTypeId);

  // Compute estimate duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const calendarDays =
    !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start
      ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0;

  const estimatedDays = isHalfDay ? 0.5 : calendarDays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId) {
      setError("Please select a leave type.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }
    if (reason.trim().length < 4) {
      setError("Please provide a reason of at least 4 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await apiRequest("/leaves/requests", {
        method: "POST",
        body: JSON.stringify({
          leaveTypeId: selectedTypeId,
          startDate,
          endDate,
          isHalfDay,
          halfDaySession: isHalfDay ? halfDaySession : undefined,
          reason,
          attachmentObjectKey: attachmentKey || undefined
        })
      });

      router.push("/leave" as Route);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Apply for Leave</h1>
          <p className="text-sm text-slate-500">
            Submit a leave request for manager and HR approval.
          </p>
        </div>
        <Link
          href={"/leave" as Route}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          &larr; Back to Leaves
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
      >
        {/* Leave Type Selector */}
        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700 mb-1">
            Leave Type
          </label>
          {isLoading ? (
            <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
          ) : (
            <select
              id="leaveType"
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code}) {t.isPaid ? "— Paid" : "— Unpaid"}
                </option>
              ))}
            </select>
          )}

          {/* Balance Preview Card */}
          {selectedBalance && (
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 flex items-center justify-between text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">
                  {selectedBalance.availableDays} days
                </span>{" "}
                currently available for {selectedType?.name}
              </div>
              <div className="text-slate-400">
                Used: {selectedBalance.usedDays}d | Pending: {selectedBalance.pendingDays}d
              </div>
            </div>
          )}
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Half Day Option */}
        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>This is a half-day leave</span>
          </label>

          {isHalfDay && (
            <div className="pl-6 flex items-center gap-4 text-sm text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="halfDaySession"
                  value="FIRST_HALF"
                  checked={halfDaySession === "FIRST_HALF"}
                  onChange={() => setHalfDaySession("FIRST_HALF")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>First Half (Morning)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="halfDaySession"
                  value="SECOND_HALF"
                  checked={halfDaySession === "SECOND_HALF"}
                  onChange={() => setHalfDaySession("SECOND_HALF")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Second Half (Afternoon)</span>
              </label>
            </div>
          )}
        </div>

        {/* Duration Summary Badge */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 flex items-center justify-between text-sm">
          <div className="text-slate-700">
            <span className="font-semibold text-slate-900">Total Leave Duration:</span>{" "}
            {estimatedDays} {estimatedDays === 1 ? "day" : "days"}
          </div>
          <span className="text-xs text-emerald-700 font-medium">
            Sandwich policy verified on submit
          </span>
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
            Reason for Leave
          </label>
          <textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please specify why you need time off..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Optional Document Attachment */}
        <div>
          <label htmlFor="attachmentKey" className="block text-sm font-medium text-slate-700 mb-1">
            Supporting Document / Certificate Reference (Optional)
          </label>
          <input
            id="attachmentKey"
            type="text"
            value={attachmentKey}
            onChange={(e) => setAttachmentKey(e.target.value)}
            placeholder="e.g. medical_certificate_2026.pdf"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Medical certificates are required for sick leave extending over 2 consecutive days.
          </p>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href={"/leave" as Route}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Leave Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
