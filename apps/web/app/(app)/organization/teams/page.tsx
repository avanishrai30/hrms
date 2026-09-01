"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { TeamView } from "@vc-wms/shared-types";

interface ExtendedTeamView extends TeamView {
  department?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    employees: number;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<ExtendedTeamView[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");

  // Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ExtendedTeamView | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDepartmentId, setFormDepartmentId] = useState("");
  const [formLeadUserId, setFormLeadUserId] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal
  const [deletingTeam, setDeletingTeam] = useState<ExtendedTeamView | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [teamsRes, deptRes] = await Promise.all([
        apiRequest<ExtendedTeamView[]>("/organization/teams"),
        apiRequest<Array<{ id: string; name: string; code: string }>>("/departments").catch(() => [])
      ]);
      setTeams(teamsRes ?? []);
      setDepartments(deptRes ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load teams data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormDepartmentId(departments[0]?.id ?? "");
    setFormLeadUserId("");
    setFormIsActive(true);
    setShowEditor(true);
  };

  const handleOpenEdit = (t: ExtendedTeamView) => {
    setEditingTeam(t);
    setFormName(t.name);
    setFormCode(t.code);
    setFormDescription(t.description ?? "");
    setFormDepartmentId(t.departmentId ?? "");
    setFormLeadUserId(t.leadUserId ?? "");
    setFormIsActive(t.isActive);
    setShowEditor(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);

      if (editingTeam) {
        await apiRequest(`/organization/teams/${editingTeam.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: formName,
            description: formDescription || null,
            departmentId: formDepartmentId || null,
            leadUserId: formLeadUserId || null,
            isActive: formIsActive
          })
        });
        setSuccessMessage(`Team "${formName}" updated successfully.`);
      } else {
        await apiRequest("/organization/teams", {
          method: "POST",
          body: JSON.stringify({
            name: formName,
            code: formCode,
            description: formDescription || null,
            departmentId: formDepartmentId || null,
            leadUserId: formLeadUserId || null,
            isActive: formIsActive
          })
        });
        setSuccessMessage(`Team "${formName}" created successfully.`);
      }

      setShowEditor(false);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save team.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTeam) return;
    try {
      setIsDeleting(true);
      setError(null);
      await apiRequest(`/organization/teams/${deletingTeam.id}`, {
        method: "DELETE"
      });
      setSuccessMessage(`Team "${deletingTeam.name}" deleted.`);
      setDeletingTeam(null);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete team.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTeams = teams.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = departmentFilter === "ALL" || t.departmentId === departmentFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Teams & Squads</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage functional working groups, squad assignments, and team leadership.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Create Team
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

      {/* Filters Bar */}
      <Panel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-10 rounded-control border border-border bg-surface px-3 text-xs font-medium text-zinc-700 outline-none"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">{filteredTeams.length} Teams</span>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search teams by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-sm text-zinc-500">Loading teams...</div>
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-xl">⚡</div>
            <h3 className="text-base font-semibold text-zinc-900">No teams found</h3>
            <p className="mt-1 text-sm text-zinc-500">Click &quot;Create Team&quot; to establish functional squads.</p>
          </div>
        ) : (
          filteredTeams.map((team) => (
            <Panel key={team.id} className="flex flex-col justify-between p-5 space-y-4 hover:border-primary/50 transition">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    {team.code}
                  </span>
                  <Badge tone={team.isActive ? "success" : "neutral"}>
                    {team.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <h3 className="mt-2 text-lg font-bold text-zinc-950">{team.name}</h3>
                {team.description && <p className="mt-1 text-xs text-zinc-600 line-clamp-2">{team.description}</p>}

                <div className="mt-3 space-y-1 text-xs text-zinc-600">
                  <p>
                    Department: <strong className="text-zinc-900">{team.department?.name ?? "General"}</strong>
                  </p>
                  {team.leadUserId && (
                    <p className="font-mono text-[11px] text-zinc-400">Lead ID: {team.leadUserId.slice(0, 8)}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="rounded bg-muted px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  {team._count?.employees ?? 0} Members
                </span>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-8 text-xs" onClick={() => handleOpenEdit(team)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => setDeletingTeam(team)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Panel>
          ))
        )}
      </div>

      {/* Team Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">
              {editingTeam ? `Edit Team: ${editingTeam.name}` : "Create Functional Team"}
            </h2>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <Field label="Team Name">
                <Input
                  required
                  placeholder="e.g. Agronomy Research Alpha"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </Field>

              <Field label="Team Code">
                <Input
                  required
                  disabled={Boolean(editingTeam)}
                  placeholder="e.g. AGRI_RES_A"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                />
              </Field>

              <Field label="Department">
                <select
                  className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none"
                  value={formDepartmentId}
                  onChange={(e) => setFormDepartmentId(e.target.value)}
                >
                  <option value="">-- No Specific Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Team Lead User ID (UUID)">
                <Input
                  placeholder="Enter User UUID..."
                  value={formLeadUserId}
                  onChange={(e) => setFormLeadUserId(e.target.value)}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-950 outline-none focus:border-primary"
                  placeholder="Operational responsibilities..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </Field>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="teamIsActive"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                <label htmlFor="teamIsActive" className="text-sm font-medium text-zinc-800">
                  Active Status
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingTeam ? "Update Team" : "Create Team"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Delete Team</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Are you sure you want to delete <strong className="text-zinc-950">&quot;{deletingTeam.name}&quot;</strong>? Any assigned employees will be unlinked.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingTeam(null)}>
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
