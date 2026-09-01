"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { AiExecutiveSummaryView } from "@vc-wms/shared-types";

interface NlReportResult {
  reportTitle: string;
  query: string;
  generatedAt: string;
  rowCount: number;
  headers: string[];
  rows: Array<Record<string, unknown>>;
  summaryText: string;
}

export default function ExecutiveAiDashboardPage() {
  const [data, setData] = useState<AiExecutiveSummaryView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NL Report Prompt State
  const [nlQuery, setNlQuery] = useState("");
  const [reportResult, setReportResult] = useState<NlReportResult | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const res = await apiRequest<AiExecutiveSummaryView>("/ai/executive/summary");
        setData(res);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load executive AI intelligence");
      } finally {
        setLoading(false);
      }
    }
    void loadSummary();
  }, []);

  async function handleGenerateNlReport(e: React.FormEvent) {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    try {
      setGeneratingReport(true);
      const res = await apiRequest<NlReportResult>("/ai/reports/nl-generate", {
        method: "POST",
        body: JSON.stringify({ query: nlQuery })
      });
      setReportResult(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link href={"/analytics" as Route} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
              ← Analytics Hub
            </Link>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            Executive AI Intelligence & Predictive Workforce
          </h1>
          <p className="text-sm text-neutral-500">
            Autonomous anomaly detection, retention prediction models, and natural language analytics synthesis.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={"/ai" as Route}>
            <Button variant="primary">✨ Launch HR Copilot</Button>
          </Link>
          <Link href={"/admin/ai-settings" as Route}>
            <Button variant="secondary">⚙️ AI Settings</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-neutral-100 dark:bg-neutral-800/40 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 bg-neutral-100 dark:bg-neutral-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : data ? (
        <>
          {/* Executive AI Narrative Banner */}
          <Panel className="p-6 rounded-2xl border border-emerald-300/60 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent relative overflow-hidden shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                ✨
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    Executive AI Synthesis
                  </h3>
                  <Badge tone="success">Live Grounded Narrative</Badge>
                </div>
                <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {data.narrative}
                </p>
                <div className="text-[11px] text-neutral-500 pt-1">
                  Generated {new Date(data.generatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </Panel>

          {/* 4 Core Health Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Panel className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-semibold text-neutral-500">Active Headcount</div>
              <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
                {data.metrics.headcountTrend.current}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                +{data.metrics.headcountTrend.changePercent}% net expansion
              </div>
            </Panel>

            <Panel className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-semibold text-neutral-500">Attrition Risk Index</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {data.metrics.attritionRiskSummary.averageScore} <span className="text-xs text-neutral-400 font-normal">/ 100</span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {data.metrics.attritionRiskSummary.highRiskCount} Elevated in {data.metrics.attritionRiskSummary.topDepartment}
              </div>
            </Panel>

            <Panel className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-semibold text-neutral-500">Burnout Hotspots</div>
              <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
                {data.metrics.burnoutRiskSummary.criticalCount} <span className="text-xs text-neutral-400 font-normal">critical</span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Avg Index: {data.metrics.burnoutRiskSummary.averageScore}/100
              </div>
            </Panel>

            <Panel className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-semibold text-neutral-500">Attendance Health</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.metrics.attendanceHealth.currentRate}%
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {data.metrics.attendanceHealth.trend}
              </div>
            </Panel>
          </div>

          {/* Predictive Risk Tables & Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attrition Risk Radar */}
            <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    Workforce Attrition Risk Monitor
                  </h3>
                  <p className="text-xs text-neutral-500">Employees flagged by absenteeism and compensation stagnation signals.</p>
                </div>
                <Badge tone="warning">Predictive AI</Badge>
              </div>

              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {data.topAttritionRisks.map((risk) => (
                  <div key={risk.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                        {risk.employeeName} <span className="text-neutral-400 text-xs font-normal">({risk.employeeCode})</span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {risk.department} • {risk.designation}
                      </div>
                      {risk.recommendations?.[0] && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                          💡 {risk.recommendations[0]}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                        {risk.riskScore} <span className="text-[10px] text-neutral-400 font-normal">/ 100</span>
                      </div>
                      <Badge tone={risk.riskScore >= 70 ? "danger" : risk.riskScore >= 40 ? "warning" : "success"}>
                        {risk.riskScore >= 70 ? "HIGH RISK" : risk.riskScore >= 40 ? "MODERATE" : "LOW"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Headcount Projections */}
            <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                Headcount Forecast Horizon
              </h3>
              <p className="text-xs text-neutral-500">
                Statistical projection based on 90-day hiring velocity and exit velocity.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 font-semibold">30-Day Projected</div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {data.headcountForecasts.thirtyDays} Members
                    </div>
                  </div>
                  <Badge tone="success">+30 Days</Badge>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 font-semibold">90-Day Projected</div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {data.headcountForecasts.ninetyDays} Members
                    </div>
                  </div>
                  <Badge tone="neutral">+90 Days</Badge>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 font-semibold">180-Day Projected</div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {data.headcountForecasts.oneEightyDays} Members
                    </div>
                  </div>
                  <Badge tone="neutral">+180 Days</Badge>
                </div>
              </div>
            </Panel>
          </div>

          {/* Natural Language Report Generation Section */}
          <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                📊 Natural Language Report Generator
              </h3>
              <p className="text-xs text-neutral-500">
                Ask the analytics engine to generate real-time reports with instant PDF and CSV export options.
              </p>
            </div>

            <form onSubmit={handleGenerateNlReport} className="flex gap-2">
              <Input
                value={nlQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNlQuery(e.target.value)}
                placeholder="e.g. Generate attendance report for August or Show payroll distribution"
                className="flex-1 text-sm"
              />
              <Button type="submit" variant="primary" disabled={generatingReport || !nlQuery.trim()}>
                {generatingReport ? "Compiling..." : "Generate Report 📑"}
              </Button>
            </form>

            {reportResult && (
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {reportResult.reportTitle} ({reportResult.rowCount} rows)
                  </h4>
                  <div className="flex gap-2">
                    <Button variant="secondary">Download CSV</Button>
                    <Button variant="secondary">Download PDF</Button>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {reportResult.summaryText}
                </p>

                {/* Report Table Preview */}
                <div className="overflow-x-auto max-h-60 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 sticky top-0">
                      <tr>
                        {reportResult.headers.map((h: string, i: number) => (
                          <th key={i} className="p-2 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
                      {reportResult.rows.map((row: Record<string, unknown>, i: number) => (
                        <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                          {reportResult.headers.map((h: string, j: number) => (
                            <td key={j} className="p-2 text-neutral-700 dark:text-neutral-300">{String(row[h] ?? "-")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>
        </>
      ) : null}
    </div>
  );
}
