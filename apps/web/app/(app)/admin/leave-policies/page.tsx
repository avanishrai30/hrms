"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../../lib/api";
import type { LeavePolicyView, LeaveTypeView } from "@vc-wms/shared-types";

export default function AdminLeavePoliciesPage() {
  const [types, setTypes] = useState<LeaveTypeView[]>([]);
  const [selectedType, setSelectedType] = useState<LeaveTypeView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New leave type form
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCode, setNewTypeCode] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState("CASUAL");
  const [newTypeColor, setNewTypeColor] = useState("#3B82F6");
  const [newTypePaid, setNewTypePaid] = useState(true);

  // Selected policy edit state
  const [policyForm, setPolicyForm] = useState<{
    annualAllocationDays: number;
    accrualFrequency: string;
    accrualDaysPerPeriod: number;
    maxCarryForwardDays: number;
    carryForwardExpiryMonths: number;
    allowNegativeBalance: boolean;
    maxNegativeBalanceDays: number;
    requiresManagerApproval: boolean;
    requiresHrApproval: boolean;
    requiresAttachment: boolean;
    attachmentMandatoryAboveDays: number;
    minimumNoticeDays: number;
    maxConsecutiveDays: number;
    sandwichPolicy: string;
  }>({
    annualAllocationDays: 12,
    accrualFrequency: "MONTHLY",
    accrualDaysPerPeriod: 1,
    maxCarryForwardDays: 0,
    carryForwardExpiryMonths: 12,
    allowNegativeBalance: false,
    maxNegativeBalanceDays: 0,
    requiresManagerApproval: true,
    requiresHrApproval: false,
    requiresAttachment: false,
    attachmentMandatoryAboveDays: 2,
    minimumNoticeDays: 0,
    maxConsecutiveDays: 15,
    sandwichPolicy: "NONE"
  });

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<LeaveTypeView[]>("/leaves/types");
      setTypes(data);
      if (data.length > 0) {
        const first = data[0];
        if (first) {
          setSelectedType(first);
          syncPolicyForm(first.policies?.[0] ?? first.policy);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leave types.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTypes();
  }, []);

  const syncPolicyForm = (p?: LeavePolicyView | null) => {
    if (!p) return;
    setPolicyForm({
      annualAllocationDays: p.annualAllocationDays ?? 12,
      accrualFrequency: p.accrualFrequency ?? "MONTHLY",
      accrualDaysPerPeriod: p.accrualDaysPerPeriod ?? 1,
      maxCarryForwardDays: p.maxCarryForwardDays ?? 0,
      carryForwardExpiryMonths: p.carryForwardExpiryMonths ?? 12,
      allowNegativeBalance: p.allowNegativeBalance ?? false,
      maxNegativeBalanceDays: p.maxNegativeBalanceDays ?? 0,
      requiresManagerApproval: p.requiresManagerApproval ?? true,
      requiresHrApproval: p.requiresHrApproval ?? false,
      requiresAttachment: p.requiresAttachment ?? false,
      attachmentMandatoryAboveDays: p.attachmentMandatoryAboveDays ?? 2,
      minimumNoticeDays: p.minimumNoticeDays ?? 0,
      maxConsecutiveDays: p.maxConsecutiveDays ?? 15,
      sandwichPolicy: p.sandwichPolicy ?? "NONE"
    });
  };

  const handleSelectType = (t: LeaveTypeView) => {
    setSelectedType(t);
    syncPolicyForm(t.policies?.[0] ?? t.policy);
    setSuccessMsg(null);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);

      await apiRequest("/leaves/policies", {
        method: "PATCH",
        body: JSON.stringify({
          leaveTypeId: selectedType.id,
          ...policyForm
        })
      });

      setSuccessMsg(`Policy for ${selectedType.name} updated successfully.`);
      await loadTypes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save leave policy.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await apiRequest("/leaves/types", {
        method: "POST",
        body: JSON.stringify({
          name: newTypeName,
          code: newTypeCode,
          category: newTypeCategory,
          color: newTypeColor,
          isPaid: newTypePaid
        })
      });

      setShowCreateTypeModal(false);
      setNewTypeName("");
      setNewTypeCode("");
      await loadTypes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create leave type.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leave Policies & Rules</h1>
          <p className="text-sm text-slate-500">
            Configure annual allocations, monthly accruals, carry-forward rules, and sandwich policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/admin/leave-audit" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Leave Approvals Queue
          </Link>
          <button
            onClick={() => setShowCreateTypeModal(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            + New Leave Type
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Types Sidebar */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Configured Leave Types</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectType(t)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedType?.id === t.id
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm">{t.name}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${t.color}20`,
                        color: t.color
                      }}
                    >
                      {t.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>{t.category}</span>
                    <span>{t.isPaid ? "Paid" : "Unpaid"}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Policy Configuration Form */}
        <div className="md:col-span-2">
          {selectedType ? (
            <form
              onSubmit={handleSavePolicy}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Policy Rules: {selectedType.name} ({selectedType.code})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Adjust allocation, carry-forward, and sandwich deductions.
                  </p>
                </div>
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: selectedType.color }}
                />
              </div>

              {/* Allocation & Accrual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Annual Allocation (Days)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={policyForm.annualAllocationDays}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, annualAllocationDays: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Accrual Frequency
                  </label>
                  <select
                    value={policyForm.accrualFrequency}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, accrualFrequency: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="MONTHLY">Monthly Accrual</option>
                    <option value="QUARTERLY">Quarterly Accrual</option>
                    <option value="YEARLY">Yearly Allocation</option>
                    <option value="MANUAL">Manual Only</option>
                  </select>
                </div>
              </div>

              {/* Carry Forward Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Max Carry Forward (Days)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={policyForm.maxCarryForwardDays}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, maxCarryForwardDays: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">Set 0 for none, -1 for unlimited</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Carry Forward Expiry (Months)
                  </label>
                  <input
                    type="number"
                    value={policyForm.carryForwardExpiryMonths}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, carryForwardExpiryMonths: parseInt(e.target.value, 10) || 12 })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Sandwich Policy */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Sandwich Leave Policy
                </label>
                <select
                  value={policyForm.sandwichPolicy}
                  onChange={(e) =>
                    setPolicyForm({ ...policyForm, sandwichPolicy: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="NONE">None — Only working days deducted</option>
                  <option value="WEEKENDS_ONLY">Weekends Only — Intervening Sat/Sun deducted</option>
                  <option value="HOLIDAYS_ONLY">Holidays Only — Intervening Public Holidays deducted</option>
                  <option value="WEEKENDS_AND_HOLIDAYS">Weekends & Holidays — Both deducted as sandwich</option>
                </select>
              </div>

              {/* Approvals & Constraints */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-semibold uppercase text-slate-600">Approval Workflow & Limits</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requiresManagerApproval}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, requiresManagerApproval: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Requires Manager Approval</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requiresHrApproval}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, requiresHrApproval: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Requires HR Approval</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.allowNegativeBalance}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, allowNegativeBalance: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Allow Negative Balance</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requiresAttachment}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, requiresAttachment: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Require Document Attachment</span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? "Saving Policy..." : "Save Policy Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Select a leave type on the left to configure policy rules.
            </div>
          )}
        </div>
      </div>

      {/* Create Leave Type Modal */}
      {showCreateTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New Leave Type</h3>
            <form onSubmit={handleCreateType} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. Parental Leave"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={newTypeCode}
                    onChange={(e) => setNewTypeCode(e.target.value.toUpperCase())}
                    placeholder="PL"
                    maxLength={6}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 uppercase focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newTypeCategory}
                    onChange={(e) => setNewTypeCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="CASUAL">Casual</option>
                    <option value="SICK">Sick</option>
                    <option value="EARNED">Earned</option>
                    <option value="MATERNITY">Maternity</option>
                    <option value="PATERNITY">Paternity</option>
                    <option value="COMPENSATORY_OFF">Comp Off</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Color (Hex)</label>
                  <input
                    type="color"
                    value={newTypeColor}
                    onChange={(e) => setNewTypeColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 p-1 cursor-pointer"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTypePaid}
                      onChange={(e) => setNewTypePaid(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Paid Leave</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTypeModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  Create Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
