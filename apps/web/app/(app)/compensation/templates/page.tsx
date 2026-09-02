"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type {
  CompensationBreakdownResult,
  CompensationTemplateView,
  SalaryComponentCategory,
  SalaryComponentType,
  SalaryComponentView
} from "@vc-wms/shared-types";

export default function CompensationTemplatesPage() {
  const [templates, setTemplates] = useState<CompensationTemplateView[]>([]);
  const [components, setComponents] = useState<SalaryComponentView[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CompensationTemplateView | null>(null);
  const [simulatedCtc, setSimulatedCtc] = useState<number>(30000);
  const [simulationResult, setSimulationResult] = useState<CompensationBreakdownResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Component Modal
  const [showCompModal, setShowCompModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompCode, setNewCompCode] = useState("");
  const [newCompType, setNewCompType] = useState<SalaryComponentType>("EARNING");
  const [newCompCategory, setNewCompCategory] = useState<SalaryComponentCategory>("CUSTOM");
  const [newCompCalcType, setNewCompCalcType] = useState<"FLAT_AMOUNT" | "PERCENTAGE_OF_BASIC" | "PERCENTAGE_OF_GROSS">("PERCENTAGE_OF_BASIC");
  const [newCompCalcVal, setNewCompCalcVal] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [tmplData, compData] = await Promise.all([
        apiRequest<CompensationTemplateView[]>("/compensation/templates"),
        apiRequest<SalaryComponentView[]>("/compensation/components")
      ]);
      setTemplates(tmplData);
      setComponents(compData);
      if (tmplData.length > 0) {
        setSelectedTemplate(tmplData[0] ?? null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Update simulator
  useEffect(() => {
    async function runSim() {
      if (simulatedCtc <= 0) return;
      try {
        const result = await apiRequest<CompensationBreakdownResult>("/compensation/preview", {
          method: "POST",
          body: JSON.stringify({
            monthlyCtc: simulatedCtc,
            templateId: selectedTemplate?.id
          })
        });
        setSimulationResult(result);
      } catch {
        // Ignore sim error
      }
    }
    void runSim();
  }, [simulatedCtc, selectedTemplate]);

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await apiRequest("/compensation/components", {
        method: "POST",
        body: JSON.stringify({
          name: newCompName,
          code: newCompCode.toUpperCase(),
          type: newCompType,
          category: newCompCategory,
          calculationType: newCompCalcType,
          calculationValue: newCompCalcVal,
          isTaxable: true,
          isFixed: true
        })
      });

      setShowCompModal(false);
      setNewCompName("");
      setNewCompCode("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create component.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Compensation Templates & Components
          </h1>
          <p className="text-sm text-slate-500">
            Configure standardized salary structures for Factory Workers, Warehouse Staff, and Executives.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/compensation" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Salary Directory
          </Link>
          <button
            onClick={() => setShowCompModal(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            + New Component
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Standard Templates</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedTemplate?.id === t.id
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    <Badge tone="neutral">{t.code}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  <div className="mt-2 text-[11px] font-medium text-emerald-700">
                    {t.items?.length ?? 0} configured components
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Salary Components Library summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-700">Component Library</h3>
              <span className="text-xs text-slate-400">{components.length} active</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {components.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({c.code})</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {c.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Template Details & Live Simulator */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate ? (
            <>
              {/* Template Items Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedTemplate.name}</h2>
                    <p className="text-xs text-slate-500">Job Role: {selectedTemplate.jobRole ?? "—"}</p>
                  </div>
                  <Badge tone="success">Active Template</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5">Component</th>
                        <th className="px-3 py-2.5">Type</th>
                        <th className="px-3 py-2.5">Category</th>
                        <th className="px-3 py-2.5">Calculation Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTemplate.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="px-3 py-2.5 font-semibold text-slate-800">
                            {it.component?.name ?? "Component"}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100">
                              {it.component?.type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">{it.component?.category}</td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-slate-700">
                            {it.calculationType === "PERCENTAGE_OF_BASIC"
                              ? `${it.calculationValue}% of Basic`
                              : it.calculationType === "PERCENTAGE_OF_GROSS"
                              ? `${it.calculationValue}% of Gross`
                              : it.calculationValue > 0
                              ? `Fixed ₹${it.calculationValue}`
                              : "Balancing Allocation"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Salary Breakdown Simulator */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Live Template Simulator
                    </h3>
                    <p className="text-xs text-slate-600">
                      Test salary breakdown across components for this template
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      Monthly CTC: ₹
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={simulatedCtc}
                      onChange={(e) => setSimulatedCtc(parseFloat(e.target.value) || 0)}
                      className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {simulationResult && (
                  <div className="space-y-4 pt-2">
                    {/* Summary Totals */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-xs">
                        <span className="text-[11px] text-slate-500 uppercase">Gross Earnings</span>
                        <div className="text-base font-bold text-slate-900 mt-0.5">
                          ₹{simulationResult.grossEarningsMonthly.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-xs">
                        <span className="text-[11px] text-slate-500 uppercase">Deductions</span>
                        <div className="text-base font-bold text-amber-700 mt-0.5">
                          ₹{simulationResult.totalDeductionsMonthly.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-xs">
                        <span className="text-[11px] text-slate-500 uppercase">Employer PF/ESI</span>
                        <div className="text-base font-bold text-slate-700 mt-0.5">
                          ₹{simulationResult.employerContributionsMonthly.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-emerald-600 text-white rounded-lg p-3 shadow-xs">
                        <span className="text-[11px] text-emerald-100 uppercase font-medium">Net Take-Home</span>
                        <div className="text-base font-bold mt-0.5">
                          ₹{simulationResult.netTakeHomeMonthly.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Details */}
                    <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-2">Component</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2 text-right">Monthly</th>
                            <th className="px-4 py-2 text-right">Annual</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {simulationResult.items.map((item) => (
                            <tr key={item.componentId}>
                              <td className="px-4 py-2 font-medium text-slate-800">
                                {item.name} ({item.code})
                              </td>
                              <td className="px-4 py-2 text-[10px]">
                                {item.type}
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-slate-900">
                                ₹{item.monthlyAmount.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-slate-500">
                                ₹{item.annualAmount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Select a template to view details and simulate salary allocations.
            </div>
          )}
        </div>
      </div>

      {/* New Component Modal */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Salary Component</h3>
            <form onSubmit={handleCreateComponent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Component Name</label>
                <input
                  type="text"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="e.g. Attendance Bonus"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Component Code</label>
                  <input
                    type="text"
                    value={newCompCode}
                    onChange={(e) => setNewCompCode(e.target.value.toUpperCase())}
                    placeholder="BONUS"
                    maxLength={10}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 uppercase focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newCompType}
                    onChange={(e) => setNewCompType(e.target.value as SalaryComponentType)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="EARNING">Earning</option>
                    <option value="DEDUCTION">Deduction</option>
                    <option value="EMPLOYER_CONTRIBUTION">Employer Contribution</option>
                    <option value="INFORMATIONAL">Informational</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCompCategory}
                    onChange={(e) => setNewCompCategory(e.target.value as SalaryComponentCategory)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="HRA">HRA</option>
                    <option value="CONVEYANCE">Conveyance</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="SPECIAL_ALLOWANCE">Special Allowance</option>
                    <option value="BONUS">Bonus</option>
                    <option value="PF">PF</option>
                    <option value="ESI">ESI</option>
                    <option value="PROFESSIONAL_TAX">Professional Tax</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calculation Rule</label>
                  <select
                    value={newCompCalcType}
                    onChange={(e) => setNewCompCalcType(e.target.value as typeof newCompCalcType)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="PERCENTAGE_OF_BASIC">% of Basic</option>
                    <option value="PERCENTAGE_OF_GROSS">% of Gross</option>
                    <option value="FLAT_AMOUNT">Flat Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Calculation Value</label>
                <input
                  type="number"
                  min={0}
                  value={newCompCalcVal}
                  onChange={(e) => setNewCompCalcVal(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Create Component"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
