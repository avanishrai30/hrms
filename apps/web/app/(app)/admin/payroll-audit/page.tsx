"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface AuditEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  actorUserId: string;
  createdAt: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export default function AdminPayrollAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<AuditEntry[]>("/payroll/audit?limit=100");
      setLogs(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payroll audit trail.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "payroll.generated":
        return <Badge tone="neutral">Run Generated</Badge>;
      case "payroll.recalculated":
        return <Badge tone="warning">Recalculated</Badge>;
      case "payroll.approved":
        return <Badge tone="success">Run Approved</Badge>;
      case "payroll.locked":
        return <Badge tone="neutral">🔒 Run Locked</Badge>;
      case "payroll.adjustment.added":
        return <Badge tone="neutral">Adjustment Added</Badge>;
      case "payroll.adjustment.removed":
        return <Badge tone="danger">Adjustment Removed</Badge>;
      case "payroll.cancelled":
        return <Badge tone="danger">Cancelled</Badge>;
      default:
        return <Badge tone="neutral">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payroll Audit Trail
          </h1>
          <p className="text-sm text-slate-500">
            Immutable audit record of payroll run generations, recalculations, approvals, adjustments, and lock events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/payroll" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Dashboard
          </Link>
          <Link
            href={"/payroll/run" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Run Workbench
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Audit Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Payroll Events</h2>
          <span className="text-xs text-slate-500">{logs.length} logged events</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No payroll audit events logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Event Action</th>
                  <th className="px-6 py-3">Resource</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Change Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-semibold text-slate-800">{log.resourceType}</span>
                      <div className="text-[10px] text-slate-400 font-mono">{log.resourceId}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 font-mono">{log.actorUserId}</td>
                    <td className="px-6 py-4 text-xs max-w-md">
                      {log.after ? (
                        <pre className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono text-slate-800 overflow-x-auto max-h-24">
                          {JSON.stringify(log.after, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
