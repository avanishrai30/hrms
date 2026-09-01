"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import type {
  CompensationBreakdownResult,
  CompensationTemplateView,
  EmployeeCompensationView
} from "@vc-wms/shared-types";

interface EmployeeOption {
  id: string;
  fullName: string;
  employeeCode: string;
  department?: { name: string };
  designation?: { name: string };
}

export default function CompensationDirectoryPage() {
  const [compensations, setCompensations] = useState<EmployeeCompensationView[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [templates, setTemplates] = useState<CompensationTemplateView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modals
  const [selectedComp, setSelectedComp] = useState<EmployeeCompensationView | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Form states
  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [targetTemplateId, setTargetTemplateId] = useState("");
  const [monthlyCtcInput, setMonthlyCtcInput] = useState<number>(30000);
  const [effectiveFromInput, setEffectiveFromInput] = useState(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [reasonInput, setReasonInput] = useState<"JOINING_SALARY" | "ANNUAL_REVISION" | "PROMOTION_INCREASE" | "MANUAL_ADJUSTMENT">("JOINING_SALARY");
  const [notesInput, setNotesInput] = useState("");
  const [previewResult, setPreviewResult] = useState<CompensationBreakdownResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [compData, empData, tmplData] = await Promise.all([
        apiRequest<{ compensations: EmployeeCompensationView[] }>("/compensation/all?limit=100"),
        apiRequest<EmployeeOption[]>("/employees"),
        apiRequest<CompensationTemplateView[]>("/compensation/templates")
      ]);
      setCompensations(compData.compensations ?? []);
      setEmployees(empData ?? []);
      setTemplates(tmplData ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load compensation data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Update preview when monthly CTC or template changes
  useEffect(() => {
    async function fetchPreview() {
      if (monthlyCtcInput <= 0) return;
      try {
        const preview = await apiRequest<CompensationBreakdownResult>("/compensation/preview", {
          method: "POST",
          body: JSON.stringify({
            monthlyCtc: monthlyCtcInput,
            templateId: targetTemplateId || undefined
          })
        });
        setPreviewResult(preview);
      } catch {
        // Ignore preview fetch errors
      }
    }
    void fetchPreview();
  }, [monthlyCtcInput, targetTemplateId]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployeeId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await apiRequest(`/compensation/employees/${targetEmployeeId}/assign`, {
        method: "POST",
        body: JSON.stringify({
          employeeId: targetEmployeeId,
          templateId: targetTemplateId || undefined,
          effectiveFrom: effectiveFromInput,
          monthlyCtc: monthlyCtcInput,
          reason: reasonInput,
          notes: notesInput || undefined
        })
      });

      setShowAssignModal(false);
      setNotesInput("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to assign compensation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await apiRequest(`/compensation/employees/${selectedComp.employeeId}/revise`, {
        method: "POST",
        body: JSON.stringify({
          newMonthlyCtc: monthlyCtcInput,
          templateId: targetTemplateId || undefined,
          effectiveFrom: effectiveFromInput,
          reason: reasonInput,
          notes: notesInput || "Annual performance salary increment"
        })
      });

      setShowReviseModal(false);
      setNotesInput("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revise salary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignModal = (employeeId?: string) => {
    setTargetEmployeeId(employeeId ?? (employees[0]?.id ?? ""));
    setTargetTemplateId(templates[0]?.id ?? "");
    setMonthlyCtcInput(35000);
    setReasonInput("JOINING_SALARY");
    setNotesInput("");
    setShowAssignModal(true);
  };

  const openReviseModal = (comp: EmployeeCompensationView) => {
    setSelectedComp(comp);
    setTargetTemplateId(comp.templateId ?? "");
    setMonthlyCtcInput(Math.round(comp.monthlyCtc * 1.1)); // Default 10% increment
    setReasonInput("ANNUAL_REVISION");
    setNotesInput("");
    setShowReviseModal(true);
  };

  const openBreakdown = (comp: EmployeeCompensationView) => {
    setSelectedComp(comp);
    setShowBreakdownModal(true);
  };

  // Metrics
  const totalMonthlyCtc = compensations.reduce((acc, c) => acc + c.monthlyCtc, 0);
  const avgMonthlyCtc = compensations.length > 0 ? Math.round(totalMonthlyCtc / compensations.length) : 0;
  const totalAnnualizedRunRate = totalMonthlyCtc * 12;

  const filteredCompensations = compensations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.employee?.fullName.toLowerCase().includes(q) ||
      c.employee?.employeeCode.toLowerCase().includes(q) ||
      c.employee?.department?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compensation & Salary</h1>
          <p className="text-sm text-slate-500">
            Manage employee compensation structures, salary revisions, and template allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/compensation/templates" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Salary Templates
          </Link>
          <Link
            href={"/compensation/history" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Revision History
          </Link>
          <button
            onClick={() => openAssignModal()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            + Assign Salary
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Payroll CTC</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalMonthlyCtc.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Active monthly run-rate</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Annualized CTC</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            ₹{totalAnnualizedRunRate.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">12-month projected spend</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Average Monthly CTC</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{avgMonthlyCtc.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Per enrolled employee</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Salaries</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {compensations.length}{" "}
            <span className="text-sm font-normal text-slate-500">/ {employees.length} employees</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Assigned compensation profiles</span>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Employee Salary Directory</h2>
            <p className="text-xs text-slate-500">Active compensation profiles with effective dates</p>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, department..."
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading compensation records...</div>
        ) : filteredCompensations.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No compensation profiles found. Click &quot;+ Assign Salary&quot; above to assign salary to an employee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department & Role</th>
                  <th className="px-4 py-3">Monthly CTC</th>
                  <th className="px-4 py-3">Annual CTC</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Effective Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompensations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <div>{c.employee?.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {c.employee?.employeeCode}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800">{c.employee?.department?.name ?? "General"}</div>
                      <div className="text-xs text-slate-400">{c.employee?.designation?.name ?? "Staff"}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ₹{c.monthlyCtc.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-emerald-700">
                      ₹{c.annualCtc.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      {c.template ? (
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {c.template.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Custom Structure</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(c.effectiveFrom).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openBreakdown(c)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-2.5 py-1 rounded-md shadow-xs transition"
                      >
                        Breakdown
                      </button>
                      <button
                        onClick={() => openReviseModal(c)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md transition"
                      >
                        Revise
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Initial Salary Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Assign Employee Compensation</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee</label>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) — {emp.department?.name ?? "General"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly CTC (₹)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={monthlyCtcInput}
                    onChange={(e) => setMonthlyCtcInput(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Compensation Template
                  </label>
                  <select
                    value={targetTemplateId}
                    onChange={(e) => setTargetTemplateId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Auto Standard Calculation</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Effective From Date
                  </label>
                  <input
                    type="date"
                    value={effectiveFromInput}
                    onChange={(e) => setEffectiveFromInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                  <select
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value as typeof reasonInput)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="JOINING_SALARY">Joining Salary</option>
                    <option value="ANNUAL_REVISION">Annual Revision</option>
                    <option value="PROMOTION_INCREASE">Promotion Increase</option>
                    <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Offer letter reference or joining compensation terms..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Live Preview Card */}
              {previewResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900 text-sm border-b border-emerald-200 pb-2">
                    <span>Estimated Net Take Home</span>
                    <span>₹{previewResult.netTakeHomeMonthly.toLocaleString()} / mo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>Gross Earnings: ₹{previewResult.grossEarningsMonthly.toLocaleString()}</div>
                    <div>Deductions: ₹{previewResult.totalDeductionsMonthly.toLocaleString()}</div>
                    <div>Annual CTC: ₹{previewResult.annualCtc.toLocaleString()}</div>
                    <div>Employer PF/ESI: ₹{previewResult.employerContributionsMonthly.toLocaleString()}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Assigning..." : "Confirm & Assign Salary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Revision Modal */}
      {showReviseModal && selectedComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revise Employee Salary</h3>
                <p className="text-xs text-slate-500">
                  {selectedComp.employee?.fullName} ({selectedComp.employee?.employeeCode})
                </p>
              </div>
              <button
                onClick={() => setShowReviseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviseSubmit} className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Current Monthly CTC:</span>{" "}
                  <span className="font-bold text-slate-900">₹{selectedComp.monthlyCtc.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Current Annual:</span>{" "}
                  <span className="font-bold text-slate-900">₹{selectedComp.annualCtc.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Monthly CTC (₹)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={monthlyCtcInput}
                    onChange={(e) => setMonthlyCtcInput(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  {selectedComp.monthlyCtc > 0 && (
                    <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                      {(((monthlyCtcInput - selectedComp.monthlyCtc) / selectedComp.monthlyCtc) * 100).toFixed(1)}% increment
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Effective From Date
                  </label>
                  <input
                    type="date"
                    value={effectiveFromInput}
                    onChange={(e) => setEffectiveFromInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Revision Reason
                  </label>
                  <select
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value as typeof reasonInput)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ANNUAL_REVISION">Annual Appraisal Revision</option>
                    <option value="PROMOTION_INCREASE">Promotion Increase</option>
                    <option value="MANUAL_ADJUSTMENT">Market Correction / Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Template
                  </label>
                  <select
                    value={targetTemplateId}
                    onChange={(e) => setTargetTemplateId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Maintain Current Structure</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Revision Justification / Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Appraisal ratings, promotion decision reference..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviseModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Revising..." : "Submit Salary Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Component Breakdown Inspection Modal */}
      {showBreakdownModal && selectedComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Salary Component Breakdown</h3>
                <p className="text-xs text-slate-500">{selectedComp.employee?.fullName}</p>
              </div>
              <button
                onClick={() => setShowBreakdownModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500">Monthly CTC:</span>{" "}
                  <span className="font-bold text-slate-900">₹{selectedComp.monthlyCtc.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Annual CTC:</span>{" "}
                  <span className="font-bold text-emerald-600">₹{selectedComp.annualCtc.toLocaleString()}</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {selectedComp.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{item.component?.name}</div>
                      <div className="text-slate-400 text-[10px]">
                        {item.component?.type} • {item.component?.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{item.monthlyAmount.toLocaleString()}/mo</div>
                      <div className="text-slate-400 text-[10px]">₹{item.annualAmount.toLocaleString()}/yr</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowBreakdownModal(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
