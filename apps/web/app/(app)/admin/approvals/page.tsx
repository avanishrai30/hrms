"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { ApprovalStrategy, ApprovalTemplateView } from "@vc-wms/shared-types";

interface TemplateLevel {
  level: number;
  name: string;
  approverRole?: string;
  approverUserId?: string;
}

export default function AdminApprovalsPage() {
  const [templates, setTemplates] = useState<ApprovalTemplateView[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ApprovalTemplateView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Creation / Editing State
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("LEAVE_REQUEST");
  const [strategy, setStrategy] = useState<ApprovalStrategy>("SEQUENTIAL");
  const [levels, setLevels] = useState<TemplateLevel[]>([
    { level: 1, name: "Direct Manager", approverRole: "MANAGER" },
    { level: 2, name: "Department Head / HR Admin", approverRole: "HR_ADMIN" }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<ApprovalTemplateView[]>("/approvals/templates");
      setTemplates(res ?? []);
      if (res && res.length > 0 && !selectedTemplate) {
        setSelectedTemplate(res[0] ?? null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load approval templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleAddLevel = () => {
    const nextLevel = levels.length + 1;
    setLevels((prev) => [
      ...prev,
      { level: nextLevel, name: `Level ${nextLevel} Approval`, approverRole: "HR_ADMIN" }
    ]);
  };

  const handleRemoveLevel = (idx: number) => {
    setLevels((prev) =>
      prev.filter((_, i) => i !== idx).map((lvl, i) => ({ ...lvl, level: i + 1 }))
    );
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await apiRequest("/approvals/templates", {
        method: "POST",
        body: JSON.stringify({
          code,
          name,
          entityType,
          approverStrategy: strategy,
          levels
        })
      });

      setSuccessMessage(`Approval template "${name}" created successfully.`);
      setShowEditor(false);
      await loadTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save approval template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Approval Templates & Hierarchy</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Configure multi-tier approval chains, execution strategies, and role-based authority matrix.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowEditor(true)}>
          + Create Approval Template
        </Button>
      </header>

      {error && (
        <div className="rounded-control border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {successMessage && (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Templates Directory */}
        <Panel className="lg:col-span-1">
          <h2 className="text-base font-semibold text-zinc-950 mb-3">Template Catalog</h2>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-zinc-500">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No approval templates configured yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`w-full text-left p-3 rounded-control transition ${
                    selectedTemplate?.id === tmpl.id ? "bg-muted/80 font-medium" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-900 font-semibold">{tmpl.name}</span>
                    <Badge tone={tmpl.isActive ? "success" : "neutral"}>{tmpl.approverStrategy}</Badge>
                  </div>
                  <p className="font-mono text-xs text-zinc-500 mt-0.5">{tmpl.code}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Entity: {tmpl.entityType} • {tmpl.levels?.length ?? 0} Levels
                  </p>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {/* Template Detail Visualizer */}
        <Panel className="lg:col-span-2 space-y-6">
          {selectedTemplate ? (
            <>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-950">{selectedTemplate.name}</h2>
                  <p className="text-xs font-mono text-zinc-500">
                    {selectedTemplate.code} • Target: {selectedTemplate.entityType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Strategy: {selectedTemplate.approverStrategy}
                  </span>
                  <Badge tone={selectedTemplate.isActive ? "success" : "neutral"}>
                    {selectedTemplate.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Levels Flow Visualizer */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Approval Chain Hierarchy</h3>
                <div className="flex flex-col gap-3">
                  {selectedTemplate.levels?.map((lvl, idx) => (
                    <div
                      key={lvl.level}
                      className="flex items-center gap-4 rounded-panel border border-border bg-surface p-4 shadow-sm"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                        L{lvl.level}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-zinc-950">{lvl.name}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Assigned Authority:{" "}
                          <strong className="text-zinc-800">{lvl.approverRole ?? "Designated User"}</strong>
                        </p>
                      </div>
                      <span className="rounded bg-muted px-2 py-1 text-xs font-mono text-zinc-600">
                        {idx === 0 ? "Initial Reviewer" : idx === (selectedTemplate.levels?.length ?? 1) - 1 ? "Final Approval" : "Intermediate"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-sm text-zinc-500">
              Select an approval template from the left catalog to view its levels and routing strategies.
            </div>
          )}
        </Panel>
      </div>

      {/* Template Creator Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Create Approval Template</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Define the multi-level approval stages and escalation strategy.
            </p>

            <form onSubmit={handleSaveTemplate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Template Code">
                  <Input
                    required
                    placeholder="e.g. APPR_EXPENSE_CLAIM"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </Field>
                <Field label="Template Name">
                  <Input
                    required
                    placeholder="e.g. Expense Claim Approval"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Entity Type">
                  <Input
                    required
                    placeholder="e.g. LEAVE_REQUEST, EXPENSE, SALARY_REVISION"
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                  />
                </Field>
                <Field label="Approval Strategy">
                  <select
                    className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as ApprovalStrategy)}
                  >
                    <option value="SEQUENTIAL">SEQUENTIAL (Step-by-step)</option>
                    <option value="PARALLEL">PARALLEL (Concurrent)</option>
                    <option value="HIERARCHICAL">HIERARCHICAL (Manager Chain)</option>
                  </select>
                </Field>
              </div>

              {/* Levels Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-zinc-900">Approval Levels</h3>
                  <Button variant="secondary" type="button" className="h-8 text-xs" onClick={handleAddLevel}>
                    + Add Level
                  </Button>
                </div>
                <div className="space-y-3">
                  {levels.map((lvl, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 p-3 rounded-control border border-border bg-muted/20">
                      <span className="font-mono text-xs font-bold text-primary w-8">L{lvl.level}</span>
                      <Input
                        required
                        className="flex-1 min-w-[140px]"
                        placeholder="Level Name"
                        value={lvl.name}
                        onChange={(e) => {
                          const updated = [...levels];
                          if (updated[idx]) {
                            updated[idx].name = e.target.value;
                            setLevels(updated);
                          }
                        }}
                      />
                      <Input
                        className="w-36"
                        placeholder="Role Code"
                        value={lvl.approverRole ?? ""}
                        onChange={(e) => {
                          const updated = [...levels];
                          if (updated[idx]) {
                            updated[idx].approverRole = e.target.value;
                            setLevels(updated);
                          }
                        }}
                      />
                      {levels.length > 1 && (
                        <Button
                          variant="ghost"
                          type="button"
                          className="h-8 text-xs text-red-600"
                          onClick={() => handleRemoveLevel(idx)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
