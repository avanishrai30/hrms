"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { BusinessUnitView } from "@vc-wms/shared-types";

interface ExtendedBusinessUnitView extends BusinessUnitView {
  parent?: BusinessUnitView | null;
  _count?: {
    regions: number;
    employees: number;
    children: number;
  };
}

export default function BusinessUnitsPage() {
  const [businessUnits, setBusinessUnits] = useState<ExtendedBusinessUnitView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingBU, setEditingBU] = useState<ExtendedBusinessUnitView | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal
  const [deletingBU, setDeletingBU] = useState<ExtendedBusinessUnitView | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<ExtendedBusinessUnitView[]>("/organization/business-units");
      setBusinessUnits(res ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load business units.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBU(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormParentId("");
    setFormIsActive(true);
    setShowEditor(true);
  };

  const handleOpenEdit = (bu: ExtendedBusinessUnitView) => {
    setEditingBU(bu);
    setFormName(bu.name);
    setFormCode(bu.code);
    setFormDescription(bu.description ?? "");
    setFormParentId(bu.parentId ?? "");
    setFormIsActive(bu.isActive);
    setShowEditor(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);

      if (editingBU) {
        await apiRequest(`/organization/business-units/${editingBU.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: formName,
            description: formDescription || null,
            parentId: formParentId || null,
            isActive: formIsActive
          })
        });
        setSuccessMessage(`Business unit "${formName}" updated successfully.`);
      } else {
        await apiRequest("/organization/business-units", {
          method: "POST",
          body: JSON.stringify({
            name: formName,
            code: formCode,
            description: formDescription || null,
            parentId: formParentId || null,
            isActive: formIsActive
          })
        });
        setSuccessMessage(`Business unit "${formName}" created successfully.`);
      }

      setShowEditor(false);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save business unit.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBU) return;
    try {
      setIsDeleting(true);
      setError(null);
      await apiRequest(`/organization/business-units/${deletingBU.id}`, {
        method: "DELETE"
      });
      setSuccessMessage(`Business unit "${deletingBU.name}" deleted.`);
      setDeletingBU(null);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete business unit.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBUs = businessUnits.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Business Units Directory</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Define corporate divisions, autonomous operating entities, and hierarchical parent-child relationships.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + New Business Unit
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

      {/* Filter Bar */}
      <Panel className="flex items-center justify-between">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search business units by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-zinc-500 font-medium">{filteredBUs.length} Units Found</span>
      </Panel>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-sm text-zinc-500">Loading business units...</div>
        ) : filteredBUs.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-xl">🏢</div>
            <h3 className="text-base font-semibold text-zinc-900">No business units found</h3>
            <p className="mt-1 text-sm text-zinc-500">Click &quot;New Business Unit&quot; to establish your enterprise structure.</p>
          </div>
        ) : (
          filteredBUs.map((bu) => (
            <Panel key={bu.id} className="flex flex-col justify-between p-5 space-y-4 hover:border-primary/50 transition">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    {bu.code}
                  </span>
                  <Badge tone={bu.isActive ? "success" : "neutral"}>
                    {bu.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <h3 className="mt-2 text-lg font-bold text-zinc-950">{bu.name}</h3>
                {bu.description && <p className="mt-1 text-xs text-zinc-600 line-clamp-2">{bu.description}</p>}

                {bu.parent && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Parent Unit: <strong className="text-zinc-800 font-medium">{bu.parent.name}</strong>
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="rounded bg-muted/60 p-2">
                    <p className="font-bold text-zinc-900">{bu._count?.regions ?? 0}</p>
                    <p className="text-[10px] text-zinc-500">Regions</p>
                  </div>
                  <div className="rounded bg-muted/60 p-2">
                    <p className="font-bold text-zinc-900">{bu._count?.children ?? 0}</p>
                    <p className="text-[10px] text-zinc-500">Sub-BUs</p>
                  </div>
                  <div className="rounded bg-muted/60 p-2">
                    <p className="font-bold text-zinc-900">{bu._count?.employees ?? 0}</p>
                    <p className="text-[10px] text-zinc-500">Employees</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" className="h-8 text-xs" onClick={() => handleOpenEdit(bu)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => setDeletingBU(bu)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Panel>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">
              {editingBU ? `Edit Business Unit: ${editingBU.name}` : "Create Business Unit"}
            </h2>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <Field label="Business Unit Name">
                <Input
                  required
                  placeholder="e.g. Agronomy Operations"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </Field>

              <Field label="Unit Code">
                <Input
                  required
                  disabled={Boolean(editingBU)}
                  placeholder="e.g. AGRI_OPS"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                />
              </Field>

              <Field label="Parent Business Unit (Optional Hierarchy)">
                <select
                  className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none"
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                >
                  <option value="">-- None (Top Level Root Unit) --</option>
                  {businessUnits
                    .filter((b) => !editingBU || b.id !== editingBU.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-950 outline-none focus:border-primary"
                  placeholder="Operational scope or mission..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </Field>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="buIsActive"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                <label htmlFor="buIsActive" className="text-sm font-medium text-zinc-800">
                  Active Status
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingBU ? "Update Unit" : "Create Unit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBU && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Delete Business Unit</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Are you sure you want to delete <strong className="text-zinc-950">&quot;{deletingBU.name}&quot;</strong>? Any child sub-units or regions will be unlinked.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingBU(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
