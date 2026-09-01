"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type { ApprovalRequestView } from "@vc-wms/shared-types";

export default function ApprovalsPage() {
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequestView[]>([]);
  const [allRequests, setAllRequests] = useState<ApprovalRequestView[]>([]);
  const [activeTab, setActiveTab] = useState<"MY_PENDING" | "HISTORY">("MY_PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Action Dialogs
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestView | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "DELEGATE" | null>(null);
  const [comment, setComment] = useState("");
  const [delegateToUserId, setDelegateToUserId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [pendingRes, allRes] = await Promise.all([
        apiRequest<ApprovalRequestView[]>("/approvals/me").catch(() => []),
        apiRequest<ApprovalRequestView[]>("/approvals/requests").catch(() => [])
      ]);
      setPendingRequests(pendingRes ?? []);
      setAllRequests(allRes ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load approvals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleExecuteAction = async () => {
    if (!selectedRequest || !actionType) return;
    try {
      setIsProcessing(true);
      setError(null);

      if (actionType === "APPROVE") {
        await apiRequest(`/approvals/requests/${selectedRequest.id}/approve`, {
          method: "POST",
          body: JSON.stringify({ comment: comment || undefined })
        });
        setSuccessMessage("Request successfully approved.");
      } else if (actionType === "REJECT") {
        await apiRequest(`/approvals/requests/${selectedRequest.id}/reject`, {
          method: "POST",
          body: JSON.stringify({ comment: comment || undefined })
        });
        setSuccessMessage("Request successfully rejected.");
      } else if (actionType === "DELEGATE") {
        await apiRequest(`/approvals/requests/${selectedRequest.id}/delegate`, {
          method: "POST",
          body: JSON.stringify({
            delegateToUserId,
            comment: comment || undefined
          })
        });
        setSuccessMessage("Request delegated successfully.");
      }

      setActionType(null);
      setSelectedRequest(null);
      setComment("");
      setDelegateToUserId("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute approval action.");
    } finally {
      setIsProcessing(false);
    }
  };

  const displayedList = activeTab === "MY_PENDING" ? pendingRequests : allRequests;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Approvals & Delegations</h1>
            {pendingRequests.length > 0 && (
              <Badge tone="warning">{pendingRequests.length} Pending Decision</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Unified multi-level approval inbox for leaves, claims, and compensation revisions.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-control border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {successMessage && (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("MY_PENDING")}
            className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "MY_PENDING"
                ? "bg-primary text-white"
                : "border border-border bg-surface text-zinc-600 hover:bg-muted"
            }`}
          >
            Pending My Review ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "HISTORY"
                ? "bg-primary text-white"
                : "border border-border bg-surface text-zinc-600 hover:bg-muted"
            }`}
          >
            All Requests & History ({allRequests.length})
          </button>
        </div>
      </Panel>

      {/* Approvals Table / Card List */}
      <Panel>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Loading approval requests...</div>
        ) : displayedList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-xl">✓</div>
            <h3 className="text-base font-semibold text-zinc-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-zinc-500">You have zero items pending review at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayedList.map((req) => (
              <div
                key={req.id}
                className="flex flex-col gap-4 py-4 transition md:flex-row md:items-center md:justify-between"
              >
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-950">
                      {req.approvalTemplate?.name ?? req.entityType}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">Entity: {req.entityId.slice(0, 8)}</span>
                    <Badge
                      tone={
                        req.status === "APPROVED"
                          ? "success"
                          : req.status === "REJECTED" || req.status === "CANCELLED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {req.status}
                    </Badge>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-zinc-600 font-medium">
                      Level {req.currentLevel} of {req.totalLevels}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>Requester: <strong className="text-zinc-700">{req.requester?.email ?? req.requesterId}</strong></span>
                    <span>•</span>
                    <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Actions History preview */}
                  {req.actions && req.actions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {req.actions.map((act) => (
                        <p key={act.id} className="text-xs text-zinc-600">
                          ↳ Level {act.level}: <span className="font-semibold">{act.action}</span>
                          {act.comment && <span className="italic"> — &quot;{act.comment}&quot;</span>}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {req.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType("APPROVE");
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType("REJECT");
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType("DELEGATE");
                      }}
                    >
                      Delegate
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Action Dialog */}
      {actionType && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">
              {actionType === "APPROVE"
                ? "Approve Request"
                : actionType === "REJECT"
                ? "Reject Request"
                : "Delegate Request"}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {selectedRequest.approvalTemplate?.name ?? selectedRequest.entityType} (Level {selectedRequest.currentLevel})
            </p>

            <div className="mt-4 space-y-4">
              {actionType === "DELEGATE" && (
                <Field label="Delegate To User ID (UUID)">
                  <Input
                    required
                    placeholder="Enter delegate User UUID..."
                    value={delegateToUserId}
                    onChange={(e) => setDelegateToUserId(e.target.value)}
                  />
                </Field>
              )}

              <Field label="Decision Note / Reason">
                <textarea
                  rows={3}
                  className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-950 outline-none focus:border-primary"
                  placeholder="Optional rationale or instructions..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setActionType(null)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "REJECT" ? "danger" : "primary"}
                onClick={handleExecuteAction}
                disabled={isProcessing || (actionType === "DELEGATE" && !delegateToUserId)}
              >
                {isProcessing
                  ? "Processing..."
                  : actionType === "APPROVE"
                  ? "Confirm Approval"
                  : actionType === "REJECT"
                  ? "Confirm Rejection"
                  : "Confirm Delegation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
