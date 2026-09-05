"use client";

import { useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  ShieldCheck,
  Key,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Edit2,
  UserCheck,
  UserX,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Badge, Button, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface Membership {
  id: string;
  userId: string;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | "INVITED";
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  employee?: {
    id: string;
    fullName: string;
    employeeCode: string;
  } | null;
  roles: Array<{
    id: string;
    role: {
      id: string;
      code: string;
      name: string;
      isSystemRole: boolean;
    };
  }>;
}

interface RoleItem {
  id: string;
  code: string;
  name: string;
  isSystemRole: boolean;
  permissions?: Array<{ permission: { code: string } }>;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Role Assignment Modal State
  const [editingMember, setEditingMember] = useState<Membership | null>(null);
  const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
  const [roleModalError, setRoleModalError] = useState<string | null>(null);

  // Status Action State
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  // Queries
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiRequest<Membership[]>("/admin/users"),
    staleTime: 15000
  });

  const rolesQuery = useQuery({
    queryKey: ["tenant-roles"],
    queryFn: () => apiRequest<RoleItem[]>("/tenant/roles"),
    staleTime: 60000
  });

  // Mutations
  const assignRolesMutation = useMutation({
    mutationFn: ({ membershipId, roles }: { membershipId: string; roles: string[] }) =>
      apiRequest(`/admin/users/${membershipId}/roles`, {
        method: "PATCH",
        body: JSON.stringify({ roles })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingMember(null);
      setRoleModalError(null);
    },
    onError: (err: unknown) => {
      setRoleModalError(err instanceof Error ? err.message : "Failed to assign roles.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ membershipId, status }: { membershipId: string; status: string }) =>
      apiRequest(`/admin/users/${membershipId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setStatusActionError(null);
    },
    onError: (err: unknown) => {
      setStatusActionError(err instanceof Error ? err.message : "Failed to update user status.");
    }
  });

  const handleOpenRoleModal = (member: Membership) => {
    setEditingMember(member);
    setSelectedRoleCodes(member.roles.map((r) => r.role.code));
    setRoleModalError(null);
  };

  const handleToggleRole = (code: string) => {
    setSelectedRoleCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (selectedRoleCodes.length === 0) {
      setRoleModalError("A user must have at least one assigned role.");
      return;
    }
    await assignRolesMutation.mutateAsync({
      membershipId: editingMember.id,
      roles: selectedRoleCodes
    });
  };

  const handleToggleStatus = async (member: Membership) => {
    const newStatus = member.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    const confirmMsg =
      newStatus === "DEACTIVATED"
        ? `Are you sure you want to deactivate ${member.user.email}? They will no longer be able to log in.`
        : `Are you sure you want to reactivate ${member.user.email}?`;

    if (!window.confirm(confirmMsg)) return;

    await updateStatusMutation.mutateAsync({
      membershipId: member.id,
      status: newStatus
    });
  };

  const members = usersQuery.data ?? [];

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.user.email.toLowerCase().includes(q) ||
        (m.employee?.fullName && m.employee.fullName.toLowerCase().includes(q)) ||
        (m.employee?.employeeCode && m.employee.employeeCode.toLowerCase().includes(q)) ||
        m.roles.some((r) => r.role.name.toLowerCase().includes(q) || r.role.code.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [members, statusFilter, searchQuery]);

  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const inactiveCount = members.filter((m) => m.status !== "ACTIVE").length;
  const ownerCount = members.filter((m) => m.roles.some((r) => r.role.code === "TENANT_OWNER")).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Users & Access Control
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Manage organization memberships, assign granular RBAC roles, and enforce security policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={"/settings/roles" as Route}
            className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition inline-flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Manage Roles</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {statusActionError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusActionError}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Panel className="p-4">
          <p className="text-xs font-medium text-zinc-500">Total Members</p>
          <p className="text-xl font-bold text-zinc-950 dark:text-white mt-1">{members.length}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-medium text-zinc-500">Active Accounts</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-medium text-zinc-500">Organization Owners</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{ownerCount}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-medium text-zinc-500">Inactive / Suspended</p>
          <p className="text-xl font-bold text-zinc-500 mt-1">{inactiveCount}</p>
        </Panel>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, employee code, or role..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["ALL", "ACTIVE", "DEACTIVATED", "SUSPENDED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === s
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {s === "ALL" ? "All Users" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Panel className="p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {usersQuery.isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            <span>Loading tenant memberships...</span>
          </div>
        ) : usersQuery.isError ? (
          <div className="p-8 text-center text-xs text-red-600">
            Failed to load users. Please check your permissions.
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No matching users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">User / Account</th>
                  <th className="px-5 py-3">Employee Linkage</th>
                  <th className="px-5 py-3">Assigned Roles</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredMembers.map((member) => {
                  const isOwner = member.roles.some((r) => r.role.code === "TENANT_OWNER");
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-white">
                          {member.user.email}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          ID: {member.userId.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {member.employee ? (
                          <div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-200">
                              {member.employee.fullName}
                            </span>
                            <span className="text-zinc-400 text-[11px] ml-1.5 font-mono">
                              ({member.employee.employeeCode})
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">Unlinked Account</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {member.roles.map((r) => (
                            <span
                              key={r.id}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.role.code === "TENANT_OWNER"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                  : r.role.code === "TENANT_ADMIN" || r.role.code === "HR_ADMIN"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              {r.role.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge
                          tone={
                            member.status === "ACTIVE"
                              ? "success"
                              : member.status === "SUSPENDED"
                              ? "warning"
                              : "neutral"
                          }
                        >
                          {member.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenRoleModal(member)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition inline-flex items-center gap-1.5"
                            title="Edit User Roles"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Roles</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(member)}
                            disabled={updateStatusMutation.isPending}
                            className={`p-1.5 rounded-lg transition ${
                              member.status === "ACTIVE"
                                ? "text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                            title={member.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
                          >
                            {member.status === "ACTIVE" ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Role Assignment Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Assign Roles to User
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {editingMember.user.email}
                </p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="w-7 h-7 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {roleModalError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{roleModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoles} className="space-y-4">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {rolesQuery.data?.map((role) => {
                  const isChecked = selectedRoleCodes.includes(role.code);
                  const isOwner = role.code === "TENANT_OWNER";
                  return (
                    <label
                      key={role.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        isChecked
                          ? "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-900 dark:border-white"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRole(role.code)}
                        className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {role.name}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            {role.code}
                          </span>
                        </div>
                        {isOwner && (
                          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                            Full root privileges over organization configuration and security.
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignRolesMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {assignRolesMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Roles"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
