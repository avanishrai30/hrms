"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type {
  WorkflowAuditView,
  WorkflowDefinitionView,
  WorkflowInstanceView,
  WorkflowStepAction
} from "@vc-wms/shared-types";

export default function WorkflowsPage() {
  const [instances, setInstances] = useState<WorkflowInstanceView[]>([]);
  const [myTasks, setMyTasks] = useState<WorkflowInstanceView[]>([]);
  const [definitions, setDefinitions] = useState<WorkflowDefinitionView[]>([]);
  const [activeTab, setActiveTab] = useState<"MY_TASKS" | "ALL" | "COMPLETED">("MY_TASKS");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [startDefCode, setStartDefCode] = useState("");
  const [startEntityType, setStartEntityType] = useState("LEAVE_REQUEST");
  const [startEntityId, setStartEntityId] = useState("");
  const [startDataJson, setStartDataJson] = useState("{}");
  const [isStarting, setIsStarting] = useState(false);

  // Action Modal
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstanceView | null>(null);
  const [actionType, setActionType] = useState<WorkflowStepAction>("APPROVED");
  const [actionComment, setActionComment] = useState("");
  const [isActioning, setIsActioning] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  // Audit Modal
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<WorkflowAuditView[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [instRes, myRes, defRes] = await Promise.all([
        apiRequest<WorkflowInstanceView[]>("/workflows/instances").catch(() => []),
        apiRequest<WorkflowInstanceView[]>("/workflows/me").catch(() => []),
        apiRequest<WorkflowDefinitionView[]>("/workflows/definitions").catch(() => [])
      ]);
      setInstances(instRes ?? []);
      setMyTasks(myRes ?? []);
      setDefinitions(defRes ?? []);
      if (defRes && defRes.length > 0 && !startDefCode) {
        setStartDefCode(defRes[0]?.code ?? "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load workflows.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleStartWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsStarting(true);
      setError(null);
      let parsed = {};
      try {
        parsed = JSON.parse(startDataJson);
      } catch {
        throw new Error("Invalid JSON data provided.");
      }

      await apiRequest("/workflows/start", {
        method: "POST",
        body: JSON.stringify({
          definitionCode: startDefCode,
          entityType: startEntityType,
          entityId: startEntityId,
          data: parsed
        })
      });

      setSuccessMessage("Workflow initiated successfully.");
      setShowStartModal(false);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start workflow.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleAdvanceStep = async () => {
    if (!selectedInstance) return;
    try {
      setIsActioning(true);
      setError(null);
      await apiRequest(`/workflows/instances/${selectedInstance.id}/advance`, {
        method: "POST",
        body: JSON.stringify({
          action: actionType,
          comment: actionComment || undefined
        })
      });

      setSuccessMessage(`Step action "${actionType}" completed.`);
      setShowActionModal(false);
      setSelectedInstance(null);
      setActionComment("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to advance workflow step.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleViewAudit = async (instance: WorkflowInstanceView) => {
    setSelectedInstance(instance);
    setShowAuditModal(true);
    try {
      setIsLoadingAudit(true);
      const logs = await apiRequest<WorkflowAuditView[]>(`/workflows/instances/${instance.id}/audit`);
      setAuditLogs(logs ?? []);
    } catch {
      setAuditLogs([]);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const getSlaBadge = (deadlineStr: string | null | undefined) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr).getTime();
    const now = Date.now();
    const diffHours = Math.round((deadline - now) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return <Badge tone="danger">SLA Breached ({Math.abs(diffHours)}h ago)</Badge>;
    }
    if (diffHours <= 4) {
      return <Badge tone="warning">SLA Due ({diffHours}h left)</Badge>;
    }
    return <Badge tone="neutral">SLA {diffHours}h remaining</Badge>;
  };

  const displayedList =
    activeTab === "MY_TASKS"
      ? myTasks
      : activeTab === "COMPLETED"
      ? instances.filter((i) => i.status === "COMPLETED" || i.status === "REJECTED" || i.status === "CANCELLED")
      : instances;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Workflows & State Machine</h1>
            {myTasks.length > 0 && <Badge tone="warning">{myTasks.length} Action Required</Badge>}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Automated multi-step orchestration, SLA monitors, and state transitions.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowStartModal(true)}>
          + Start Workflow
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

      {/* Tabs */}
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("MY_TASKS")}
            className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "MY_TASKS"
                ? "bg-primary text-white"
                : "border border-border bg-surface text-zinc-600 hover:bg-muted"
            }`}
          >
            My Pending Tasks ({myTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "ALL"
                ? "bg-primary text-white"
                : "border border-border bg-surface text-zinc-600 hover:bg-muted"
            }`}
          >
            All Workflows ({instances.length})
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "COMPLETED"
                ? "bg-primary text-white"
                : "border border-border bg-surface text-zinc-600 hover:bg-muted"
            }`}
          >
            Completed
          </button>
        </div>
      </Panel>

      {/* Workflow Instances List */}
      <Panel>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Loading workflows...</div>
        ) : displayedList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-xl">⚡</div>
            <h3 className="text-base font-semibold text-zinc-900">No active workflow tasks</h3>
            <p className="mt-1 text-sm text-zinc-500">No tasks match your current view.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayedList.map((inst) => (
              <div
                key={inst.id}
                className="flex flex-col gap-4 py-4 transition md:flex-row md:items-center md:justify-between"
              >
                <div className="grid gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-950">
                      {inst.workflowDefinition?.name ?? inst.entityType}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">ID: {inst.entityId.slice(0, 8)}</span>
                    <Badge
                      tone={
                        inst.status === "COMPLETED"
                          ? "success"
                          : inst.status === "REJECTED" || inst.status === "CANCELLED"
                          ? "danger"
                          : inst.status === "ESCALATED"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {inst.status}
                    </Badge>
                    {getSlaBadge(inst.slaDeadline)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span>
                      Current Step: <strong className="text-zinc-800 font-medium">{inst.currentStep ?? "Done"}</strong>
                    </span>
                    <span>•</span>
                    <span>Started: {new Date(inst.startedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inst.status !== "COMPLETED" && inst.status !== "REJECTED" && (
                    <Button
                      variant="primary"
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedInstance(inst);
                        setShowActionModal(true);
                      }}
                    >
                      Action Step
                    </Button>
                  )}
                  <Button variant="secondary" className="h-8 text-xs" onClick={() => void handleViewAudit(inst)}>
                    Audit Trail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Start Workflow Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Start New Workflow</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Instantiate an active state machine against a specific business entity.
            </p>

            <form onSubmit={handleStartWorkflow} className="mt-4 space-y-4">
              <Field label="Workflow Definition">
                <select
                  required
                  className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none"
                  value={startDefCode}
                  onChange={(e) => setStartDefCode(e.target.value)}
                >
                  {definitions.map((def) => (
                    <option key={def.code} value={def.code}>
                      {def.name} ({def.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Entity Type">
                <Input
                  required
                  placeholder="e.g. LEAVE_REQUEST, EXPENSE_CLAIM, ONBOARDING"
                  value={startEntityType}
                  onChange={(e) => setStartEntityType(e.target.value)}
                />
              </Field>

              <Field label="Entity ID (UUID)">
                <Input
                  required
                  placeholder="Target entity UUID..."
                  value={startEntityId}
                  onChange={(e) => setStartEntityId(e.target.value)}
                />
              </Field>

              <Field label="Initial Payload (JSON)">
                <textarea
                  rows={3}
                  className="w-full rounded-control border border-border bg-surface p-3 font-mono text-xs text-zinc-950 outline-none"
                  value={startDataJson}
                  onChange={(e) => setStartDataJson(e.target.value)}
                />
              </Field>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowStartModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isStarting || !startEntityId}>
                  {isStarting ? "Starting..." : "Initiate Workflow"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Step Modal */}
      {showActionModal && selectedInstance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Action Workflow Step</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Current Step: <span className="font-semibold text-zinc-900">{selectedInstance.currentStep}</span>
            </p>

            <div className="mt-4 space-y-4">
              <Field label="Action">
                <select
                  className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as WorkflowStepAction)}
                >
                  <option value="APPROVED">Approve & Advance</option>
                  <option value="REJECTED">Reject & Terminate</option>
                  <option value="DELEGATED">Delegate</option>
                  <option value="ESCALATED">Escalate</option>
                </select>
              </Field>

              <Field label="Comments / Notes">
                <Input
                  placeholder="Optional review notes..."
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowActionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdvanceStep} disabled={isActioning}>
                {isActioning ? "Submitting..." : "Submit Action"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Workflow Execution Audit Trail</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Immutable step-by-step history of transitions and decisions.
            </p>

            <div className="mt-4 divide-y divide-border">
              {isLoadingAudit ? (
                <div className="py-8 text-center text-sm text-zinc-500">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">No transition history logged yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900">{log.action}</span>
                      <time className="text-xs text-zinc-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      From: <span className="font-mono">{log.fromStep ?? "None"}</span> → To:{" "}
                      <span className="font-mono">{log.toStep ?? "End"}</span>
                    </p>
                    {log.comment && (
                      <p className="mt-1 rounded bg-muted p-2 text-xs italic text-zinc-700">
                        &quot;{log.comment}&quot;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setShowAuditModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
