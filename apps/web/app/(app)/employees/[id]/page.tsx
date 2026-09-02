"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { use } from "react";
import { Button } from "../../../../components/ui";
import { ErrorState, LoadingState, PermissionState, Section, StatusBadge, Surface } from "../../../../components/page-primitives";
import { apiRequest } from "../../../../lib/api";
import { useSessionStore } from "../../../../lib/session-store";

interface EmployeeDocument {
  id: string;
  documentType: string;
  customTypeLabel?: string;
  fileName: string;
  version: number;
  status: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  message: string;
  createdAt: string;
}

interface EmployeeStatusHistory {
  id: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
  createdAt: string;
}

interface EmployeeDetail {
  id: string;
  employeeCode: string;
  fullName: string;
  preferredName?: string;
  email: string;
  personalEmail?: string;
  phone?: string;
  status: string;
  employmentType: string;
  salaryType: string;
  joiningDate: string;
  probationEndsAt?: string;
  noticePeriodEndsAt?: string;
  profilePhotoObjectKey?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: Record<string, unknown>;
  bankDetails?: Record<string, unknown>;
  governmentIds?: Record<string, unknown>;
  currentAddress?: Record<string, unknown>;
  permanentAddress?: Record<string, unknown>;
  department: { name: string };
  designation: { name: string };
  documents: EmployeeDocument[];
  timelineEvents: TimelineEvent[];
  statusHistory: EmployeeStatusHistory[];
  profileCompletionScore: number;
  permissionsSummary: { roles: Array<{ code: string; name: string }>; permissions: string[] };
}

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const permissions = useSessionStore((state) => state.permissions);
  const employee = useQuery({
    queryKey: ["employee", id],
    queryFn: () => apiRequest<EmployeeDetail>(`/employees/${id}`)
  });

  if (!permissions.includes("employees.read")) {
    return <PermissionState title="Employee profiles are not available for your role." />;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:p-8">
      {employee.isLoading ? <Surface><LoadingState label="Loading employee profile" /></Surface> : null}
      {employee.isError ? <ErrorState message="Employee could not be loaded." /> : null}
      {employee.data ? (
        <>
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-panel bg-muted text-lg font-semibold text-zinc-700">
                {employee.data.profilePhotoObjectKey ? "IMG" : employee.data.fullName.slice(0, 1)}
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={employee.data.status === "ACTIVE" ? "success" : employee.data.status === "ARCHIVED" ? "danger" : "neutral"}>
                    {employee.data.status}
                  </StatusBadge>
                  <span className="text-xs font-medium text-zinc-500">{employee.data.employeeCode}</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{employee.data.fullName}</h1>
                <p className="mt-1 text-sm text-zinc-600">{employee.data.designation.name} in {employee.data.department.name}</p>
              </div>
            </div>
            <Link href={`/employees/${employee.data.id}/edit` as Route}>
              <Button>Edit employee</Button>
            </Link>
          </header>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <Surface>
              <p className="text-sm font-semibold text-zinc-950">Profile completion</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${employee.data.profileCompletionScore}%` }} />
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-950">{employee.data.profileCompletionScore}%</p>
              <div className="mt-5 grid gap-2 text-sm text-zinc-600">
                <span>{employee.data.email}</span>
                <span>{employee.data.phone ?? "Phone not provided"}</span>
                <span>Joined {new Date(employee.data.joiningDate).toLocaleDateString()}</span>
              </div>
            </Surface>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoPanel title="Personal information" data={{
                "Preferred name": employee.data.preferredName,
                "Work email": employee.data.email,
                "Personal email": employee.data.personalEmail,
                Phone: employee.data.phone,
                "Date of birth": employee.data.dateOfBirth ? new Date(employee.data.dateOfBirth).toLocaleDateString() : undefined,
                Gender: employee.data.gender ? employee.data.gender.charAt(0) + employee.data.gender.slice(1).toLowerCase().replace(/_/g, ' ') : undefined
              }} />
              <InfoPanel title="Employment information" data={{
                Department: employee.data.department.name,
                Designation: employee.data.designation.name,
                "Employment type": employee.data.employmentType,
                "Salary type": employee.data.salaryType,
                "Probation ends": employee.data.probationEndsAt ? new Date(employee.data.probationEndsAt).toLocaleDateString() : undefined,
                "Notice ends": employee.data.noticePeriodEndsAt ? new Date(employee.data.noticePeriodEndsAt).toLocaleDateString() : undefined
              }} />
              <InfoPanel title="Emergency contact" data={flattenRecord(employee.data.emergencyContact)} />
              <InfoPanel title="Bank details" data={flattenRecord(employee.data.bankDetails)} />
              <InfoPanel title="Government IDs" data={flattenRecord(employee.data.governmentIds)} />
              <InfoPanel title="Current Address" data={flattenRecord(employee.data.currentAddress)} />
              <InfoPanel title="Permanent Address" data={flattenRecord(employee.data.permanentAddress)} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Documents">
              <div className="mt-4 divide-y divide-border">
                {employee.data.documents.length ? employee.data.documents.map((document) => (
                  <div className="flex items-center justify-between gap-3 py-3" key={document.id}>
                    <div>
                      <p className="text-sm font-medium text-zinc-950">{document.customTypeLabel ?? document.documentType}</p>
                      <p className="text-xs text-zinc-500">{document.fileName} - v{document.version}</p>
                    </div>
                    <StatusBadge tone={document.status === "ACTIVE" ? "success" : "neutral"}>{document.status}</StatusBadge>
                  </div>
                )) : <p className="text-sm text-zinc-600">No document metadata yet.</p>}
              </div>
            </Section>

            <Section title="Permissions summary">
              <div className="mt-4 flex flex-wrap gap-2">
                {employee.data.permissionsSummary.roles.map((role) => <StatusBadge key={role.code}>{role.name}</StatusBadge>)}
                {!employee.data.permissionsSummary.roles.length ? <p className="text-sm text-zinc-600">No user access assigned.</p> : null}
              </div>
              <p className="mt-4 text-sm text-zinc-600">{employee.data.permissionsSummary.permissions.length} server-side permissions granted.</p>
            </Section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Timeline">
              <Timeline events={employee.data.timelineEvents} />
            </Section>
            <Section title="Status history">
              <div className="mt-4 grid gap-3">
                {employee.data.statusHistory.length ? employee.data.statusHistory.map((entry) => (
                  <div className="rounded-control border border-border p-3" key={entry.id}>
                    <p className="text-sm font-medium text-zinc-950">{entry.previousStatus} to {entry.newStatus}</p>
                    <p className="mt-1 text-xs text-zinc-500">{new Date(entry.createdAt).toLocaleString()}</p>
                    <p className="mt-2 text-sm text-zinc-600">{entry.reason}</p>
                  </div>
                )) : <p className="text-sm text-zinc-600">No status transitions yet.</p>}
              </div>
            </Section>
          </div>
        </>
      ) : null}
    </div>
  );
}

function InfoPanel({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, value]) => value);
  return (
    <Surface>
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {entries.length ? entries.map(([label, value]) => (
          <div key={label}>
            <dt className="text-zinc-500">{label}</dt>
            <dd className="break-words text-zinc-950">{String(value)}</dd>
          </div>
        )) : <p className="text-sm text-zinc-600">Not provided.</p>}
      </dl>
    </Surface>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="mt-4 grid gap-3">
      {events.length ? events.map((event) => (
        <div className="rounded-control border border-border p-3" key={event.id}>
          <p className="text-sm font-medium text-zinc-950">{event.message}</p>
          <p className="mt-1 text-xs text-zinc-500">{event.eventType} - {new Date(event.createdAt).toLocaleString()}</p>
        </div>
      )) : <p className="text-sm text-zinc-600">No activity yet.</p>}
    </div>
  );
}

function flattenRecord(record?: Record<string, unknown>) {
  if (!record) return {};
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [sentenceCase(key), typeof value === "object" ? JSON.stringify(value) : value]));
}

function sentenceCase(value: string) {
  return value.replaceAll("_", " ").replace(/[A-Z]/g, (match) => ` ${match}`).replace(/^./, (match) => match.toUpperCase()).trim();
}
