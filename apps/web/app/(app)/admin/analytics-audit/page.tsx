"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
  after?: Record<string, unknown>;
}

export default function AnalyticsAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<AuditLogEntry[]>("/analytics/audit?limit=50");
      setLogs(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analytics audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Analytics & Reports Audit Center
          </h1>
          <p className="text-sm text-slate-500">
            Immutable audit record of report queries, file exports, saved filters, and automated scheduled deliveries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/analytics/reports" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Report Center
          </Link>
          <button
            onClick={() => void loadData()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            Refresh Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Activity Log ({logs.length})</h2>
          <span className="text-xs text-slate-500 font-mono">Recent 50 Events</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No analytics audit events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource Type</th>
                  <th className="px-4 py-3">Resource ID</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          log.action.includes("exported")
                            ? "neutral"
                            : log.action.includes("triggered")
                              ? "warning"
                              : "success"
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{log.resourceType}</td>
                    <td className="px-4 py-3 text-slate-400">{log.resourceId}</td>
                    <td className="px-4 py-3 text-right text-slate-500 max-w-xs truncate">
                      {log.after ? JSON.stringify(log.after) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
