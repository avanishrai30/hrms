"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface PendingApprovalsData {
  requests: Array<{
    id: string;
    requestType: string;
    reason?: string;
    submittedAt: string;
    employee: { id: string; fullName: string; department: { name: string } };
  }>;
  leaves: Array<{
    id: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason?: string;
    employee: { id: string; fullName: string; department: { name: string } };
    leaveType: { name: string };
  }>;
}

export default function MssApprovalsPage() {
  const [data, setData] = useState<PendingApprovalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadApprovals() {
      try {
        setLoading(true);
        const res = await apiRequest<PendingApprovalsData>("/mss/approvals");
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApprovals();
  }, []);

  const handleAction = async (requestId: string, action: "approve" | "reject") => {
    try {
      setProcessingId(requestId);
      await apiRequest(`/requests/${requestId}/${action}`, {
        method: "POST",
        body: JSON.stringify({ comments: `Processed by Manager via MSS` })
      });
      alert(`Request successfully ${action}d!`);
      const res = await apiRequest<PendingApprovalsData>("/mss/approvals");
      setData(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-muted-foreground">Loading pending team approvals...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Approvals Center</h1>
          <p className="text-sm text-muted-foreground">
            Review and resolve pending leave applications, attendance corrections, and team requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/mss" as Route}>
            <Button variant="secondary">Back to MSS</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <Panel className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold">Pending Leave Applications ({data.leaves.length})</h3>
          </div>
          {data.leaves.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No pending leave applications.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.leaves.map((l) => (
                <div key={l.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{l.employee.fullName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {l.leaveType.name} • {l.totalDays} day(s) ({new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()})
                    </p>
                    {l.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{l.reason}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => alert("Approved leave request!")} variant="secondary">
                      Approve
                    </Button>
                    <Button onClick={() => alert("Rejected leave request.")} variant="secondary">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold">General & Attendance Requests ({data.requests.length})</h3>
          </div>
          {data.requests.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No pending employee requests.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.requests.map((r) => (
                <div key={r.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{r.employee.fullName}</h4>
                      <Badge tone="warning">{r.requestType.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{r.reason || "No details provided"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submitted on {new Date(r.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(r.id, "approve")}
                      disabled={processingId === r.id}
                    >
                      {processingId === r.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleAction(r.id, "reject")}
                      disabled={processingId === r.id}
                      variant="secondary"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
