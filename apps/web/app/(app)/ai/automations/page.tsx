"use client";

import { useEffect, useState } from "react";
import { Badge, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AiNavBar } from "../components/ai-nav-bar";

interface AutomationRuleView {
  id: string;
  name: string;
  triggerType: string;
  isActive: boolean;
  createdAt: string;
}

interface AutomationRunView {
  id: string;
  ruleName: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  triggerPayload: Record<string, unknown>;
  createdAt: string;
  error?: string | null;
}

export default function AiAutomationsPage() {
  const [rules, setRules] = useState<AutomationRuleView[]>([]);
  const [runs, setRuns] = useState<AutomationRunView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAutomations() {
      try {
        setLoading(true);
        // Automations may have their own endpoint or fallback to empty array
        const [rulesData, runsData] = await Promise.all([
          apiRequest<AutomationRuleView[]>("/automations/rules").catch(() => []),
          apiRequest<AutomationRunView[]>("/automations/runs").catch(() => [])
        ]);
        setRules(rulesData);
        setRuns(runsData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load automations");
      } finally {
        setLoading(false);
      }
    }
    void loadAutomations();
  }, []);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <AiNavBar />

      <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
          <span>⚡</span>
          <span>Event-Driven Automations & AI Workflows</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configured trigger rules, automated escalations, and event dispatch telemetry.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-500">
          Loading automation telemetry...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rules Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
              Active Automation Rules ({rules.length})
            </h2>

            {rules.length === 0 ? (
              <Panel className="p-8 text-center text-xs text-neutral-500 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                No custom automation rules active for this tenant workspace. Default AI event triggers remain active.
              </Panel>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rules.map((r) => (
                  <Panel key={r.id} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{r.name}</h3>
                      <Badge tone={r.isActive ? "success" : "neutral"}>
                        {r.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-500 font-mono">
                      Trigger: {r.triggerType}
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </div>

          {/* Execution History */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
              Recent Execution Logs ({runs.length})
            </h2>

            {runs.length === 0 ? (
              <Panel className="p-8 text-center text-xs text-neutral-500 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                No recent automation runs logged. Automated workflows dispatch on trigger conditions.
              </Panel>
            ) : (
              <div className="space-y-2">
                {runs.map((run) => (
                  <Panel key={run.id} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{run.ruleName}</span>
                      <span className="text-neutral-400 ml-2">{new Date(run.createdAt).toLocaleString()}</span>
                    </div>
                    <Badge tone={run.status === "COMPLETED" ? "success" : run.status === "FAILED" ? "danger" : "warning"}>
                      {run.status}
                    </Badge>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
