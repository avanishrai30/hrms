"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function AutomationBuilderPage() {
  const [workflowName, setWorkflowName] = useState("New Custom Workflow");
  const [triggerType, setTriggerType] = useState("EMPLOYEE_CREATED");
  const [conditions, setConditions] = useState([
    { field: "department", operator: "EQUALS", value: "Engineering" }
  ]);
  const [actions, setActions] = useState([
    { type: "SEND_EMAIL", label: "Send Onboarding Email to Candidate" },
    { type: "CREATE_TICKET", label: "Create Laptop Provisioning Ticket in Helpdesk" }
  ]);

  const addCondition = () => {
    setConditions([...conditions, { field: "role", operator: "EQUALS", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addAction = (type: string, label: string) => {
    setActions([...actions, { type, label }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/automation" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Workflows
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛠️ No-Code Workflow Automation Builder</h1>
          <p className="text-sm text-slate-600">
            Define triggers, multi-field conditional evaluations, and sequential automated actions across systems.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/automation" as Route}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button variant="primary">💾 Save & Activate Workflow</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Canvas */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Info */}
          <Panel className="space-y-4">
            <Field label="Workflow Name">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </Field>
          </Panel>

          {/* Step 1: Trigger */}
          <Panel className="border-l-4 border-l-blue-500 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  1
                </span>
                <h3 className="font-bold text-slate-900">TRIGGER: When this event happens...</h3>
              </div>
              <Badge tone="neutral">EVENT TRIGGER</Badge>
            </div>

            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none font-medium"
            >
              <option value="EMPLOYEE_CREATED">👤 Employee Created (New Hire)</option>
              <option value="ATTENDANCE_MARKED">⏱️ Attendance Marked / Shift Check-in</option>
              <option value="LEAVE_APPROVED">🌴 Leave Approved</option>
              <option value="PAYROLL_PROCESSED">💰 Payroll Run Processed</option>
              <option value="EXPENSE_SUBMITTED">🧾 Expense Claim Submitted</option>
              <option value="CANDIDATE_HIRED">🤝 Candidate Marked Hired</option>
              <option value="ASSET_ASSIGNED">💻 Asset Assigned to Employee</option>
              <option value="TICKET_CLOSED">🎫 Helpdesk Ticket Closed</option>
              <option value="VISITOR_CHECKED_IN">🛂 Visitor Checked In at Gate</option>
            </select>
          </Panel>

          {/* Step 2: Conditions */}
          <Panel className="border-l-4 border-l-amber-500 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  2
                </span>
                <h3 className="font-bold text-slate-900">CONDITIONS: Only execute if all filters match...</h3>
              </div>
              <Button variant="secondary" onClick={addCondition}>
                + Add Condition
              </Button>
            </div>

            <div className="space-y-3">
              {conditions.map((cond, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={cond.field}
                    placeholder="Field (e.g. department)"
                    className="h-9 rounded border border-slate-300 px-2 text-sm text-slate-800"
                    onChange={(e) => {
                      setConditions(conditions.map((c, i) => i === idx ? { ...c, field: e.target.value } : c));
                    }}
                  />
                  <select
                    value={cond.operator}
                    className="h-9 rounded border border-slate-300 px-2 text-sm text-slate-800"
                    onChange={(e) => {
                      setConditions(conditions.map((c, i) => i === idx ? { ...c, operator: e.target.value } : c));
                    }}
                  >
                    <option value="EQUALS">Equals (==)</option>
                    <option value="NOT_EQUALS">Not Equals (!=)</option>
                    <option value="GREATER_THAN">Greater Than (&gt;)</option>
                    <option value="LESS_THAN">Less Than (&lt;)</option>
                    <option value="CONTAINS">Contains</option>
                    <option value="DEPARTMENT_BASED">Department Based</option>
                    <option value="ROLE_BASED">Role Based</option>
                  </select>
                  <input
                    type="text"
                    value={cond.value as string}
                    placeholder="Value (e.g. Engineering)"
                    className="h-9 flex-1 rounded border border-slate-300 px-2 text-sm text-slate-800"
                    onChange={(e) => {
                      setConditions(conditions.map((c, i) => i === idx ? { ...c, value: e.target.value } : c));
                    }}
                  />
                  <button
                    onClick={() => removeCondition(idx)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          {/* Step 3: Actions */}
          <Panel className="border-l-4 border-l-emerald-500 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  3
                </span>
                <h3 className="font-bold text-slate-900">ACTIONS: Run the following steps sequentially...</h3>
              </div>
            </div>

            <div className="space-y-3">
              {actions.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-800">Step {idx + 1}:</span>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{act.label}</span>
                      <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-mono text-emerald-800">
                        {act.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAction(idx)}
                    className="text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Action Palette */}
        <div className="space-y-4">
          <Panel className="space-y-4">
            <h3 className="font-bold text-slate-900">⚡ Available Actions Palette</h3>
            <p className="text-xs text-slate-600">Click to append action to sequence:</p>

            <div className="space-y-2">
              <button
                onClick={() => addAction("SEND_EMAIL", "Dispatch Transactional Email")}
                className="w-full text-left rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="text-xs font-bold text-slate-800">📧 Send Email</div>
                <div className="text-[11px] text-slate-500">Custom HTML template with merged tags</div>
              </button>

              <button
                onClick={() => addAction("SEND_WHATSAPP", "Send WhatsApp Business Alert")}
                className="w-full text-left rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="text-xs font-bold text-slate-800">💬 Send WhatsApp</div>
                <div className="text-[11px] text-slate-500">Instant notification to phone number</div>
              </button>

              <button
                onClick={() => addAction("CREATE_TICKET", "Raise ITSM Helpdesk Ticket")}
                className="w-full text-left rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="text-xs font-bold text-slate-800">🎫 Create Ticket</div>
                <div className="text-[11px] text-slate-500">Auto-assign to IT or Admin queue</div>
              </button>

              <button
                onClick={() => addAction("ASSIGN_ASSET", "Allocate Hardware Asset")}
                className="w-full text-left rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="text-xs font-bold text-slate-800">💻 Assign Asset</div>
                <div className="text-[11px] text-slate-500">Bind laptop/monitor to employee ID</div>
              </button>

              <button
                onClick={() => addAction("CALL_WEBHOOK", "Fire Outgoing Webhook")}
                className="w-full text-left rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 transition"
              >
                <div className="text-xs font-bold text-slate-800">🌐 Call External Webhook / API</div>
                <div className="text-[11px] text-slate-500">POST JSON payload to 3rd party URL</div>
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
