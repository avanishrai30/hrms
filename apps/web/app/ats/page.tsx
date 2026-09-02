"use client";

import Link from "next/link";
import type { Route } from "next";
import { BriefcaseBusiness, CalendarClock, FileCheck2, Layers3, UsersRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import { usePermissionGate } from "../../lib/session-store";
import {
  formatTalentLabel,
  visibleMetric,
  useApplications,
  useCandidates,
  useInterviews,
  useJobRequisitions,
  useOffers
} from "../../lib/queries/use-talent-queries";
import {
  TalentDataCard,
  TalentMetric,
  TalentMobileList,
  TalentPageShell,
  TalentRecordCard,
  TalentStatusBadge,
  TalentTable,
  TableCell,
  TableRow
} from "./_components/talent-ui";
import { LoadingState, PermissionState } from "../../components/page-primitives";

export default function AtsDashboardPage() {
  const gate = usePermissionGate("recruitment.read");
  const requisitions = useJobRequisitions(undefined, gate.isAuthorized);
  const candidates = useCandidates({ limit: 100, offset: 0 }, gate.isAuthorized);
  const applications = useApplications(undefined, gate.isAuthorized);
  const interviews = useInterviews(undefined, gate.isAuthorized);
  const offers = useOffers(undefined, gate.isAuthorized);

  if (gate.isLoading) return <LoadingState label="Loading Talent workspace" />;
  if (!gate.isAuthorized) return <PermissionState />;

  const openPositions = requisitions.data?.reduce((total, req) => total + (req.openings ?? 0), 0);
  const scheduledInterviews = interviews.data?.filter((item) => item.status === "SCHEDULED").length;
  const pendingOffers = offers.data?.filter((item) => item.status === "PENDING_APPROVAL").length;
  const recentRequisitions = requisitions.data?.slice(0, 5) ?? [];

  return (
    <TalentPageShell
      title="Talent Acquisition"
      description="Manage requisitions, candidate pipeline movement, interviews, offers, and hiring onboarding from one tenant-scoped workspace."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={"/ats/pipeline" as Route}>Pipeline</Link>
          </Button>
          <Button asChild>
            <Link href={"/ats/jobs" as Route}>Jobs</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <TalentMetric icon={BriefcaseBusiness} label="Open positions" value={visibleMetric(openPositions)} detail="Sum of openings from requisitions." />
        <TalentMetric icon={UsersRound} label="Candidates" value={visibleMetric(candidates.data?.length)} detail="Current page from tenant candidate pool." />
        <TalentMetric icon={Layers3} label="Applications" value={visibleMetric(applications.data?.length)} detail="Tenant-scoped applications." />
        <TalentMetric icon={CalendarClock} label="Scheduled rounds" value={visibleMetric(scheduledInterviews)} detail="Interviews with scheduled status." />
        <TalentMetric icon={FileCheck2} label="Pending offers" value={visibleMetric(pendingOffers)} detail="Offers awaiting approval." />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <TalentDataCard
          title="Recent requisitions"
          description="Live tenant requisitions ordered by creation date."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={"/ats/jobs" as Route}>View all</Link>
            </Button>
          }
        >
          <TalentTable
            columns={["Code", "Role", "Department", "Openings", "Applicants", "Status"]}
            emptyTitle="No open jobs"
            isLoading={requisitions.isLoading}
            error={requisitions.error?.message}
          >
            {recentRequisitions.length
              ? recentRequisitions.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{req.requisitionCode}</TableCell>
                    <TableCell className="font-medium">{req.jobTitle}</TableCell>
                    <TableCell>{req.department?.name ?? "-"}</TableCell>
                    <TableCell className="tabular-nums">{req.openings ?? "-"}</TableCell>
                    <TableCell className="tabular-nums">{req._count?.applications ?? 0}</TableCell>
                    <TableCell><TalentStatusBadge status={req.status} /></TableCell>
                  </TableRow>
                ))
              : null}
          </TalentTable>

          <TalentMobileList emptyTitle="No open jobs" isLoading={requisitions.isLoading} error={requisitions.error?.message}>
            {recentRequisitions.length
              ? recentRequisitions.map((req) => (
                  <TalentRecordCard
                    key={req.id}
                    eyebrow={req.requisitionCode}
                    title={req.jobTitle}
                    meta={`${req.department?.name ?? "-"} · ${req.openings ?? "-"} openings`}
                    status={req.status}
                    href={"/ats/jobs" as Route}
                  />
                ))
              : null}
          </TalentMobileList>
        </TalentDataCard>

        <TalentDataCard title="Pipeline stages" description="Application stages currently supported by the backend state model.">
          <div className="grid gap-2">
            {["APPLIED", "SCREENING", "TECHNICAL_ROUND", "MANAGER_ROUND", "HR_ROUND", "OFFER", "JOINED", "REJECTED"].map((stage) => {
              const count = applications.data?.filter((item) => item.stage === stage).length;
              return (
                <div key={stage} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <span className="font-medium">{formatTalentLabel(stage)}</span>
                  <span className="font-mono text-xs text-muted-foreground">{visibleMetric(count)}</span>
                </div>
              );
            })}
          </div>
        </TalentDataCard>
      </div>
    </TalentPageShell>
  );
}
