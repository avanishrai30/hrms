"use client";

import { use } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { LoadingState, PermissionState } from "../../../../components/page-primitives";
import { useCandidate, useOnboardCandidate, formatCurrency, formatDateTime, formatTalentLabel } from "../../../../lib/queries/use-talent-queries";
import { useHasPermission, usePermissionGate } from "../../../../lib/session-store";
import { TalentDataCard, TalentPageShell, TalentStatusBadge } from "../../_components/talent-ui";

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const gate = usePermissionGate("candidates.read");
  const canManage = useHasPermission("recruitment.manage");
  const canReadInterviews = useHasPermission("interviews.read");
  const canReadOffers = useHasPermission("offers.read");
  const canReadPreboarding = useHasPermission("preboarding.read");
  const candidate = useCandidate(id, gate.isAuthorized);
  const onboardCandidate = useOnboardCandidate();

  if (gate.isLoading) return <LoadingState label="Loading candidate profile" />;
  if (!gate.isAuthorized) return <PermissionState />;
  if (candidate.isLoading) return <LoadingState label="Loading candidate profile" />;
  if (candidate.error) return <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{candidate.error.message}</p>;
  if (!candidate.data) return null;

  const record = candidate.data;
  const applications = record.applications ?? [];
  const canOnboard = canManage && !record.hiredEmployeeId && (record.status === "HIRED" || (record.offers ?? []).some((o) => o.status === "ACCEPTED"));

  return (
    <TalentPageShell
      title={record.fullName}
      description={`${record.candidateCode} · ${record.email ?? "-"} · ${record.mobile ?? "-"}`}
      actions={
        <div className="flex items-center gap-2">
          {canOnboard ? (
            <Button
              size="sm"
              onClick={() => onboardCandidate.mutate({ id: record.id })}
              disabled={onboardCandidate.isPending}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {onboardCandidate.isPending ? "Converting..." : "Convert to Employee"}
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href={"/ats/candidates" as Route}>
              <ArrowLeft className="h-4 w-4" />
              Candidates
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Tenant-scoped candidate record.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <TalentStatusBadge status={record.status} />
            </div>
            <InfoRow label="Location" value={record.currentLocation} />
            <InfoRow label="Experience" value={record.experienceYears !== undefined ? `${record.experienceYears} yrs` : undefined} />
            <InfoRow label="Notice" value={record.noticePeriodDays !== undefined ? `${record.noticePeriodDays} days` : undefined} />
            <InfoRow label="Source" value={record.source} />
            <InfoRow label="Current CTC" value={formatCurrency(record.currentCtc)} />
            <InfoRow label="Expected CTC" value={formatCurrency(record.expectedCtc)} />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <TalentDataCard title="Applications" description="Application records and stage history attached to this candidate.">
            {applications.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No applications</p>
            ) : (
              <div className="grid gap-3">
                {applications.map((application) => (
                  <div key={application.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{application.applicationCode}</p>
                        <h3 className="font-semibold">{application.requisition?.jobTitle ?? "-"}</h3>
                        <p className="text-xs text-muted-foreground">{formatDateTime(application.appliedAt)}</p>
                      </div>
                      <TalentStatusBadge status={application.stage} />
                    </div>
                    {application.stageHistoryJson?.length ? (
                      <div className="mt-3 grid gap-2">
                        {application.stageHistoryJson.map((event, index) => (
                          <div key={`${event.stage}-${event.timestamp}-${index}`} className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-xs">
                            <span>{formatTalentLabel(event.stage)}</span>
                            <span className="text-muted-foreground">{formatDateTime(event.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </TalentDataCard>

          {canReadInterviews ? (
            <TalentDataCard title="Interviews" description="Feedback details are shown only to interview-authorized users.">
              <div className="grid gap-3">
                {applications.flatMap((application) => application.interviews ?? []).length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No interviews scheduled</p>
                ) : null}
                {applications.flatMap((application) => application.interviews ?? []).map((interview) => (
                  <div key={interview.id} className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{interview.roundName}</span>
                      <TalentStatusBadge status={interview.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(interview.scheduledStartTime)}</p>
                  </div>
                ))}
              </div>
            </TalentDataCard>
          ) : null}

          {canReadOffers ? (
            <TalentDataCard title="Offers" description="Compensation is visible only with offer read access.">
              <div className="grid gap-3">
                {(record.offers ?? []).length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No offers awaiting action</p>
                ) : null}
                {(record.offers ?? []).map((offer) => (
                  <div key={offer.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{offer.offerCode}</span>
                      <TalentStatusBadge status={offer.status} />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{formatCurrency(offer.totalCtc)}</p>
                    <p className="text-xs text-muted-foreground">Joining {formatDateTime(offer.joiningDate)}</p>
                  </div>
                ))}
              </div>
            </TalentDataCard>
          ) : null}

          {canReadPreboarding ? (
            <TalentDataCard title="Hiring onboarding" description="Preboarding task metadata from the recruitment service.">
              <div className="grid gap-3">
                {(record.preboardingTasks ?? []).length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No onboarding tasks</p>
                ) : null}
                {(record.preboardingTasks ?? []).map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                    <div>
                      <p className="text-sm font-medium">{task.taskTitle}</p>
                      <p className="text-xs text-muted-foreground">{formatTalentLabel(task.taskType)}</p>
                    </div>
                    <TalentStatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            </TalentDataCard>
          ) : null}
        </div>
      </div>
    </TalentPageShell>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{value || "-"}</span>
    </div>
  );
}
