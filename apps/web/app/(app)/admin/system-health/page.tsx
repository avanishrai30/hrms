"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface HealthData {
  status: "ok" | "degraded";
  timestamp: string;
  database: {
    status: "connected" | "disconnected";
    latencyMs: number;
  };
  queue: {
    status: string;
    queues?: Record<string, { waiting?: number; active?: number; completed?: number; failed?: number }>;
  };
  memory: {
    rssBytes: number;
    heapTotalBytes: number;
    heapUsedBytes: number;
    externalBytes: number;
  };
  uptimeSeconds: number;
  environment: string;
  version: string;
}

export default function SystemHealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      setError(null);
      const res = await apiRequest<HealthData>("/health/system");
      setHealth(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to retrieve system health probe.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void fetchHealth();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">System Health & Infrastructure</h1>
            {health && (
              <Badge tone={health.status === "ok" ? "success" : "danger"}>
                {health.status === "ok" ? "All Systems Operational" : "Degraded State"}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Real-time telemetry, memory footprint, BullMQ queue health, and database connection monitors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-xs"
          >
            {autoRefresh ? "Auto-Refresh: ON (10s)" : "Auto-Refresh: OFF"}
          </Button>
          <Button variant="primary" onClick={fetchHealth} disabled={isLoading} className="text-xs">
            {isLoading ? "Checking..." : "Refresh Now"}
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-control border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Main Stats Banner */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">PostgreSQL DB</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-bold text-zinc-950">
              {health?.database.status === "connected" ? "Connected" : "Offline"}
            </span>
            <Badge tone={health?.database.status === "connected" ? "success" : "danger"}>
              {health?.database.latencyMs ?? 0}ms
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">Primary relational storage</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Redis & Queues</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-bold text-zinc-950">
              {health?.queue.status === "ok" ? "Active" : "Degraded"}
            </span>
            <Badge tone={health?.queue.status === "ok" ? "success" : "warning"}>
              BullMQ
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">Async job worker pipeline</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Heap Memory</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-bold text-zinc-950">
              {health ? formatBytes(health.memory.heapUsedBytes) : "--"}
            </span>
            <span className="text-xs text-zinc-500">
              of {health ? formatBytes(health.memory.heapTotalBytes) : "--"}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            RSS: {health ? formatBytes(health.memory.rssBytes) : "--"}
          </p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Service Uptime</p>
          <p className="mt-2 text-xl font-bold text-zinc-950">
            {health ? formatUptime(health.uptimeSeconds) : "--"}
          </p>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Env: {health?.environment ?? "production"}
          </p>
        </Panel>
      </div>

      {/* Queue Job Counters & Diagnostics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-950">Asynchronous Job Queues</h2>
          <p className="text-xs text-zinc-600">
            Current status of transactional workers handling emails, background payroll batches, and biometrics.
          </p>

          <div className="divide-y divide-border">
            {health?.queue.queues && Object.keys(health.queue.queues).length > 0 ? (
              Object.entries(health.queue.queues).map(([name, stats]) => (
                <div key={name} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-semibold text-sm text-zinc-900 capitalize">{name} Queue</span>
                    <p className="font-mono text-xs text-zinc-400">Worker channel</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-amber-600 font-medium">Wait: {stats.waiting ?? 0}</span>
                    <span className="text-blue-600 font-medium">Active: {stats.active ?? 0}</span>
                    <span className="text-emerald-600 font-medium">Done: {stats.completed ?? 0}</span>
                    <span className="text-red-600 font-medium">Fail: {stats.failed ?? 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">
                Default in-memory / worker queue ready (0 backlog).
              </div>
            )}
          </div>
        </Panel>

        {/* Memory Footprint Breakdown */}
        <Panel className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-950">Node.js Process Memory Breakdown</h2>
          <p className="text-xs text-zinc-600">
            Memory allocation across V8 heap space, C++ bindings, and resident set size.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded bg-muted/40 p-3">
              <span className="text-zinc-700">Resident Set Size (RSS)</span>
              <span className="font-bold text-zinc-950">{health ? formatBytes(health.memory.rssBytes) : "--"}</span>
            </div>
            <div className="flex items-center justify-between rounded bg-muted/40 p-3">
              <span className="text-zinc-700">V8 Heap Total</span>
              <span className="font-bold text-zinc-950">{health ? formatBytes(health.memory.heapTotalBytes) : "--"}</span>
            </div>
            <div className="flex items-center justify-between rounded bg-muted/40 p-3">
              <span className="text-zinc-700">V8 Heap Used</span>
              <span className="font-bold text-emerald-700">{health ? formatBytes(health.memory.heapUsedBytes) : "--"}</span>
            </div>
            <div className="flex items-center justify-between rounded bg-muted/40 p-3">
              <span className="text-zinc-700">External Buffers</span>
              <span className="font-bold text-zinc-950">{health ? formatBytes(health.memory.externalBytes) : "--"}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
