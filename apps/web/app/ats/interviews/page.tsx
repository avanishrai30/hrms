"use client";

import Link from "next/link";
import type { Route } from "next";
import { ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { LoadingState, PermissionState } from "../../../components/page-primitives";
import { formatDateTime, formatTalentLabel, useInterviews } from "../../../lib/queries/use-talent-queries";
import { useHasPermission, usePermissionGate } from "../../../lib/session-store";
import {
  TalentDataCard,
  TalentMobileList,
  TalentPageShell,
  TalentRecordCard,
  TalentStatusBadge,
  TalentTable,
  TableCell,
  TableRow
} from "../_components/talent-ui";

const interviewStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED", "NO_SHOW"];

export default function InterviewsPage() {
  const gate = usePermissionGate("interviews.read");
  const canReadFeedback = useHasPermission("interviews.feedback");
  const interviews = useInterviews(undefined, gate.isAuthorized);

  if (gate.isLoading) return <LoadingState label="Loading interviews" />;
  if (!gate.isAuthorized) return <PermissionState />;

  const rows = interviews.data ?? [];

  return (
    <TalentPageShell
      title="Interviews"
      description="Coordinate scheduled rounds and review authorized evaluation metadata using tenant-scoped interview records."
      actions={
        <Button asChild variant="outline">
          <Link href={"/ats/pipeline" as Route}>Pipeline</Link>
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <TalentDataCard title="Interview schedule" description="Times are formatted from stored ISO timestamps in the viewer timezone.">
          <TalentTable
            columns={["Candidate", "Role", "Round", "Time", "Panel", "Status", "Meeting"]}
            emptyTitle="No interviews scheduled"
            isLoading={interviews.isLoading}
            error={interviews.error?.message}
          >
            {rows.length
              ? rows.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">{interview.application?.candidate?.fullName ?? "-"}</TableCell>
                    <TableCell>{interview.application?.requisition?.jobTitle ?? "-"}</TableCell>
                    <TableCell>
                      <div>{interview.roundName}</div>
                      <div className="text-xs text-muted-foreground">{formatTalentLabel(interview.interviewType)}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{formatDateTime(interview.scheduledStartTime)}</TableCell>
                    <TableCell className="text-xs">
                      {(interview.panels ?? []).length
                        ? interview.panels?.map((panel) => panel.employee?.fullName ?? "-").join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell><TalentStatusBadge status={interview.status} /></TableCell>
                    <TableCell>
                      {interview.meetingLink ? (
                        <Button asChild variant="ghost" size="sm">
                          <a href={interview.meetingLink} target="_blank" rel="noreferrer">
                            Open
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{interview.locationDetails ?? "-"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TalentTable>

          <TalentMobileList emptyTitle="No interviews scheduled" isLoading={interviews.isLoading} error={interviews.error?.message}>
            {rows.length
              ? rows.map((interview) => (
                  <TalentRecordCard
                    key={interview.id}
                    title={interview.application?.candidate?.fullName ?? "-"}
                    meta={`${interview.roundName} · ${formatDateTime(interview.scheduledStartTime)}`}
                    status={interview.status}
                    href={`/ats/candidates/${interview.application?.candidateId ?? ""}` as Route}
                  />
                ))
              : null}
          </TalentMobileList>
        </TalentDataCard>

        <TalentDataCard title="Feedback privacy" description="Scorecard contents are restricted to users with feedback permission.">
          <div className="grid gap-3">
            {interviewStatuses.map((status) => (
              <div key={status} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <span>{formatTalentLabel(status)}</span>
                <span className="font-mono text-xs text-muted-foreground">{rows.filter((item) => item.status === status).length}</span>
              </div>
            ))}
            {canReadFeedback ? (
              rows.flatMap((interview) => interview.feedbacks ?? []).slice(0, 4).map((feedback) => (
                <div key={feedback.id} className="rounded-xl border border-border bg-background p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{feedback.interviewer?.fullName ?? "Interviewer"}</span>
                    <span className="font-mono text-xs">{feedback.overallScore ?? "-"}/5</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatTalentLabel(feedback.recommendation)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Feedback details are restricted.</p>
            )}
          </div>
        </TalentDataCard>
      </div>
    </TalentPageShell>
  );
}
