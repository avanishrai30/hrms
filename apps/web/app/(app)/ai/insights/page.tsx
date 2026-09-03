"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AiNavBar } from "../components/ai-nav-bar";

interface SmartInsight {
  id: string;
  category: "ATTENDANCE" | "LEAVE" | "PAYROLL" | "ATTRITION" | "COMPLIANCE" | "PRODUCTIVITY";
  title: string;
  narrative: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  metricChangePercent?: number | null;
  isDismissed: boolean;
  generatedAt: string;
}

export default function AiInsightsPage() {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        const data = await apiRequest<SmartInsight[]>("/ai/insights");
        setInsights(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load smart insights");
      } finally {
        setLoading(false);
      }
    }
    void loadInsights();
  }, []);

  async function handleDismiss(id: string) {
    try {
      await apiRequest(`/ai/insights/${id}/dismiss`, { method: "POST" });
      setInsights((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to dismiss insight");
    }
  }

  const filteredInsights = insights.filter((item) => {
    if (item.isDismissed) return false;
    if (severityFilter !== "ALL" && item.severity !== severityFilter) return false;
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <AiNavBar />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
            <span>💡</span>
            <span>AI Smart Insights & Telemetry Alerts</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Automated workforce anomalies, leave spikes, and operational trends computed from tenant data.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="INFO">Info Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="LEAVE">Leave</option>
            <option value="PAYROLL">Payroll</option>
            <option value="ATTRITION">Attrition</option>
            <option value="COMPLIANCE">Compliance</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-500">
          Scanning tenant workforce telemetry...
        </div>
      ) : filteredInsights.length === 0 ? (
        <Panel className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="text-3xl">✨</div>
          <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
            All Systems Normal
          </div>
          <div className="text-xs text-neutral-500 max-w-md mx-auto">
            No active anomalies, leave spikes, or compliance warnings found for the current period.
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {filteredInsights.map((insight) => (
            <Panel
              key={insight.id}
              className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <Badge
                    tone={
                      insight.severity === "CRITICAL"
                        ? "danger"
                        : insight.severity === "WARNING"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {insight.severity}
                  </Badge>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    {insight.category}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(insight.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {insight.title}
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {insight.narrative}
                </p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {insight.metricChangePercent !== undefined && insight.metricChangePercent !== null && (
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {insight.metricChangePercent > 0 ? `+${insight.metricChangePercent}%` : `${insight.metricChangePercent}%`}
                  </span>
                )}
                <Button
                  variant="ghost"
                  onClick={() => void handleDismiss(insight.id)}
                  className="text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
