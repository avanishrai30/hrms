"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface GoalCycle {
  id: string;
  name: string;
  status: string;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  weightage: number;
  progressPercent: number;
  status: string;
  dueDate?: string | null;
  cycle?: { name: string } | null;
  employee?: { fullName: string } | null;
  keyResults?: Array<{ id: string }> | null;
}

const createGoalSchema = z.object({
  cycleId: z.string().uuid("Select an active goal cycle."),
  title: z.string().min(2, "Objective title is required.").max(200),
  category: z.enum(["OKR", "KRA", "DEVELOPMENT"]),
  weightage: z.coerce.number().min(0).max(100),
  targetValue: z.coerce.number(),
  dueDate: z.string().optional()
});

type CreateGoalForm = z.infer<typeof createGoalSchema>;

function formatDate(value?: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function badgeTone(status: string) {
  if (status === "COMPLETED" || status === "APPROVED") return "success";
  if (status === "REJECTED" || status === "CANCELLED") return "danger";
  return "warning";
}

export default function GoalsManagementPage() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const goalsQuery = useQuery({
    queryKey: ["performance", "goals"],
    queryFn: () => apiRequest<Goal[]>("/performance/goals")
  });
  const cyclesQuery = useQuery({
    queryKey: ["performance", "goal-cycles"],
    queryFn: () => apiRequest<GoalCycle[]>("/performance/goal-cycles")
  });

  const activeCycles = (cyclesQuery.data ?? []).filter((cycle) => cycle.status === "ACTIVE" || cycle.status === "DRAFT");
  const form = useForm<CreateGoalForm>({
    resolver: zodResolver(createGoalSchema),
    values: {
      cycleId: activeCycles[0]?.id ?? "",
      title: "",
      category: "OKR",
      weightage: 10,
      targetValue: 100,
      dueDate: ""
    }
  });

  const createGoal = useMutation({
    mutationFn: (input: CreateGoalForm) =>
      apiRequest<Goal>("/performance/goals", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          dueDate: input.dueDate || undefined,
          achievedValue: 0
        })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["performance", "goals"] });
      setShowCreateModal(false);
      form.reset();
    }
  });

  const goals = goalsQuery.data ?? [];
  const filteredGoals = goals.filter((goal) => {
    const title = goal.title.toLowerCase();
    const owner = goal.employee?.fullName?.toLowerCase() ?? "";
    const query = searchQuery.toLowerCase();
    if (filterCategory !== "ALL" && goal.category !== filterCategory) return false;
    if (filterStatus !== "ALL" && goal.status !== filterStatus) return false;
    if (query && !title.includes(query) && !owner.includes(query)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Goals and OKRs</h1>
          <p className="text-sm text-zinc-500">Track measurable objectives, key results, KRAs, and development goals.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)} disabled={activeCycles.length === 0}>
          Create Objective
        </Button>
      </div>

      {goalsQuery.isError || cyclesQuery.isError ? (
        <Panel className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Goals data is unavailable.</p>
          <p className="mt-1 text-xs text-amber-800">No fallback goals are being shown while the API is unavailable.</p>
        </Panel>
      ) : null}

      {activeCycles.length === 0 && !cyclesQuery.isLoading ? (
        <Panel className="border-dashed">
          <p className="text-sm font-semibold text-zinc-900">No draft or active goal cycle is available.</p>
          <p className="mt-1 text-xs text-zinc-500">Create a tenant goal cycle before adding objectives.</p>
        </Panel>
      ) : null}

      <Panel className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <Input placeholder="Search goals or owners..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Category:</span>
            <select
              className="rounded-control border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="OKR">OKR</option>
              <option value="KRA">KRA</option>
              <option value="DEVELOPMENT">Development</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Status:</span>
            <select
              className="rounded-control border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </Panel>

      {goalsQuery.isLoading ? (
        <Panel className="p-6 text-sm text-zinc-500">Loading goals...</Panel>
      ) : filteredGoals.length === 0 ? (
        <Panel className="border-dashed p-6 text-sm text-zinc-500">No goals match the current filters.</Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGoals.map((goal) => (
            <Panel key={goal.id} className="flex flex-col justify-between p-5 transition hover:border-indigo-200">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={goal.category === "DEVELOPMENT" ? "neutral" : "warning"}>{goal.category}</Badge>
                    <span className="text-xs font-semibold text-zinc-400">Weight: {goal.weightage}%</span>
                  </div>
                  <Badge tone={badgeTone(goal.status)}>{goal.status.replace(/_/g, " ")}</Badge>
                </div>

                <Link href={`/performance/goals/${goal.id}` as Route} className="mt-2 block group">
                  <h3 className="text-base font-semibold text-zinc-900 transition group-hover:text-indigo-600">{goal.title}</h3>
                </Link>
                <p className="mt-1 text-xs text-zinc-500">
                  Owner: <strong className="text-zinc-700">{goal.employee?.fullName ?? "Unassigned"}</strong> / {goal.cycle?.name ?? "No cycle"}
                </p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-500">Achievement</span>
                    <span className="text-indigo-600">{goal.progressPercent}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.progressPercent >= 100 ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                <span>{goal.keyResults?.length ?? 0} Key Results</span>
                <span>Due: {formatDate(goal.dueDate)}</span>
                <Link href={`/performance/goals/${goal.id}` as Route}>
                  <Button variant="secondary">View</Button>
                </Link>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-lg rounded-panel border border-zinc-200 bg-white p-6 shadow-2xl"
            onSubmit={form.handleSubmit((input) => createGoal.mutate(input))}
          >
            <h2 className="text-lg font-bold text-zinc-900">Create Goal</h2>
            <p className="mt-1 text-xs text-zinc-500">Define an objective in an existing tenant goal cycle.</p>
            <div className="mt-4 space-y-3">
              <Field label="Goal Cycle" error={form.formState.errors.cycleId?.message}>
                <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...form.register("cycleId")}>
                  <option value="">Select cycle</option>
                  {activeCycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Objective Title" error={form.formState.errors.title?.message}>
                <Input placeholder="Objective title" {...form.register("title")} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Category" error={form.formState.errors.category?.message}>
                  <select className="h-11 rounded-control border border-border bg-surface px-3 text-sm" {...form.register("category")}>
                    <option value="OKR">OKR</option>
                    <option value="KRA">KRA</option>
                    <option value="DEVELOPMENT">Development</option>
                  </select>
                </Field>
                <Field label="Weightage" error={form.formState.errors.weightage?.message}>
                  <Input type="number" min="0" max="100" {...form.register("weightage")} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Target Value" error={form.formState.errors.targetValue?.message}>
                  <Input type="number" {...form.register("targetValue")} />
                </Field>
                <Field label="Due Date" error={form.formState.errors.dueDate?.message}>
                  <Input type="date" {...form.register("dueDate")} />
                </Field>
              </div>
              {createGoal.isError ? <p className="text-sm text-danger">{createGoal.error.message}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createGoal.isPending}>
                {createGoal.isPending ? "Saving..." : "Save Objective"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
