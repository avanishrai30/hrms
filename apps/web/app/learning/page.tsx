"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";
import { apiRequest } from "../../lib/api";

interface LmsAnalytics {
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRatePercent: number;
  activeCertifications: number;
  totalSkillsAssessed: number;
  complianceCoveragePercent: number;
  learningHoursLogged: number;
}

interface CourseEnrollment {
  id: string;
  status: string;
  progressPercent: number;
  dueDate?: string | null;
  course: {
    id: string;
    title: string;
    code: string;
    deliveryType: string;
    isMandatory: boolean;
    category?: { name: string } | null;
  };
}

interface TrainingCourse {
  id: string;
  title: string;
  code: string;
  difficulty: string;
  deliveryType: string;
  estimatedDurationMinutes: number;
  isCompliance: boolean;
  isMandatory: boolean;
  category?: { name: string } | null;
}

function formatDate(value?: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function LearningHomePage() {
  const analytics = useQuery({
    queryKey: ["learning", "analytics"],
    queryFn: () => apiRequest<LmsAnalytics>("/learning/analytics")
  });
  const enrollments = useQuery({
    queryKey: ["learning", "enrollments", "my"],
    queryFn: () => apiRequest<CourseEnrollment[]>("/learning/enrollments/my")
  });
  const courses = useQuery({
    queryKey: ["learning", "courses", "catalog-preview"],
    queryFn: () => apiRequest<TrainingCourse[]>("/learning/courses")
  });

  const stats = analytics.data;
  const inProgress = (enrollments.data ?? []).filter((item) => item.status === "ENROLLED" || item.status === "IN_PROGRESS").slice(0, 4);
  const catalogPreview = (courses.data ?? []).slice(0, 4);
  const isLoading = analytics.isLoading || enrollments.isLoading || courses.isLoading;
  const hasError = analytics.isError || enrollments.isError || courses.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Management</h1>
          <p className="text-sm text-slate-600">Courses, assignments, progress, certifications, and skills development.</p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/catalog" as Route}>
            <Button variant="primary">Browse Catalog</Button>
          </Link>
          <Link href={"/learning/my-courses" as Route}>
            <Button variant="secondary">My Courses</Button>
          </Link>
        </div>
      </div>

      {hasError ? (
        <Panel className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Learning data is unavailable.</p>
          <p className="mt-1 text-xs text-amber-800">The dashboard is not showing fallback metrics. Try again when the API is reachable.</p>
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Enrollments</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{isLoading ? "..." : stats?.totalEnrollments ?? 0}</div>
          <div className="mt-1 text-xs text-slate-600">{isLoading ? "Loading" : `${stats?.completionRatePercent ?? 0}% completion rate`}</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Courses</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{isLoading ? "..." : stats?.completedEnrollments ?? 0}</div>
          <div className="mt-1 text-xs text-slate-600">From recorded enrollments</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Certifications</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{isLoading ? "..." : stats?.activeCertifications ?? 0}</div>
          <div className="mt-1 text-xs text-slate-600">{stats?.complianceCoveragePercent ?? 0}% compliance coverage</div>
        </Panel>
        <Panel className="border-l-4 border-l-zinc-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Learning Hours</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900">{isLoading ? "..." : stats?.learningHoursLogged ?? 0}</div>
          <div className="mt-1 text-xs text-slate-600">Calculated from watch time</div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
          <Link href={"/learning/my-courses" as Route} className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>

        {inProgress.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No active course assignments are available for this account.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {inProgress.map((enrollment) => (
              <div key={enrollment.id} className="space-y-3 rounded-lg border border-slate-200 bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-primary">{enrollment.course.category?.name ?? "Uncategorized"}</span>
                    <h3 className="mt-0.5 text-base font-bold text-slate-900">{enrollment.course.title}</h3>
                  </div>
                  {enrollment.course.isMandatory ? <Badge tone="danger">Mandatory</Badge> : null}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Progress</span>
                    <span className="font-mono font-bold text-primary">{enrollment.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${enrollment.progressPercent}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                  <span className="text-slate-500">Due: {formatDate(enrollment.dueDate)}</span>
                  <Link href={"/learning/my-courses" as Route}>
                    <Button variant="secondary">Resume</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Course Catalog</h2>
            <p className="text-xs text-slate-500">Published courses returned by the tenant LMS API.</p>
          </div>
          <Link href={"/learning/catalog" as Route} className="text-xs font-semibold text-primary hover:underline">
            Open catalog
          </Link>
        </div>

        {catalogPreview.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No published courses are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {catalogPreview.map((course) => (
              <div key={course.id} className="space-y-2 rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500">{course.category?.name ?? course.code}</span>
                    <h3 className="mt-0.5 text-sm font-bold text-slate-900">{course.title}</h3>
                  </div>
                  <Badge tone={course.isCompliance || course.isMandatory ? "warning" : "neutral"}>{course.difficulty}</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {course.deliveryType.replace(/_/g, " ")} / {course.estimatedDurationMinutes} min
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
