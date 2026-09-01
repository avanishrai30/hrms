"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../../lib/api";

export default function StatutoryReportsPage() {
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "PF" | "ESI" | "PT" | "TDS">("SUMMARY");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let endpoint = `/compliance/reports/summary?month=${selectedMonth}&year=${selectedYear}`;
      if (activeTab === "PF") endpoint = `/compliance/reports/pf?month=${selectedMonth}&year=${selectedYear}`;
      if (activeTab === "ESI") endpoint = `/compliance/reports/esi?month=${selectedMonth}&year=${selectedYear}`;
      if (activeTab === "PT") endpoint = `/compliance/reports/pt?month=${selectedMonth}&year=${selectedYear}`;
      if (activeTab === "TDS") endpoint = `/compliance/reports/tds?month=${selectedMonth}&year=${selectedYear}`;

      const data = await apiRequest<Record<string, unknown>>(endpoint);
      setReportData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load statutory report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, [activeTab, selectedMonth, selectedYear]);

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
            Statutory Compliance Reports & Statements
          </h1>
          <p className="text-sm text-slate-500">
            Monthly statutory remittance statements for EPF, ESIC, State PT, and TDS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/compliance" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Dashboard
          </Link>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition"
          >
            🖨 Print / Export Statement
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Cycle Selector & Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <label className="text-xs font-semibold text-slate-700">Reporting Period:</label>
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

        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {(["SUMMARY", "PF", "ESI", "PT", "TDS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === tab
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab === "SUMMARY" && "Monthly Executive Summary"}
              {tab === "PF" && "PF Monthly Statement"}
              {tab === "ESI" && "ESIC Contribution Return"}
              {tab === "PT" && "State PT Ledger"}
              {tab === "TDS" && "TDS Deduction Schedule"}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content Panel */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
              Official Statutory Record
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {activeTab === "SUMMARY" && "Monthly Executive Statutory Summary"}
              {activeTab === "PF" && "Provident Fund (EPF/EPS) Monthly Statement"}
              {activeTab === "ESI" && "Employee State Insurance (ESIC) Monthly Statement"}
              {activeTab === "PT" && "Professional Tax State Ledger"}
              {activeTab === "TDS" && "Tax Deducted at Source (TDS) Schedule"}
            </h2>
            <p className="text-xs text-slate-500">
              For Period: {monthNames[selectedMonth - 1]} {selectedYear} • VC Organics Ltd
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading statutory report...</div>
        ) : !reportData ? (
          <div className="p-12 text-center text-sm text-slate-500">No data found for this period.</div>
        ) : (
          <div className="space-y-4">
            {/* PF Tab */}
            {activeTab === "PF" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Total Wage Basis</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      ₹{((reportData.summary as Record<string, unknown>)?.totalPfWageBasis as number)?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Employee Share (12%)</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      ₹{((reportData.summary as Record<string, unknown>)?.totalEmployeePf as number)?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Employer Share (12%)</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      ₹{((reportData.summary as Record<string, unknown>)?.totalEmployerPf as number)?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Total Remittance</span>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">
                      ₹{((reportData.summary as Record<string, unknown>)?.totalPfContribution as number)?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5">Wage Basis</th>
                        <th className="px-4 py-2.5">Employee PF (12%)</th>
                        <th className="px-4 py-2.5">Employer EPF (3.67%)</th>
                        <th className="px-4 py-2.5">Employer EPS (8.33%)</th>
                        <th className="px-4 py-2.5 text-right">Total PF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportData.records as Array<Record<string, unknown>>)?.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-semibold text-slate-900">
                            {r.fullName as string} <span className="text-slate-400 font-normal">({r.employeeCode as string})</span>
                          </td>
                          <td className="px-4 py-2.5">₹{(r.wageBasis as number)?.toLocaleString()}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-900">₹{(r.employeePf as number)?.toLocaleString()}</td>
                          <td className="px-4 py-2.5">₹{(r.employerEpf as number)?.toLocaleString()}</td>
                          <td className="px-4 py-2.5">₹{(r.employerEps as number)?.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-700">₹{(r.totalPf as number)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ESI Tab */}
            {activeTab === "ESI" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Covered Employees</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {((reportData.summary as Record<string, unknown>)?.totalEmployeesCovered as number)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Employee ESI (0.75%)</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      ₹{((reportData.summary as Record<string, unknown>)?.totalEmployeeEsi as number)?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Employer ESI (3.25%)</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      ₹{((reportData.summary as Record<string, unknown>)?.totalEmployerEsi as number)?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Total ESIC Remittance</span>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">
                      ₹{((reportData.summary as Record<string, unknown>)?.totalEsiContribution as number)?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5">Gross Wage Basis</th>
                        <th className="px-4 py-2.5">Employee (0.75%)</th>
                        <th className="px-4 py-2.5">Employer (3.25%)</th>
                        <th className="px-4 py-2.5 text-right">Total ESIC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportData.records as Array<Record<string, unknown>>)?.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-semibold text-slate-900">
                            {r.fullName as string} <span className="text-slate-400 font-normal">({r.employeeCode as string})</span>
                          </td>
                          <td className="px-4 py-2.5">₹{(r.wageBasis as number)?.toLocaleString()}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-900">₹{(r.employeeEsi as number)?.toLocaleString()}</td>
                          <td className="px-4 py-2.5">₹{(r.employerEsi as number)?.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-700">₹{(r.totalEsi as number)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PT Tab */}
            {activeTab === "PT" && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5">Work State</th>
                        <th className="px-4 py-2.5 text-right">PT Amount Deducted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportData.records as Array<Record<string, unknown>>)?.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-semibold text-slate-900">
                            {r.fullName as string} <span className="text-slate-400 font-normal">({r.employeeCode as string})</span>
                          </td>
                          <td className="px-4 py-2.5 font-mono">{r.state as string || "MH"}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-amber-700">₹{(r.amount as number)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TDS Tab */}
            {activeTab === "TDS" && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5">Tax Regime</th>
                        <th className="px-4 py-2.5 text-right">Monthly TDS Withheld</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportData.records as Array<Record<string, unknown>>)?.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-semibold text-slate-900">
                            {r.fullName as string} <span className="text-slate-400 font-normal">({r.employeeCode as string})</span>
                          </td>
                          <td className="px-4 py-2.5 font-mono">{r.regime as string}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-amber-700">₹{(r.monthlyTds as number)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUMMARY Tab */}
            {activeTab === "SUMMARY" && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                  <div className="font-bold text-sm">Monthly Statutory Executive Overview</div>
                  <div className="mt-1">
                    Total remittance across PF, ESI, Professional Tax, and Income Tax withholding is{" "}
                    <span className="font-extrabold text-emerald-800">
                      ₹{(reportData.totalStatutoryLiability as number)?.toLocaleString()}
                    </span>{" "}
                    for {reportData.totalEmployees as number} active employees.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
