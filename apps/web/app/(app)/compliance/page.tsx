"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import type { ComplianceSummaryReportView } from "@vc-wms/shared-types";

export default function ComplianceDashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [summary, setSummary] = useState<ComplianceSummaryReportView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sandbox Calculator State
  const [calcBasic, setCalcBasic] = useState<number>(25000);
  const [calcGross, setCalcGross] = useState<number>(50000);
  const [calcState, setCalcState] = useState<string>("MH");
  const [calcRegime, setCalcRegime] = useState<"NEW" | "OLD">("NEW");
  const [calcResult, setCalcResult] = useState<Record<string, unknown> | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<ComplianceSummaryReportView>(
        `/compliance/reports/summary?month=${selectedMonth}&year=${selectedYear}`
      );
      setSummary(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load statutory compliance summary.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPreview = async () => {
    try {
      setIsCalculating(true);
      const res = await apiRequest<Record<string, unknown>>("/compliance/calculate/preview", {
        method: "POST",
        body: JSON.stringify({
          basicWage: calcBasic,
          grossWage: calcGross,
          state: calcState,
          month: selectedMonth,
          year: selectedYear,
          taxRegime: calcRegime
        })
      });
      setCalcResult(res);
    } catch {
      alert("Failed to compute statutory preview.");
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    void handleRunPreview();
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Statutory Compliance Center
          </h1>
          <p className="text-sm text-slate-500">
            Provident Fund (PF), ESIC, State Professional Tax (PT), and TDS withholding foundations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/compliance/rules" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Rules & Slabs
          </Link>
          <Link
            href={"/compliance/snapshots" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Snapshots
          </Link>
          <Link
            href={"/compliance/reports" as Route}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            Statutory Reports &rarr;
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Cycle Selector Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Compliance Period:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
          >
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total Employees Tracked: <span className="font-bold text-slate-900">{summary?.totalEmployees ?? 0}</span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading statutory compliance summary...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total PF Contribution</span>
            <div className="mt-1 text-xl font-bold text-slate-900">
              ₹{(summary?.pf.totalPfContribution ?? 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {summary?.pf.totalEmployeesCovered ?? 0} covered • EPF + EPS + Admin
            </span>
          </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total ESI Contribution</span>
          <div className="mt-1 text-xl font-bold text-slate-900">
            ₹{(summary?.esi.totalEsiContribution ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {summary?.esi.totalEmployeesCovered ?? 0} covered (&le; ₹21k gross)
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Professional Tax (PT)</span>
          <div className="mt-1 text-xl font-bold text-amber-700">
            ₹{(summary?.pt.totalPtDeducted ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {summary?.pt.totalEmployeesCovered ?? 0} employees deducted
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">TDS Withheld</span>
          <div className="mt-1 text-xl font-bold text-amber-700">
            ₹{(summary?.tds.totalTdsDeducted ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {summary?.tds.totalEmployeesCovered ?? 0} tax deductions
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-900 text-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase">Total Liability</span>
          <div className="mt-1 text-xl font-extrabold text-emerald-400">
            ₹{(summary?.totalStatutoryLiability ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-200 mt-1 block">
            Total statutory remittance
          </span>
        </div>
      </div>
      )}

      {/* Interactive Statutory Calculation Sandbox */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Statutory Calculation Sandbox</h2>
            <p className="text-xs text-slate-500">
              Test and verify PF ceiling capping, ESI eligibility threshold, state PT slabs, and TDS regime rates.
            </p>
          </div>
          <button
            onClick={handleRunPreview}
            disabled={isCalculating}
            className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            {isCalculating ? "Calculating..." : "Compute Breakdown"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Basic Monthly Wage (₹)</label>
            <input
              type="number"
              value={calcBasic}
              onChange={(e) => setCalcBasic(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Monthly Wage (₹)</label>
            <input
              type="number"
              value={calcGross}
              onChange={(e) => setCalcGross(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work State (PT)</label>
            <select
              value={calcState}
              onChange={(e) => setCalcState(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="MH">Maharashtra (₹200 / ₹300 Feb)</option>
              <option value="KA">Karnataka (₹200)</option>
              <option value="DL">Delhi (₹0 Exempt)</option>
              <option value="TN">Tamil Nadu</option>
              <option value="TG">Telangana (₹200)</option>
              <option value="WB">West Bengal</option>
              <option value="GJ">Gujarat</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Regime</label>
            <select
              value={calcRegime}
              onChange={(e) => setCalcRegime(e.target.value as "NEW" | "OLD")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="NEW">New Tax Regime (Sec 115BAC Default)</option>
              <option value="OLD">Old Tax Regime (80C / 80D)</option>
            </select>
          </div>
        </div>

        {/* Sandbox Output Cards */}
        {calcResult && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Provident Fund (PF)</span>
              <div className="mt-1 font-semibold text-slate-800">
                Employee (12%): ₹{((calcResult.pf as Record<string, unknown>)?.employeePf as number)?.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                Employer (12%): ₹{((calcResult.pf as Record<string, unknown>)?.totalEmployerPf as number)?.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">ESIC (Medical Insurance)</span>
              <div className="mt-1 font-semibold text-slate-800">
                Employee (0.75%): ₹{((calcResult.esi as Record<string, unknown>)?.employeeEsi as number)?.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                Employer (3.25%): ₹{((calcResult.esi as Record<string, unknown>)?.employerEsi as number)?.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Professional Tax ({calcState})</span>
              <div className="mt-1 font-semibold text-slate-800">
                Monthly Deduction: ₹{((calcResult.pt as Record<string, unknown>)?.monthlyDeduction as number)?.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                State: {((calcResult.pt as Record<string, unknown>)?.state as string)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">TDS Withholding ({calcRegime})</span>
              <div className="mt-1 font-semibold text-slate-800">
                Monthly TDS: ₹{((calcResult.tds as Record<string, unknown>)?.monthlyTds as number)?.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                Annual Tax: ₹{((calcResult.tds as Record<string, unknown>)?.totalAnnualTax as number)?.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
