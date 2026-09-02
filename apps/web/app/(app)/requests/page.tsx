"use client";

import React, { useState } from "react";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  Inbox,
  AlertCircle,
  Send,
  X,
  FolderOpen,
  MapPin,
  CreditCard,
  UserCheck,
  Calendar,
  ShieldCheck
} from "lucide-react";
import {
  useEmployeeRequests,
  useSubmitEmployeeRequest,
  useCancelEmployeeRequest
} from "../../../lib/queries/use-ess-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const REQUEST_TYPES = [
  { value: "ATTENDANCE_CORRECTION", label: "Attendance Correction / Regularization", icon: Calendar },
  { value: "ADDRESS_CHANGE", label: "Address Change Request", icon: MapPin },
  { value: "BANK_CHANGE", label: "Bank Account Details Change", icon: CreditCard },
  { value: "PERSONAL_INFO_CORRECTION", label: "Personal Info Correction", icon: UserCheck },
  { value: "DOCUMENT_UPDATE", label: "Document Update Request", icon: FolderOpen },
  { value: "SHIFT_CHANGE", label: "Shift Schedule Change", icon: Clock },
  { value: "MANAGER_CHANGE", label: "Reporting Manager Change", icon: UserCheck },
  { value: "CUSTOM", label: "Other Workplace Request", icon: FileText }
];

export default function EmployeeRequestsPage() {
  const gate = usePermissionGate(["requests.view", "ess.read"]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState(REQUEST_TYPES[0]!.value);
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: requests = [], isSuccess, isLoading, isError, refetch } = useEmployeeRequests(gate.isAuthorized);
  const submitMutation = useSubmitEmployeeRequest();
  const cancelMutation = useCancelEmployeeRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setFormError("Please provide a reason (at least 3 characters) for your request.");
      return;
    }

    try {
      setFormError(null);
      await submitMutation.mutateAsync({
        requestType,
        reason: reason.trim(),
        comments: comments.trim() || undefined,
        payload: {} // Required by backend schema
      });
      setIsModalOpen(false);
      setReason("");
      setComments("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit request.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this service request?")) return;
    try {
      await cancelMutation.mutateAsync(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel request");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonLoader className="h-20 rounded-card" />
          <SkeletonLoader className="h-20 rounded-card" />
          <SkeletonLoader className="h-20 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Service Desk Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`requests.view`) to access employee service requests.
          </p>
        </div>
      </div>
    );
  }

  const totalCount = isSuccess ? requests.length : null;
  const pendingCount = isSuccess ? requests.filter((r) => r.status.includes("PENDING")).length : null;
  const resolvedCount = isSuccess ? requests.filter((r) => r.status === "APPROVED" || r.status === "RESOLVED").length : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Create Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employee Service Desk</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Submit workplace requests, address changes, attendance regularizations, and track resolutions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* 2. Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums mt-1">
              {typeof totalCount === "number" ? totalCount : "—"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-primary-soft text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-extrabold font-mono text-warning tabular-nums mt-1">
              {typeof pendingCount === "number" ? pendingCount : "—"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-warning/10 text-warning flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Resolved / Approved</p>
            <p className="text-2xl font-extrabold font-mono text-success tabular-nums mt-1">
              {typeof resolvedCount === "number" ? resolvedCount : "—"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-success/10 text-success flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Requests Table / List */}
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-foreground">Service Request History</h3>

        {isError ? (
          <div className="py-8 text-center text-xs text-foreground-muted">
            <p>Unable to load service requests.</p>
            <button onClick={() => refetch()} className="mt-2 text-primary font-bold hover:underline">
              Retry
            </button>
          </div>
        ) : requests.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {requests.map((r) => (
              <div
                key={r.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-muted/30 px-2 rounded-control transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {r.title || r.requestType.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-pill text-[10px] font-bold ${
                        r.status === "APPROVED" || r.status === "RESOLVED"
                          ? "bg-success/20 text-success"
                          : r.status.includes("PENDING")
                          ? "bg-warning/20 text-warning"
                          : "bg-surface-muted text-foreground-muted"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary truncate max-w-xl">{r.reason}</p>
                  <p className="text-[10px] text-foreground-muted font-mono">
                    Submitted: {new Date(r.createdAt).toLocaleDateString()} at{" "}
                    {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {r.status.includes("PENDING") && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    disabled={cancelMutation.isPending}
                    className="px-3 py-1 rounded-control bg-danger/10 hover:bg-danger/20 text-danger text-xs font-semibold transition shrink-0 self-start sm:self-auto"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center justify-center text-foreground-muted">
            <Inbox className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No service requests found</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">Submit a new request to get started.</p>
          </div>
        )}
      </div>

      {/* 4. Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Submit New Service Request</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Request Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {REQUEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Subject / Summary</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Correct punch-in time on Sept 1 or Update permanent address"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Detailed Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Include any specific details or notes for the approver..."
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted text-xs font-semibold text-foreground-secondary transition"
                >
                  Cancel
                </button>
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
      )}
    </div>
  );
}
