"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { WorkflowDefinitionView, WorkflowStepAction } from "@vc-wms/shared-types";

interface StepConfig {
  code: string;
  name: string;
  assigneeRole?: string;
  slaHours?: number;
  requireComment?: boolean;
}

interface TransitionConfig {
  fromStep: string;
  action: WorkflowStepAction;
  toStep: string;
}

export default function AdminWorkflowsPage() {
  const [definitions, setDefinitions] = useState<WorkflowDefinitionView[]>([]);
  const [selectedDef, setSelectedDef] = useState<WorkflowDefinitionView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Creation State
  const [showCreator, setShowCreator] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entityType, setEntityType] = useState("LEAVE_REQUEST");
  const [steps, setSteps] = useState<StepConfig[]>([
    { code: "SUBMITTED", name: "Initial Submission", assigneeRole: "EMPLOYEE", slaHours: 24 },
    { code: "MANAGER_REVIEW", name: "Manager Review", assigneeRole: "MANAGER", slaHours: 48, requireComment: true },
    { code: "HR_REVIEW", name: "HR Review", assigneeRole: "HR_ADMIN", slaHours: 24 }
  ]);
  const [transitions, setTransitions] = useState<TransitionConfig[]>([
    { fromStep: "SUBMITTED", action: "APPROVED", toStep: "MANAGER_REVIEW" },
    { fromStep: "MANAGER_REVIEW", action: "APPROVED", toStep: "HR_REVIEW" },
    { fromStep: "MANAGER_REVIEW", action: "REJECTED", toStep: "END" },
    { fromStep: "HR_REVIEW", action: "APPROVED", toStep: "END" },
    { fromStep: "HR_REVIEW", action: "REJECTED", toStep: "END" }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const loadDefinitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<WorkflowDefinitionView[]>("/workflows/definitions");
      setDefinitions(res ?? []);
      if (res && res.length > 0 && !selectedDef) {
        setSelectedDef(res[0] ?? null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load workflow definitions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDefinitions();
  }, []);

  const handleAddStep = () => {
    const nextIdx = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      { code: `STEP_${nextIdx}`, name: `Step ${nextIdx}`, assigneeRole: "MANAGER", slaHours: 24 }
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddTransition = () => {
    if (steps.length === 0) return;
    setTransitions((prev) => [
      ...prev,
      { fromStep: steps[0]?.code ?? "START", action: "APPROVED", toStep: "END" }
    ]);
  };

  const handleRemoveTransition = (idx: number) => {
    setTransitions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await apiRequest("/workflows/definitions", {
        method: "POST",
        body: JSON.stringify({
          code,
          name,
          description: description || undefined,
          entityType,
          steps,
          transitions
        })
      });

      setSuccessMessage(`Workflow definition "${name}" created successfully.`);
      setShowCreator(false);
      await loadDefinitions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create workflow definition.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Workflow Definitions & Designer</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Define multi-step state machines, escalation rules, and visualize approval pipelines.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreator(true)}>
          + New Workflow Definition
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

      {/* Main Layout: Left = Definitions List, Right = Step & Transition Visualizer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Definitions Directory */}
        <Panel className="lg:col-span-1">
          <h2 className="text-base font-semibold text-zinc-950 mb-3">Workflow Catalog</h2>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-zinc-500">Loading definitions...</div>
          ) : definitions.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No definitions configured. Click &quot;New Workflow Definition&quot; above.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {definitions.map((def) => (
                <button
                  key={def.id}
                  onClick={() => setSelectedDef(def)}
                  className={`w-full text-left p-3 rounded-control transition ${
                    selectedDef?.id === def.id ? "bg-muted/80 font-medium" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-900 font-semibold">{def.name}</span>
                    <Badge tone={def.isActive ? "success" : "neutral"}>v{def.version}</Badge>
                  </div>
                  <p className="font-mono text-xs text-zinc-500 mt-0.5">{def.code}</p>
                  <p className="text-xs text-zinc-400 mt-1">Entity: {def.entityType}</p>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {/* Visualizer & Inspection */}
        <Panel className="lg:col-span-2 space-y-6">
          {selectedDef ? (
            <>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-950">{selectedDef.name}</h2>
                  <p className="text-xs font-mono text-zinc-500">{selectedDef.code} • Entity: {selectedDef.entityType}</p>
                  {selectedDef.description && (
                    <p className="text-sm text-zinc-600 mt-1">{selectedDef.description}</p>
                  )}
                </div>
                <Badge tone={selectedDef.isActive ? "success" : "neutral"}>
                  {selectedDef.isActive ? "Active Definition" : "Inactive"}
                </Badge>
              </div>

              {/* Step Sequence Flowchart */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Step Execution Flow</h3>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
                  {selectedDef.steps?.map((step, idx) => (
                    <div key={step.code} className="flex items-center gap-3">
                      <div className="rounded-panel border-2 border-primary/40 bg-surface p-4 shadow-sm min-w-[160px]">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                          Step {idx + 1}
                        </span>
                        <h4 className="mt-1 font-medium text-sm text-zinc-950">{step.name}</h4>
                        <p className="font-mono text-xs text-zinc-500">{step.code}</p>
                        <div className="mt-2 text-xs text-zinc-600">
                          <span>Role: <strong>{step.assigneeRole ?? "Dynamic"}</strong></span>
                          {step.slaHours && <p className="text-zinc-500">SLA: {step.slaHours}h</p>}
                        </div>
                      </div>
                      {idx < (selectedDef.steps?.length ?? 0) - 1 && (
                        <div className="hidden md:block text-zinc-400 font-bold text-lg">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* State Transitions Matrix */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">State Transitions</h3>
                <div className="overflow-x-auto rounded-panel border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-zinc-600 uppercase">
                      <tr>
                        <th className="p-3">From Step</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">To Step</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-xs">
                      {selectedDef.transitions?.map((tr, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="p-3 font-semibold text-zinc-900">{tr.fromStep}</td>
                          <td className="p-3">
                            <Badge
                              tone={
                                tr.action === "APPROVED"
                                  ? "success"
                                  : tr.action === "REJECTED"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {tr.action}
                            </Badge>
                          </td>
                          <td className="p-3 font-semibold text-zinc-900">{tr.toStep}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-sm text-zinc-500">
              Select a workflow definition from the left panel to inspect its steps and visual transitions.
            </div>
          )}
        </Panel>
      </div>

      {/* Workflow Creator Modal */}
      {showCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Create Workflow Definition</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Define the state graph, step assignments, and transition triggers.
            </p>

            <form onSubmit={handleCreateWorkflow} className="mt-4 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Definition Code">
                  <Input
                    required
                    placeholder="e.g. WF_LEAVE_APPROVAL"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </Field>
                <Field label="Workflow Name">
                  <Input
                    required
                    placeholder="e.g. Standard Leave Approval Pipeline"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Entity Type">
                  <Input
                    required
                    placeholder="e.g. LEAVE_REQUEST, EXPENSE, OVERTIME"
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                  />
                </Field>
                <Field label="Description">
                  <Input
                    placeholder="Brief purpose of this workflow..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
              </div>

              {/* Steps Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-zinc-900">Workflow Steps</h3>
                  <Button variant="secondary" type="button" className="h-8 text-xs" onClick={handleAddStep}>
                    + Add Step
                  </Button>
                </div>
                <div className="space-y-3">
                  {steps.map((st, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 p-3 rounded-control border border-border bg-muted/20">
                      <Input
                        required
                        className="w-28"
                        placeholder="Code"
                        value={st.code}
                        onChange={(e) => {
                          const updated = [...steps];
                          if (updated[idx]) {
                            updated[idx].code = e.target.value.toUpperCase();
                            setSteps(updated);
                          }
                        }}
                      />
                      <Input
                        required
                        className="flex-1 min-w-[140px]"
                        placeholder="Name"
                        value={st.name}
                        onChange={(e) => {
                          const updated = [...steps];
                          if (updated[idx]) {
                            updated[idx].name = e.target.value;
                            setSteps(updated);
                          }
                        }}
                      />
                      <Input
                        className="w-32"
                        placeholder="Assignee Role"
                        value={st.assigneeRole ?? ""}
                        onChange={(e) => {
                          const updated = [...steps];
                          if (updated[idx]) {
                            updated[idx].assigneeRole = e.target.value;
                            setSteps(updated);
                          }
                        }}
                      />
                      <Input
                        type="number"
                        className="w-20"
                        placeholder="SLA (h)"
                        value={st.slaHours ?? ""}
                        onChange={(e) => {
                          const updated = [...steps];
                          if (updated[idx]) {
                            updated[idx].slaHours = Number(e.target.value);
                            setSteps(updated);
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="h-8 text-xs text-red-600"
                        onClick={() => handleRemoveStep(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transitions Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-zinc-900">Transitions</h3>
                  <Button variant="secondary" type="button" className="h-8 text-xs" onClick={handleAddTransition}>
                    + Add Transition
                  </Button>
                </div>
                <div className="space-y-3">
                  {transitions.map((tr, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 p-3 rounded-control border border-border bg-muted/20">
                      <Input
                        required
                        className="w-32"
                        placeholder="From Step"
                        value={tr.fromStep}
                        onChange={(e) => {
                          const updated = [...transitions];
                          if (updated[idx]) {
                            updated[idx].fromStep = e.target.value;
                            setTransitions(updated);
                          }
                        }}
                      />
                      <select
                        className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none w-36"
                        value={tr.action}
                        onChange={(e) => {
                          const updated = [...transitions];
                          if (updated[idx]) {
                            updated[idx].action = e.target.value as WorkflowStepAction;
                            setTransitions(updated);
                          }
                        }}
                      >
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="DELEGATED">DELEGATED</option>
                        <option value="ESCALATED">ESCALATED</option>
                      </select>
                      <Input
                        required
                        className="w-32"
                        placeholder="To Step"
                        value={tr.toStep}
                        onChange={(e) => {
                          const updated = [...transitions];
                          if (updated[idx]) {
                            updated[idx].toStep = e.target.value;
                            setTransitions(updated);
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="h-8 text-xs text-red-600"
                        onClick={() => handleRemoveTransition(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowCreator(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Workflow"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
