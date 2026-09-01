"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { ComplianceRuleView, ComplianceType } from "@vc-wms/shared-types";

export default function ComplianceRulesPage() {
  const [rules, setRules] = useState<ComplianceRuleView[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Rule Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<ComplianceType>("PF");
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newState, setNewState] = useState("MH");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = selectedType ? `/compliance/rules?type=${selectedType}` : "/compliance/rules";
      const data = await apiRequest<ComplianceRuleView[]>(url);
      setRules(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load compliance rules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedType]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await apiRequest("/compliance/rules", {
        method: "POST",
        body: JSON.stringify({
          type: newType,
          name: newName,
          code: newCode,
          state: newType === "PT" ? newState : undefined,
          description: newDesc,
          configuration: {
            rate: newType === "PF" ? 12 : newType === "ESI" ? 0.75 : 200,
            ceiling: newType === "PF" ? 15000 : newType === "ESI" ? 21000 : undefined
          }
        })
      });
      setShowAddModal(false);
      setNewName("");
      setNewCode("");
      setNewDesc("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create compliance rule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Compliance Rules & State Slabs
          </h1>
          <p className="text-sm text-slate-500">
            Version-controlled statutory deduction rules, rates, ceilings, and state slab matrices.
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
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            + New Compliance Rule
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSelectedType("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === ""
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Rules
        </button>
        <button
          onClick={() => setSelectedType("PF")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "PF"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Provident Fund (PF)
        </button>
        <button
          onClick={() => setSelectedType("ESI")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "ESI"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ESIC
        </button>
        <button
          onClick={() => setSelectedType("PT")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "PT"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Professional Tax (PT)
        </button>
        <button
          onClick={() => setSelectedType("TDS")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedType === "TDS"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Income Tax (TDS)
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-sm text-slate-500">
            Loading compliance rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="text-3xl">⚖️</div>
            <h3 className="text-base font-bold text-slate-900">No Custom Rules Configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              System is currently running on statutory defaults (EPF 12%, ESI 0.75%, State PT, Sec 115BAC TDS).
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Add Custom Rule Override
            </button>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {rule.type} {rule.state ? `• ${rule.state}` : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">v{rule.currentVersion}</span>
                    <Badge tone={rule.isActive ? "success" : "neutral"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{rule.name}</h3>
                <p className="text-xs text-slate-500">{rule.description || "Statutory regulation policy."}</p>
                <div className="text-[11px] font-mono text-slate-400">Code: {rule.code}</div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 flex justify-between">
                <span>Updated: {new Date(rule.updatedAt).toLocaleDateString()}</span>
                <span className="font-semibold text-slate-700">{rule.versions?.length ?? 1} versions</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Compliance Rule</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ComplianceType)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="PF">Provident Fund (PF)</option>
                  <option value="ESI">Employee State Insurance (ESI)</option>
                  <option value="PT">Professional Tax (PT)</option>
                  <option value="TDS">Income Tax (TDS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Karnataka Professional Tax Slab"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PT_KA_DEFAULT"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono"
                  required
                />
              </div>

              {newType === "PT" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State Code</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value.toUpperCase())}
                    placeholder="e.g. KA, MH, DL"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional rule description..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
