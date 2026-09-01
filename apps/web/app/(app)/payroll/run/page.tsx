"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type {
  PayrollAdjustmentType,
  PayrollRunEmployeeView,
  PayrollRunView
} from "@vc-wms/shared-types";

export default function PayrollRunWorkbenchPage() {
  const [currentRun, setCurrentRun] = useState<PayrollRunView | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Adjustment Modal
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [targetEmp, setTargetEmp] = useState<PayrollRunEmployeeView | null>(null);
  const [adjType, setAdjType] = useState<PayrollAdjustmentType>("BONUS");
  const [adjTitle, setAdjTitle] = useState("");
  const [adjAmount, setAdjAmount] = useState<number>(1000);
  const [adjReason, setAdjReason] = useState("");
  const [isSubmittingAdj, setIsSubmittingAdj] = useState(false);

  // Workflow Actions state
  const [isActing, setIsActing] = useState(false);

  const loadRun = async (m = selectedMonth, y = selectedYear) => {
    try {
      setIsLoading(true);
      setError(null);
      const runsData = await apiRequest<{ runs: PayrollRunView[] }>(
        `/payroll/runs?month=${m}&year=${y}`
      );
      if (runsData.runs && runsData.runs.length > 0 && runsData.runs[0]) {
        const runDetail = await apiRequest<PayrollRunView>(`/payroll/runs/${runsData.runs[0].id}`);
        setCurrentRun(runDetail);
      } else {
        setCurrentRun(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payroll run.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRun();
  }, []);

  const handleMonthChange = (m: number, y: number) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    void loadRun(m, y);
  };

  const handleGenerateOrRecalculate = async () => {
    try {
      setIsActing(true);
      setError(null);
      if (currentRun && currentRun.status !== "LOCKED") {
        const recalculated = await apiRequest<PayrollRunView>(
          `/payroll/runs/${currentRun.id}/recalculate`,
          { method: "POST" }
        );
        setCurrentRun(recalculated);
      } else {
        const created = await apiRequest<PayrollRunView>("/payroll/runs", {
          method: "POST",
          body: JSON.stringify({ month: selectedMonth, year: selectedYear })
        });
        setCurrentRun(created);
      }
      await loadRun();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process payroll run.");
    } finally {
      setIsActing(false);
    }
  };

  const handleApprove = async () => {
    if (!currentRun) return;
    try {
      setIsActing(true);
      setError(null);
      await apiRequest(`/payroll/runs/${currentRun.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ note: "Approved by HR Admin" })
      });
      await loadRun();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve payroll run.");
    } finally {
      setIsActing(false);
    }
  };

  const handleLock = async () => {
    if (!currentRun) return;
    if (!confirm("Are you sure you want to permanently lock this payroll run? Locked payroll runs cannot be edited or recalculated.")) {
      return;
    }
    try {
      setIsActing(true);
      setError(null);
      await apiRequest(`/payroll/runs/${currentRun.id}/lock`, {
        method: "POST",
        body: JSON.stringify({ note: "Locked by Tenant Administrator" })
      });
      await loadRun();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to lock payroll run.");
    } finally {
      setIsActing(false);
    }
  };

  const openAdjustmentModal = (emp: PayrollRunEmployeeView) => {
    setTargetEmp(emp);
    setAdjType("BONUS");
    setAdjTitle("Overtime / Performance Incentive");
    setAdjAmount(1500);
    setAdjReason("Monthly operational excellence bonus");
    setShowAdjModal(true);
  };

  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRun || !targetEmp) return;

    try {
      setIsSubmittingAdj(true);
      setError(null);
      await apiRequest(`/payroll/runs/${currentRun.id}/adjustments`, {
        method: "POST",
        body: JSON.stringify({
          payrollRunEmployeeId: targetEmp.id,
          type: adjType,
          title: adjTitle,
          amount: adjType === "PENALTY" || adjType === "ADVANCE_RECOVERY" ? -Math.abs(adjAmount) : Math.abs(adjAmount),
          reason: adjReason
        })
      });

      setShowAdjModal(false);
      await loadRun();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add adjustment.");
    } finally {
      setIsSubmittingAdj(false);
    }
  };

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
            Payroll Run Workbench
          </h1>
          <p className="text-sm text-slate-500">
            Verify payable days, examine component prorations, apply adjustments, and execute approval sign-offs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/payroll" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Month Selector Bar & Run Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Select Cycle:</label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(parseInt(e.target.value, 10), selectedYear)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
            onChange={(e) => handleMonthChange(selectedMonth, parseInt(e.target.value, 10))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {currentRun ? (
            <>
              {currentRun.status === "GENERATED" && (
                <>
                  <button
                    onClick={handleGenerateOrRecalculate}
                    disabled={isActing}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    🔄 Recalculate
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isActing}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                  >
                    ✓ Approve Payroll
                  </button>
                </>
              )}

              {currentRun.status === "APPROVED" && (
                <button
                  onClick={handleLock}
                  disabled={isActing}
                  className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm transition"
                >
                  🔒 Lock & Finalize Payroll
                </button>
              )}

              {currentRun.status === "LOCKED" && (
                <Badge tone="neutral">🔒 Immutable / Locked</Badge>
              )}
            </>
          ) : (
            <button
              onClick={handleGenerateOrRecalculate}
              disabled={isActing}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
            >
              ⚡ Generate Payroll for {monthNames[selectedMonth - 1]}
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      {currentRun && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Gross Earnings</span>
            <div className="mt-1 text-xl font-bold text-slate-900">
              ₹{currentRun.totalGross.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Deductions</span>
            <div className="mt-1 text-xl font-bold text-amber-700">
              ₹{currentRun.totalDeductions.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Net Disbursed</span>
            <div className="mt-1 text-xl font-bold text-emerald-600">
              ₹{currentRun.totalNet.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Enrolled Employees</span>
            <div className="mt-1 text-xl font-bold text-slate-900">{currentRun.totalEmployees}</div>
          </div>
        </div>
      )}

      {/* Employee Payroll Calculation Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Employee Payroll Calculations</h2>
            <p className="text-xs text-slate-500">
              {currentRun
                ? `Calculated values for ${monthNames[selectedMonth - 1]} ${selectedYear}`
                : "No run active"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading workbench...</div>
        ) : !currentRun ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No payroll run found for {monthNames[selectedMonth - 1]} {selectedYear}. Click &quot;⚡ Generate Payroll&quot; above to calculate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Payable Days</th>
                  <th className="px-4 py-3">Base CTC</th>
                  <th className="px-4 py-3">Prorated Gross</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Adjustments</th>
                  <th className="px-4 py-3">Net Take-Home</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRun.employees?.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <div>{emp.employee?.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {emp.employee?.employeeCode} • {emp.employee?.department?.name ?? "General"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900">{emp.payableDays}</span>
                      <span className="text-xs text-slate-400"> / {emp.workingDays} days</span>
                      {emp.absentDays > 0 && (
                        <div className="text-[10px] text-red-600 font-medium">{emp.absentDays} absent</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      ₹{emp.baseMonthlyCtc.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      ₹{emp.grossSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-amber-700">
                      ₹{emp.totalDeductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      {emp.totalAdjustments !== 0 ? (
                        <span
                          className={`text-xs font-bold ${
                            emp.totalAdjustments > 0 ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {emp.totalAdjustments > 0
                            ? `+₹${emp.totalAdjustments.toLocaleString()}`
                            : `-₹${Math.abs(emp.totalAdjustments).toLocaleString()}`}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700 text-base">
                      ₹{emp.netSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {currentRun.status !== "LOCKED" && (
                        <button
                          onClick={() => openAdjustmentModal(emp)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white px-2.5 py-1 rounded shadow-xs"
                        >
                          + Adjust
                        </button>
                      )}
                      <Link
                        href={`/payroll/employees/${emp.id}` as Route}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded"
                      >
                        Paysheet &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Adjustment Modal */}
      {showAdjModal && targetEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Payroll Adjustment</h3>
                <p className="text-xs text-slate-500">{targetEmp.employee?.fullName}</p>
              </div>
              <button
                onClick={() => setShowAdjModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Type</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as PayrollAdjustmentType)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="BONUS">Bonus / Incentive (+ Addition)</option>
                  <option value="REIMBURSEMENT">Expense Reimbursement (+ Addition)</option>
                  <option value="PENALTY">Penalty / Deduction (- Deduction)</option>
                  <option value="ADVANCE_RECOVERY">Advance Salary Recovery (- Deduction)</option>
                  <option value="CUSTOM">Custom Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Title</label>
                <input
                  type="text"
                  value={adjTitle}
                  onChange={(e) => setAdjTitle(e.target.value)}
                  placeholder="e.g. Performance Bonus"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  step={100}
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Justification</label>
                <textarea
                  rows={2}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="Reference notes or approval reason..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdj}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingAdj ? "Saving..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
