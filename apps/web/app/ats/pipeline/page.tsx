"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { LoadingState, PermissionState } from "../../../components/page-primitives";
import {
  APPLICATION_STAGES,
  formatNullableNumber,
  formatTalentLabel,
  useApplications,
  useUpdateApplicationStage,
  type ApplicationRecord
} from "../../../lib/queries/use-talent-queries";
import { useHasPermission, usePermissionGate } from "../../../lib/session-store";
import { TalentPageShell, TalentStatusBadge } from "../_components/talent-ui";

export default function AtsPipelinePage() {
  const gate = usePermissionGate(["applications.read", "recruitment.read"]);
  const canMove = useHasPermission("applications.manage");
  const applications = useApplications(undefined, gate.isAuthorized);
  const updateStage = useUpdateApplicationStage();

  if (gate.isLoading) return <LoadingState label="Loading application pipeline" />;
  if (!gate.isAuthorized) return <PermissionState />;

  const rows = applications.data ?? [];

  return (
    <TalentPageShell
      title="Pipeline"
      description="Review application stages supported by the backend and move candidates only after server authorization succeeds."
      actions={
        <Button asChild variant="outline">
          <Link href={"/ats/candidates" as Route}>Candidates</Link>
        </Button>
      }
    >
      {applications.isLoading ? <LoadingState label="Loading application pipeline" /> : null}
      {applications.error ? <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{applications.error.message}</p> : null}
      {!applications.isLoading && !applications.error ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {APPLICATION_STAGES.map((stage) => {
            const stageApplications = rows.filter((application) => application.stage === stage);
            return (
              <section key={stage} className="flex h-[calc(100vh-16rem)] min-h-[520px] w-[320px] shrink-0 flex-col rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <TalentStatusBadge status={stage} />
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {stageApplications.length}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 overflow-y-auto pr-1">
                  {stageApplications.length === 0 ? (
                    <div className="grid h-28 place-items-center rounded-lg border border-dashed border-border bg-background text-xs text-muted-foreground">
                      No candidates
                    </div>
                  ) : null}
                  {stageApplications.map((application) => (
                    <PipelineCard
                      key={application.id}
                      application={application}
                      canMove={canMove}
                      isPending={updateStage.isPending}
                      onMove={(nextStage) => updateStage.mutate({ id: application.id, stage: nextStage })}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </TalentPageShell>
  );
}

function PipelineCard({
  application,
  canMove,
  isPending,
  onMove
}: {
  application: ApplicationRecord;
  canMove: boolean;
  isPending: boolean;
  onMove: (stage: ApplicationRecord["stage"]) => void;
}) {
  const candidate = application.candidate;
  const requisition = application.requisition;
  const currentIndex = APPLICATION_STAGES.indexOf(application.stage);
  const nextStage = APPLICATION_STAGES[currentIndex + 1];

  return (
    <article className="rounded-xl border border-border bg-card p-3 shadow-xs transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{application.applicationCode}</p>
          <h3 className="truncate text-sm font-semibold">{candidate?.fullName ?? "-"}</h3>
          <p className="truncate text-xs text-muted-foreground">{requisition?.jobTitle ?? "-"}</p>
        </div>
        <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
          {formatNullableNumber(application.aiMatchScore, "%")}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {(candidate?.skills ?? []).slice(0, 3).map((skill) => (
          <span key={skill} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{skill}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/ats/candidates/${application.candidateId}` as Route}>Open</Link>
        </Button>
        {canMove && nextStage ? (
          <Button size="sm" disabled={isPending} onClick={() => onMove(nextStage)}>
            {formatTalentLabel(nextStage)}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </article>
  );
}
