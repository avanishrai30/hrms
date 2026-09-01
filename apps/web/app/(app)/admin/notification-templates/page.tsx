"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { NotificationChannel, NotificationTemplateView } from "@vc-wms/shared-types";

export default function NotificationTemplatesAdminPage() {
  const [templates, setTemplates] = useState<NotificationTemplateView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");

  // Create / Edit Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateView | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formChannel, setFormChannel] = useState<NotificationChannel>("EMAIL");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formVariables, setFormVariables] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Test Send Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testTemplate, setTestTemplate] = useState<NotificationTemplateView | null>(null);
  const [testRecipientUserId, setTestRecipientUserId] = useState("");
  const [testVariablesJson, setTestVariablesJson] = useState<string>("{\n  \"name\": \"Jane Doe\",\n  \"amount\": \"₹54,000\"\n}");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<NotificationTemplateView[]>("/notifications/templates");
      setTemplates(res ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load notification templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormCode("");
    setFormName("");
    setFormChannel("EMAIL");
    setFormSubject("");
    setFormBody("Dear {{name}}, your request for {{item}} has been processed.");
    setFormVariables("name, item");
    setFormIsActive(true);
    setShowEditor(true);
  };

  const handleOpenEdit = (t: NotificationTemplateView) => {
    setEditingTemplate(t);
    setFormCode(t.code);
    setFormName(t.name);
    setFormChannel(t.channel);
    setFormSubject(t.subject ?? "");
    setFormBody(t.bodyTemplate);
    setFormVariables(t.variables ? t.variables.join(", ") : "");
    setFormIsActive(t.isActive);
    setShowEditor(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      const vars = formVariables
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingTemplate) {
        await apiRequest(`/notifications/templates/${editingTemplate.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: formName,
            subject: formSubject || undefined,
            bodyTemplate: formBody,
            variables: vars,
            isActive: formIsActive
          })
        });
        setSuccessMessage(`Template "${formName}" updated successfully.`);
      } else {
        await apiRequest("/notifications/templates", {
          method: "POST",
          body: JSON.stringify({
            code: formCode,
            name: formName,
            channel: formChannel,
            subject: formSubject || undefined,
            bodyTemplate: formBody,
            variables: vars,
            isActive: formIsActive
          })
        });
        setSuccessMessage(`Template "${formName}" created successfully.`);
      }

      setShowEditor(false);
      await loadTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenTestSend = (t: NotificationTemplateView) => {
    setTestTemplate(t);
    const sampleVars: Record<string, string> = {};
    for (const v of t.variables || []) {
      sampleVars[v] = `Sample ${v}`;
    }
    setTestVariablesJson(JSON.stringify(sampleVars, null, 2));
    setShowTestModal(true);
  };

  const handleSendTest = async () => {
    if (!testTemplate || !testRecipientUserId) return;
    try {
      setIsSendingTest(true);
      setError(null);
      let parsedData: Record<string, unknown> = {};
      try {
        parsedData = JSON.parse(testVariablesJson);
      } catch {
        throw new Error("Invalid JSON in test variables.");
      }

      await apiRequest("/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          recipientUserId: testRecipientUserId,
          channel: testTemplate.channel,
          templateId: testTemplate.id,
          data: parsedData
        })
      });

      setSuccessMessage(`Test notification sent successfully to user ${testRecipientUserId}.`);
      setShowTestModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send test notification.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const livePreviewBody = useMemo(() => {
    let preview = formBody;
    const matches = formBody.match(/\{\{([^{}]+)\}\}/g) ?? [];
    for (const match of matches) {
      const varName = match.replace(/[{}]/g, "").trim();
      preview = preview.replace(match, `[${varName}]`);
    }
    return preview;
  }, [formBody]);

  const filteredTemplates = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase());
    const matchChannel = selectedChannel === "ALL" || t.channel === selectedChannel;
    return matchSearch && matchChannel;
  });

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Notification Templates</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Design, configure dynamic tokens, and test transactional multi-channel message templates.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Create Template
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

      {/* Filter Controls */}
      <Panel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "EMAIL", "SMS", "WHATSAPP", "PUSH", "IN_APP"].map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`rounded-control px-3 py-1.5 text-xs font-medium transition ${
                selectedChannel === ch
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-zinc-600 hover:bg-muted"
              }`}
            >
              {ch.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {/* Templates Table / Grid */}
      <Panel>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            No notification templates found. Click &quot;Create Template&quot; to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex flex-col gap-4 py-4 transition md:flex-row md:items-start md:justify-between"
              >
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-600 uppercase">
                      [{tmpl.channel}]
                    </span>
                    <span className="font-semibold text-zinc-950">{tmpl.name}</span>
                    <span className="font-mono text-xs text-zinc-500">({tmpl.code})</span>
                    <Badge tone={tmpl.isActive ? "success" : "neutral"}>
                      {tmpl.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {tmpl.subject && (
                    <p className="text-xs font-medium text-zinc-800">
                      Subject: <span className="font-normal text-zinc-600">{tmpl.subject}</span>
                    </p>
                  )}
                  <p className="text-xs text-zinc-600 whitespace-pre-wrap line-clamp-2">{tmpl.bodyTemplate}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">Variables:</span>
                    {tmpl.variables && tmpl.variables.length > 0 ? (
                      tmpl.variables.map((v) => (
                        <span
                          key={v}
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-zinc-700"
                        >
                          {"{{"}
                          {v}
                          {"}}"}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">None</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <Button variant="secondary" className="h-8 text-xs" onClick={() => handleOpenTestSend(tmpl)}>
                    Test Send
                  </Button>
                  <Button variant="ghost" className="h-8 text-xs" onClick={() => handleOpenEdit(tmpl)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">
              {editingTemplate ? `Edit Template: ${editingTemplate.name}` : "Create Notification Template"}
            </h2>

            <form onSubmit={handleSaveTemplate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Template Code">
                  <Input
                    required
                    disabled={Boolean(editingTemplate)}
                    placeholder="e.g. LEAVE_APPROVED"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  />
                </Field>
                <Field label="Template Name">
                  <Input
                    required
                    placeholder="e.g. Leave Request Approved"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Channel">
                  <select
                    disabled={Boolean(editingTemplate)}
                    className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none"
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as NotificationChannel)}
                  >
                    <option value="EMAIL">EMAIL</option>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WHATSAPP</option>
                    <option value="PUSH">PUSH</option>
                    <option value="IN_APP">IN_APP</option>
                  </select>
                </Field>
                <Field label="Subject (for Email / Push)">
                  <Input
                    placeholder="e.g. Your Leave Request Has Been Approved"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Variables (comma-separated)">
                <Input
                  placeholder="e.g. employeeName, startDate, endDate, approverName"
                  value={formVariables}
                  onChange={(e) => setFormVariables(e.target.value)}
                />
              </Field>

              <Field label="Body Template">
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-950 font-mono outline-none focus:border-primary"
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                />
              </Field>

              {/* Live Preview Box */}
              <div className="rounded-control border border-border bg-muted/40 p-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Live Preview</p>
                <p className="mt-1 text-sm text-zinc-800 whitespace-pre-wrap">{livePreviewBody}</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tmplIsActive"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                <label htmlFor="tmplIsActive" className="text-sm font-medium text-zinc-800">
                  Active (available for workflow dispatch)
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Send Modal */}
      {showTestModal && testTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Test Send Template: {testTemplate.name}</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Dispatch a single test message via {testTemplate.channel} with mock payload.
            </p>

            <div className="mt-4 space-y-4">
              <Field label="Recipient User ID (UUID)">
                <Input
                  required
                  placeholder="Enter User UUID..."
                  value={testRecipientUserId}
                  onChange={(e) => setTestRecipientUserId(e.target.value)}
                />
              </Field>

              <Field label="Variable Payload (JSON)">
                <textarea
                  rows={4}
                  className="w-full rounded-control border border-border bg-surface p-3 font-mono text-xs text-zinc-950 outline-none"
                  value={testVariablesJson}
                  onChange={(e) => setTestVariablesJson(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowTestModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSendTest} disabled={isSendingTest || !testRecipientUserId}>
                {isSendingTest ? "Sending..." : "Dispatch Test"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
