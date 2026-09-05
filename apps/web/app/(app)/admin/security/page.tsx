"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Field, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { SeverityLevel, SuspiciousActivityType, SuspiciousActivityView } from "@vc-wms/shared-types";

interface SecurityMetrics {
  summary?: {
    totalAlerts: number;
    openAlerts: number;
    resolvedAlerts: number;
    last24hAlerts: number;
  };
  bySeverity?: Record<string, number>;
  byActivityType?: Record<string, number>;
  totalAlerts?: number;
  unresolvedAlerts?: number;
  criticalAlerts?: number;
  highAlerts?: number;
}

export default function SecurityAdminPage() {
  const [alerts, setAlerts] = useState<SuspiciousActivityView[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNRESOLVED" | "RESOLVED">("UNRESOLVED");

  // Resolve Modal
  const [resolvingAlert, setResolvingAlert] = useState<SuspiciousActivityView | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (severityFilter !== "ALL") params.set("severity", severityFilter);
      if (statusFilter === "UNRESOLVED") params.set("unresolvedOnly", "true");

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const [alertsRes, metricsRes] = await Promise.all([
        apiRequest<{ alerts: SuspiciousActivityView[] } | SuspiciousActivityView[]>(`/security/alerts${queryStr}`),
        apiRequest<SecurityMetrics>("/security/metrics").catch(() => null)
      ]);

      const items = Array.isArray(alertsRes)
        ? alertsRes
        : (alertsRes as { items?: SuspiciousActivityView[]; alerts?: SuspiciousActivityView[] }).items ??
          (alertsRes as { items?: SuspiciousActivityView[]; alerts?: SuspiciousActivityView[] }).alerts ??
          [];
      setAlerts(items);
      setMetrics(metricsRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load security alerts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [severityFilter, statusFilter]);

  const handleResolveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAlert) return;
    try {
      setIsResolving(true);
      setError(null);
      await apiRequest(`/security/alerts/${resolvingAlert.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ resolutionNote })
      });

      setSuccessMessage("Security incident marked as resolved.");
      setResolvingAlert(null);
      setResolutionNote("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resolve alert.");
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    if (severity === "CRITICAL" || severity === "HIGH") {
      return <Badge tone="danger">{severity}</Badge>;
    }
    if (severity === "MEDIUM") {
      return <Badge tone="warning">MEDIUM</Badge>;
    }
    return <Badge tone="neutral">LOW</Badge>;
  };

  const formatActivityName = (type: SuspiciousActivityType) => {
    return type.replace(/_/g, " ");
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Security & Threat Hardening</h1>
            {metrics && (metrics.summary?.openAlerts ?? metrics.unresolvedAlerts ?? 0) > 0 && (
              <Badge tone={(metrics.bySeverity?.CRITICAL ?? metrics.criticalAlerts ?? 0) > 0 ? "danger" : "warning"}>
                {metrics.summary?.openAlerts ?? metrics.unresolvedAlerts ?? 0} Active Incidents
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Real-time biometric anomaly detection, rate-limit monitors, rapid travel flags, and session audits.
          </p>
        </div>
        <Button variant="secondary" onClick={loadData} disabled={isLoading}>
          {isLoading ? "Scanning..." : "Scan & Refresh"}
        </Button>
      </header>

      {error && (
        <div className="rounded-control border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {successMessage && (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total Flagged Events</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950">
            {metrics?.summary?.totalAlerts ?? metrics?.totalAlerts ?? alerts.length}
          </p>
          <p className="mt-1 text-xs text-zinc-400">All recorded anomaly logs</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Unresolved Alerts</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {metrics?.summary?.openAlerts ?? metrics?.unresolvedAlerts ?? alerts.filter((a) => !a.isResolved).length}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Pending admin review</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Critical / High Severity</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {(metrics?.bySeverity?.CRITICAL ?? metrics?.criticalAlerts ?? 0) +
              (metrics?.bySeverity?.HIGH ?? metrics?.highAlerts ?? 0)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Immediate action advised</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Rate Limiting Status</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-bold text-emerald-600">Enforced</span>
            <Badge tone="success">Active</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Brute-force protection enabled</p>
        </Panel>
      </div>

      {/* Filter Bar */}
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["UNRESOLVED", "ALL", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as "ALL" | "UNRESOLVED" | "RESOLVED")}
              className={`rounded-control px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === st
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-zinc-600 hover:bg-muted"
              }`}
            >
              {st}
            </button>
          ))}
          <span className="text-zinc-300">|</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-control px-3 py-1.5 text-xs font-medium transition ${
                severityFilter === sev
                  ? "bg-zinc-900 text-white"
                  : "border border-border bg-surface text-zinc-600 hover:bg-muted"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </Panel>

      {/* Alerts List */}
      <Panel>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Scanning security log buffer...</div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-xl text-emerald-600">
              🛡️
            </div>
            <h3 className="text-base font-semibold text-zinc-900">Zero security incidents</h3>
            <p className="mt-1 text-sm text-zinc-500">No suspicious activities match your current filter parameters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col gap-3 py-4 transition md:flex-row md:items-start md:justify-between"
              >
                <div className="grid gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950">
                      {formatActivityName(alert.activityType)}
                    </span>
                    {getSeverityBadge(alert.severity)}
                    <Badge tone={alert.isResolved ? "success" : "warning"}>
                      {alert.isResolved ? "Resolved" : "Active Incident"}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-500">
                    User: <strong className="text-zinc-800">{alert.user?.email ?? alert.userId}</strong> • Detected:{" "}
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>

                  {/* Details JSON / preview */}
                  {alert.details && Object.keys(alert.details).length > 0 && (
                    <pre className="rounded bg-muted/60 p-2 font-mono text-[11px] text-zinc-800 overflow-x-auto max-w-2xl">
                      {JSON.stringify(alert.details, null, 2)}
                    </pre>
                  )}

                  {alert.isResolved && alert.resolvedAt && (
                    <p className="text-xs text-emerald-700">
                      ✓ Resolved at {new Date(alert.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {!alert.isResolved && (
                  <Button
                    variant="primary"
                    className="h-8 text-xs self-start"
                    onClick={() => {
                      setResolvingAlert(alert);
                      setResolutionNote("Reviewed and verified legitimate.");
                    }}
                  >
                    Resolve Incident
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Resolve Incident Dialog */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Resolve Security Incident</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {formatActivityName(resolvingAlert.activityType)} (Severity: {resolvingAlert.severity})
            </p>

            <form onSubmit={handleResolveAlert} className="mt-4 space-y-4">
              <Field label="Resolution Note / Mitigating Action">
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-950 outline-none focus:border-primary"
                  placeholder="Describe why this was marked resolved (e.g. Employee confirmed travel, biometric retake verified)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </Field>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setResolvingAlert(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isResolving || !resolutionNote}>
                  {isResolving ? "Resolving..." : "Confirm Resolution"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
