"use client";

import { useEffect, useState } from "react";
import { Badge, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { getOfflineData, saveOfflineData } from "../../../lib/offline-storage";
import type { DirectoryEmployeeView } from "@vc-wms/shared-types";

export default function OrganizationDirectoryPage() {
  const [employees, setEmployees] = useState<DirectoryEmployeeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        const res = await apiRequest<DirectoryEmployeeView[]>("/directory");
        setEmployees(res);
        saveOfflineData("directory_list", res);
      } catch (err: unknown) {
        const cached = getOfflineData<DirectoryEmployeeView[]>("directory_list");
        if (cached) {
          setEmployees(cached);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load employee directory");
        }
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  const filtered = employees.filter((e) => {
    const matchesDept = selectedDept === "ALL" || e.department === selectedDept;
    const matchesSearch =
      !search ||
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Organization Directory</h1>
        <p className="text-sm text-zinc-500">
          Search colleagues, find team members, and explore reporting structures
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Panel className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search by name, role, email, code..."
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedDept("ALL")}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
              selectedDept === "ALL"
                ? "bg-primary text-white"
                : "bg-surface border border-border text-zinc-700 hover:bg-muted"
            }`}
          >
            All Departments
          </button>
          {departments.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
                selectedDept === d
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-zinc-700 hover:bg-muted"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </Panel>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-muted animate-pulse rounded-panel" />
          <div className="h-44 bg-muted animate-pulse rounded-panel" />
          <div className="h-44 bg-muted animate-pulse rounded-panel" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((emp) => (
            <Panel key={emp.id} className="p-6 space-y-4 hover:border-primary/50 transition">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-bold">
                  {emp.fullName.charAt(0)}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h4 className="font-bold text-zinc-950 text-base truncate">{emp.fullName}</h4>
                  <p className="text-xs font-medium text-primary truncate">{emp.designation}</p>
                  <p className="text-xs text-zinc-500 truncate">{emp.department}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 border-t border-border/50 pt-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Employee Code</span>
                  <span className="font-mono font-medium text-zinc-900">{emp.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email</span>
                  <span className="text-zinc-900 truncate max-w-[180px]">{emp.email}</span>
                </div>
                {emp.phone && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Phone</span>
                    <span>{emp.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reports To</span>
                  <span className="font-medium text-zinc-900">{emp.managerName || "Direct Leadership"}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border/40 text-xs">
                <Badge tone="success">{emp.status}</Badge>
                <span className="text-zinc-400">
                  Joined {new Date(emp.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel className="p-12 text-center space-y-3">
          <span className="text-4xl">👥</span>
          <h3 className="text-base font-semibold text-zinc-900">No Colleagues Found</h3>
          <p className="text-sm text-zinc-500">Try searching with a different name or department filter.</p>
        </Panel>
      )}
    </div>
  );
}
