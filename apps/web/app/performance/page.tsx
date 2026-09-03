"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";
import { apiRequest } from "../../lib/api";

interface GoalCycle {
  id: string;
  name: string;
  status: string;
  endDate: string;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  progressPercent: number;
  status: string;
  employee?: { fullName: string; employeeCode: string } | null;
}

interface PerformanceReview {
  id: string;
  status: string;
  finalScore?: number | null;
  ratingLabel?: string | null;
  employee?: {
    fullName: string;
    employeeCode: string;
    department?: { name: string } | null;
    designation?: { name: string } | null;
  } | null;
}

interface Feedback {
  id: string;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function daysUntil(value?: string) {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function PerformanceOverviewPage() {
  const goalCycles = useQuery({
    queryKey: ["performance", "goal-cycles"],
    queryFn: () => apiRequest<GoalCycle[]>("/performance/goal-cycles")
  });
  const goals = useQuery({
    queryKey: ["performance", "goals"],
    queryFn: () => apiRequest<Goal[]>("/performance/goals")
  });
  const reviews = useQuery({
    queryKey: ["performance", "reviews"],
    queryFn: () => apiRequest<PerformanceReview[]>("/performance/reviews")
  });
  const feedback = useQuery({
    queryKey: ["performance", "feedback"],
    queryFn: () => apiRequest<Feedback[]>("/performance/feedback")
  });

  const allGoals = goals.data ?? [];
  const allReviews = reviews.data ?? [];
  const activeCycle = (goalCycles.data ?? []).find((cycle) => cycle.status === "ACTIVE");
  const activeReviews = allReviews.filter((review) => !["FINALIZED", "CLOSED"].includes(review.status));
  const finalizedReviews = allReviews.filter((review) => review.status === "FINALIZED");
  const isLoading = goalCycles.isLoading || goals.isLoading || reviews.isLoading || feedback.isLoading;
  const hasError = goalCycles.isError || goals.isError || reviews.isError || feedback.isError;
  const companyGoalProgress = average(allGoals.map((goal) => goal.progressPercent));
  const calibratedPercent = allReviews.length > 0 ? Math.round((finalizedReviews.length / allReviews.length) * 100) : 0;
  const daysRemaining = activeCycle ? daysUntil(activeCycle.endDate) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Performance Management</h1>
          <p className="text-sm text-zinc-500">Goals, OKRs, review cycles, feedback, competencies, and development planning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={"/performance/feedback" as Route}>
            <Button variant="secondary">Give Feedback</Button>
          </Link>
          <Link href={"/performance/goals" as Route}>
            <Button variant="primary">Manage Goals</Button>
          </Link>
        </div>
      </div>

      {hasError ? (
        <Panel className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Performance data is unavailable.</p>
          <p className="mt-1 text-xs text-amber-800">No fallback metrics are being displayed while the API is unavailable.</p>
        </Panel>
      ) : null}

      <Panel className="border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-sky-50/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge tone={activeCycle ? "warning" : "neutral"}>{activeCycle ? "Active Cycle" : "No Active Cycle"}</Badge>
              {daysRemaining !== null ? <span className="text-xs font-semibold text-zinc-500">{daysRemaining} days left</span> : null}
            </div>
            <h2 className="text-lg font-bold text-zinc-900">{activeCycle?.name ?? "Create or activate a goal cycle to begin tracking OKRs."}</h2>
            <p className="text-sm text-zinc-600">Cycle completion is calculated from the goals returned by the tenant API.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-medium text-zinc-500">Goal Progress</p>
              <p className="text-2xl font-black text-indigo-600">{isLoading ? "..." : `${companyGoalProgress}%`}</p>
            </div>
            <Link href={"/performance/reviews" as Route}>
              <Button variant="primary">Review Hub</Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${companyGoalProgress}%` }} />
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Goal Progress</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{isLoading ? "..." : `${companyGoalProgress}%`}</p>
          <p className="mt-1 text-xs text-zinc-400">Across {allGoals.length} goals</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Active Reviews</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{isLoading ? "..." : activeReviews.length}</p>
          <p className="mt-1 text-xs text-zinc-400">{calibratedPercent}% finalized</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Finalized Reviews</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{isLoading ? "..." : finalizedReviews.length}</p>
          <p className="mt-1 text-xs text-zinc-400">No fabricated readiness score</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Feedback Records</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{isLoading ? "..." : feedback.data?.length ?? 0}</p>
          <p className="mt-1 text-xs text-zinc-400">Scoped by server permissions</p>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900">Current Goals</h3>
              <p className="text-xs text-zinc-500">Tenant-scoped goals from the Performance API.</p>
            </div>
            <Link href={"/performance/goals" as Route} className="text-xs font-semibold text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {allGoals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No goals are available yet.</div>
          ) : (
            <div className="space-y-4">
              {allGoals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 transition hover:bg-zinc-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={goal.category === "OKR" ? "warning" : "neutral"}>{goal.category}</Badge>
                      <h4 className="text-sm font-semibold text-zinc-900">{goal.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-zinc-700">{goal.progressPercent}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${goal.progressPercent}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Owner: {goal.employee?.fullName ?? "Unassigned"}</span>
                    <Badge tone={goal.status === "COMPLETED" ? "success" : "warning"}>{goal.status.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900">Review Activity</h3>
              <p className="text-xs text-zinc-500">Reviews visible under the current permission scope.</p>
            </div>
            <Link href={"/performance/reviews" as Route} className="text-xs font-semibold text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {allReviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No review records are available yet.</div>
          ) : (
            <div className="space-y-3">
              {allReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 hover:bg-zinc-50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-zinc-900">{review.employee?.fullName ?? "Employee"}</p>
                    <p className="text-xs text-zinc-500">
                      {review.employee?.designation?.name ?? "Designation unavailable"} / {review.employee?.department?.name ?? "Department unavailable"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">{review.finalScore ?? "Unscored"}</p>
                      <p className="text-[10px] text-zinc-400">{review.ratingLabel?.replace(/_/g, " ") ?? "No rating"}</p>
                    </div>
                    <Badge tone={review.status === "FINALIZED" ? "success" : "warning"}>{review.status.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
