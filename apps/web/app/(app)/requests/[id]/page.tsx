"use client";

import { use, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { useHasPermission } from "../../../../lib/session-store";
import type { EmployeeRequestView } from "@vc-wms/shared-types";

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const canManageRequests = useHasPermission("requests.manage");
  const [req, setReq] = useState<EmployeeRequestView | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionComments, setActionComments] = useState("");
  const [acting, setActing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchReq() {
      try {
        setLoading(true);
        const res = await apiRequest<EmployeeRequestView>(`/requests/${resolvedParams.id}`);
        setReq(res);
      } catch (err: unknown) {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load request details"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchReq();
  }, [resolvedParams.id]);

  async function handleAction(action: "approve" | "reject" | "cancel") {
    setActing(true);
    setStatusMsg(null);
    try {
      if (action === "cancel") {
        await apiRequest(`/requests/${resolvedParams.id}/cancel`, { method: "POST" });
        setStatusMsg({ type: "success", text: "Request cancelled successfully." });
      } else {
        await apiRequest(`/requests/${resolvedParams.id}/${action}`, {
          method: "POST",
          body: JSON.stringify({ comments: actionComments })
        });
        setStatusMsg({ type: "success", text: `Request ${action}d successfully.` });
      }
      const updated = await apiRequest<EmployeeRequestView>(`/requests/${resolvedParams.id}`);
      setReq(updated);
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : `Failed to ${action} request`
      });
    } finally {
      setActing(false);
    }
  }

  if (loading && !req) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="h-28 bg-muted animate-pulse rounded-panel" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">{req?.requestType.replace(/_/g, " ")}</h1>
          <p className="text-sm text-zinc-500">Request ID: {req?.id}</p>
        </div>
        <Link href={"/requests" as Route}>
          <Button variant="secondary">Back to Requests</Button>
        </Link>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-control text-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-700"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <Panel className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-semibold text-zinc-900 text-lg">Employee: {req?.employeeName}</h3>
            <p className="text-xs text-zinc-500">
              Submitted on {req?.submittedAt ? new Date(req.submittedAt).toLocaleString() : ""}
            </p>
          </div>
          <Badge
            tone={
              req?.status === "APPROVED"
                ? "success"
                : req?.status === "PENDING"
                ? "warning"
                : req?.status === "REJECTED"
                ? "danger"
                : "neutral"
            }
          >
            {req?.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reason for Change</p>
          <p className="text-sm font-medium text-zinc-800 bg-muted/40 p-3 rounded-control border border-border/50">
            {req?.reason}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Submitted Details</p>
          <SafePayloadSummary payload={req?.payload} requestType={req?.requestType} />
        </div>

        {req?.resolvedAt && (
          <div className="p-4 bg-surface border border-border rounded-control space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase">Resolution Audit</p>
            <div className="text-xs text-zinc-700 space-y-1">
              <p>
                <span className="font-semibold">Resolved By:</span> {req.resolvedByName || "System Admin"}
              </p>
              <p>
                <span className="font-semibold">Resolved At:</span> {new Date(req.resolvedAt).toLocaleString()}
              </p>
              {req.comments && (
                <p>
                  <span className="font-semibold">Comments:</span> {req.comments}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Controls for Pending Requests */}
        {req?.status === "PENDING" && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Manager / HR Review Comments</label>
              <Input
                value={actionComments}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionComments(e.target.value)}
                placeholder="Add approval notes or rejection rationale..."
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => handleAction("cancel")} disabled={acting}>
                Cancel My Request
              </Button>
              {canManageRequests && (
                <div className="flex items-center gap-3">
                  <Button variant="danger" onClick={() => handleAction("reject")} disabled={acting}>
                    Reject Request
                  </Button>
                  <Button variant="primary" onClick={() => handleAction("approve")} disabled={acting}>
                    Approve Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

function SafePayloadSummary({
  payload,
  requestType
}: {
  payload?: EmployeeRequestView["payload"] | undefined;
  requestType?: string | undefined;
}) {
  const entries = safePayloadEntries(payload, requestType);
  if (entries.length === 0) {
    return (
      <div className="rounded-control border border-border bg-muted/40 p-3 text-sm text-zinc-500">
        No structured details were submitted with this request.
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map(([label, value]) => (
        <div key={label} className="rounded-control border border-border bg-muted/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-1 break-words text-sm font-medium text-zinc-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

function safePayloadEntries(payload?: EmployeeRequestView["payload"] | undefined, requestType?: string | undefined): Array<[string, string]> {
  const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (requestType === "ADDRESS_CHANGE") {
    const address = (data.currentAddress ?? data.permanentAddress ?? data.address) as Record<string, unknown> | undefined;
    return Object.entries({
      "Address Line": address?.line1,
      City: address?.city,
      State: address?.state,
      "Postal Code": address?.postalCode,
      Country: address?.country
    }).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0);
  }
  if (requestType === "PERSONAL_INFO_CORRECTION") {
    return Object.entries({
      Phone: data.phone,
      "Personal Email": data.personalEmail,
      "Preferred Name": data.preferredName
    }).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0);
  }
  if (requestType === "BANK_CHANGE") {
    return [["Bank Change", "Bank details are handled through the dedicated bank-details workflow and are not displayed here."]];
  }
  const details = typeof data.details === "string" ? data.details : undefined;
  return details ? [["Details", details]] : [];
}
