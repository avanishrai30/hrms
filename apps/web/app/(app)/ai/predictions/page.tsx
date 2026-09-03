"use client";

import { useEffect, useState } from "react";
import { Badge, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AiNavBar } from "../components/ai-nav-bar";

interface HeadcountForecast {
  currentHeadcount: number;
  projectedHeadcount60d: number;
  projectedHeadcount90d: number;
  expectedAttrition60d: number;
  expectedAttrition90d: number;
  confidenceScore: number;
  departmentHotspots: Array<{
    departmentName: string;
    riskScore: number;
    riskLevel: "HIGH" | "MEDIUM" | "LOW";
    keyDrivers: string[];
  }>;
}

export default function AiPredictionsPage() {
  const [forecast, setForecast] = useState<HeadcountForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPredictions() {
      try {
        setLoading(true);
        const data = await apiRequest<HeadcountForecast>("/ai/predictions/workforce");
        setForecast(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load workforce predictions");
      } finally {
        setLoading(false);
      }
    }
    void loadPredictions();
  }, []);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <AiNavBar />

      <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
          <span>📈</span>
          <span>Predictive Workforce Intelligence</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Deterministic statistical projections for headcount trends, retention risk factors, and department hotspots.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-500">
          Calculating statistical projections...
        </div>
      ) : !forecast ? (
        <Panel className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No Predictive Telemetry Available
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Ensure sufficient active employees and attendance records are logged to generate forecasts.
          </div>
        </Panel>
      ) : (
        <div className="space-y-4">
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Panel className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-500">Active Headcount</span>
              <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
                {forecast.currentHeadcount}
              </div>
              <span className="text-[10px] text-neutral-400">Baseline Verified</span>
            </Panel>

            <Panel className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-500">60-Day Projection</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {forecast.projectedHeadcount60d}
              </div>
              <span className="text-[10px] text-neutral-400">~{forecast.expectedAttrition60d} departures expected</span>
            </Panel>

            <Panel className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-500">90-Day Projection</span>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {forecast.projectedHeadcount90d}
              </div>
              <span className="text-[10px] text-neutral-400">~{forecast.expectedAttrition90d} departures expected</span>
            </Panel>

            <Panel className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-500">Model Confidence</span>
              <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
                {Math.round(forecast.confidenceScore * 100)}%
              </div>
              <span className="text-[10px] text-neutral-400">Deterministic Heuristic</span>
            </Panel>
          </div>

          {/* Department Hotspots */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
              Department Retention Hotspots
            </h2>

            {forecast.departmentHotspots.length === 0 ? (
              <Panel className="p-6 text-center text-xs text-neutral-500 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                No departmental retention risks detected above standard baseline.
              </Panel>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forecast.departmentHotspots.map((dept, i) => (
                  <Panel
                    key={i}
                    className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {dept.departmentName}
                      </h3>
                      <Badge
                        tone={
                          dept.riskLevel === "HIGH"
                            ? "danger"
                            : dept.riskLevel === "MEDIUM"
                            ? "warning"
                            : "success"
                        }
                      >
                        {dept.riskLevel} RISK ({dept.riskScore}%)
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-neutral-400">Observed Drivers:</span>
                      <ul className="text-xs text-neutral-600 dark:text-neutral-300 list-disc list-inside space-y-0.5">
                        {dept.keyDrivers.map((d, di) => (
                          <li key={di}>{d}</li>
                        ))}
                      </ul>
                    </div>
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
