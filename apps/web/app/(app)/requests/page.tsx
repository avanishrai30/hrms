"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { getOfflineData, saveOfflineData } from "../../../lib/offline-storage";
import type { EmployeeRequestView } from "@vc-wms/shared-types";

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<EmployeeRequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        const res = await apiRequest<EmployeeRequestView[]>("/requests");
        setRequests(res);
        saveOfflineData("requests_list", res);
      } catch (err: unknown) {
        const cached = getOfflineData<EmployeeRequestView[]>("requests_list");
        if (cached) {
          setRequests(cached);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load requests");
        }
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const filtered = requests.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Employee Requests Center</h1>
          <p className="text-sm text-zinc-500">
            Track your profile change requests, bank updates, shift adjustments, and approval workflows
          </p>
        </div>
        <Link href={"/requests/new" as Route}>
          <Button variant="primary">➕ Submit New Request</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === status
                ? "bg-primary text-white"
                : "bg-surface border border-border text-zinc-700 hover:bg-muted"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-24 bg-muted animate-pulse rounded-panel" />
          <div className="h-24 bg-muted animate-pulse rounded-panel" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((req) => (
            <Panel key={req.id} className="p-6 hover:border-primary/40 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-control bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                    📝
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-950 text-base">
                      {req.requestType.replace(/_/g, " ")}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Submitted on {new Date(req.submittedAt).toLocaleDateString()} by {req.employeeName}
                    </p>
                  </div>
                </div>

                <Badge
                  tone={
                    req.status === "APPROVED"
                      ? "success"
                      : req.status === "PENDING"
                      ? "warning"
                      : req.status === "REJECTED"
                      ? "danger"
                      : "neutral"
                  }
                >
                  {req.status}
                </Badge>
              </div>

              <p className="text-sm text-zinc-700 font-medium">{req.reason}</p>

              {req.comments && (
                <div className="p-3 bg-muted/60 rounded-control text-xs text-zinc-600">
                  <span className="font-semibold">Reviewer Notes:</span> {req.comments}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <span className="text-zinc-400">Request Ref: {req.id.slice(0, 8)}</span>
                <Link href={`/requests/${req.id}` as Route} className="font-semibold text-primary hover:underline">
                  View Detail & Timeline →
                </Link>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel className="p-12 text-center space-y-3">
          <span className="text-4xl">📬</span>
          <h3 className="text-base font-semibold text-zinc-900">No Requests Found</h3>
          <p className="text-sm text-zinc-500">You don&apos;t have any requests matching this filter.</p>
          <Link href={"/requests/new" as Route}>
            <Button variant="primary">Submit a Request</Button>
          </Link>
        </Panel>
      )}
    </div>
  );
}
