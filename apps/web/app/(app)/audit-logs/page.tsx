"use client";

import { useQuery } from "@tanstack/react-query";
import { Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const logs = useQuery({ queryKey: ["audit-logs"], queryFn: () => apiRequest<AuditLog[]>("/admin/audit-logs") });

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Audit logs</h1>
        <p className="mt-1 text-sm text-zinc-600">Immutable tenant activity for foundation operations.</p>
      </header>
      <Panel>
        {logs.isLoading ? <p className="text-sm text-zinc-600">Loading audit logs...</p> : null}
        {logs.isError ? <p className="text-sm text-danger">Audit logs could not be loaded.</p> : null}
        {logs.data?.length === 0 ? <p className="text-sm text-zinc-600">No audit logs for this tenant yet.</p> : null}
        <div className="divide-y divide-border">
          {logs.data?.map((log) => (
            <div className="grid gap-1 py-3 text-sm md:grid-cols-[220px_1fr_220px] md:items-center" key={log.id}>
              <time className="font-mono text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</time>
              <span className="font-medium text-zinc-950">{log.action}</span>
              <span className="text-zinc-500">{log.resourceType}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

