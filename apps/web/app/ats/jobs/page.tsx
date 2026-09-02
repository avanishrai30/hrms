"use client";

import Link from "next/link";
import type { Route } from "next";
import { Check, ExternalLink, Send } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useHasPermission, usePermissionGate } from "../../../lib/session-store";
import {
  formatCurrency,
  formatDateTime,
  formatTalentLabel,
  useApproveHiringRequest,
  useHiringRequests,
  useJobRequisitions,
  usePublishRequisition
} from "../../../lib/queries/use-talent-queries";
import { LoadingState, PermissionState } from "../../../components/page-primitives";
import {
  TalentDataCard,
  TalentMobileList,
  TalentPageShell,
  TalentRecordCard,
  TalentStatusBadge,
  TalentTable,
  TalentToolbar,
  TableCell,
  TableRow
} from "../_components/talent-ui";

export default function JobRequisitionsPage() {
  const gate = usePermissionGate("recruitment.read");
  const canManage = useHasPermission("recruitment.manage");
  const requisitions = useJobRequisitions(undefined, gate.isAuthorized);
  const hiringRequests = useHiringRequests(undefined, gate.isAuthorized);
  const publishRequisition = usePublishRequisition();
  const approveHiringRequest = useApproveHiringRequest();

  if (gate.isLoading) return <LoadingState label="Loading job requisitions" />;
  if (!gate.isAuthorized) return <PermissionState />;

  const requisitionRows = requisitions.data ?? [];
  const hiringRows = hiringRequests.data ?? [];

  return (
    <TalentPageShell
      title="Jobs"
      description="Review approved requisitions, open postings, and manpower approvals without leaving tenant-scoped Talent data."
      actions={
        <Button asChild variant="outline">
          <Link href={"/careers" as Route} target="_blank">
            Public careers
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <TalentDataCard title="Job requisitions" description="Backend requisition records with posting and application counts.">
          <TalentToolbar>
            <span className="text-xs text-muted-foreground">{requisitionRows.length} requisitions</span>
          </TalentToolbar>
          <div className="mt-4">
            <TalentTable
              columns={["Code", "Role", "Department", "Location", "Openings", "Applications", "Status", "Action"]}
              emptyTitle="No open jobs"
              isLoading={requisitions.isLoading}
              error={requisitions.error?.message}
            >
              {requisitionRows.length
                ? requisitionRows.map((req) => {
                    const slug = req.postings?.find((posting) => posting.status === "ACTIVE")?.slug ?? req.postings?.[0]?.slug;
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{req.requisitionCode}</TableCell>
                        <TableCell>
                          <div className="font-medium">{req.jobTitle}</div>
                          <div className="text-xs text-muted-foreground">{formatTalentLabel(req.employmentType)}</div>
                        </TableCell>
                        <TableCell>{req.department?.name ?? "-"}</TableCell>
                        <TableCell>{req.location ?? "-"}</TableCell>
                        <TableCell className="tabular-nums">{req.openings ?? "-"}</TableCell>
                        <TableCell className="tabular-nums">{req._count?.applications ?? 0}</TableCell>
                        <TableCell><TalentStatusBadge status={req.status} /></TableCell>
                        <TableCell className="text-right">
                          {slug ? (
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/careers/jobs/${slug}` as Route} target="_blank">View</Link>
                            </Button>
                          ) : canManage && req.status === "APPROVED" ? (
                            <Button size="sm" onClick={() => publishRequisition.mutate(req.id)} disabled={publishRequisition.isPending}>
                              <Send className="h-4 w-4" />
                              Publish
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TalentTable>

            <TalentMobileList emptyTitle="No open jobs" isLoading={requisitions.isLoading} error={requisitions.error?.message}>
              {requisitionRows.length
                ? requisitionRows.map((req) => (
                    <TalentRecordCard
                      key={req.id}
                      eyebrow={req.requisitionCode}
                      title={req.jobTitle}
                      meta={`${req.department?.name ?? "-"} · ${req.location ?? "-"} · ${req._count?.applications ?? 0} applications`}
                      status={req.status}
                    />
                  ))
                : null}
            </TalentMobileList>
          </div>
        </TalentDataCard>

        <TalentDataCard title="Hiring requests" description="Manpower approvals tracked by backend approval stage.">
          <div className="grid gap-3">
            {hiringRequests.isLoading ? <LoadingState label="Loading hiring requests" /> : null}
            {hiringRequests.error ? <p className="text-sm text-destructive">{hiringRequests.error.message}</p> : null}
            {!hiringRequests.isLoading && !hiringRequests.error && hiringRows.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No hiring requests</p>
            ) : null}
            {hiringRows.map((request) => (
              <div key={request.id} className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{request.requestCode}</p>
                    <h3 className="truncate text-sm font-semibold">{request.designation?.name ?? "Requested designation"}</h3>
                    <p className="text-xs text-muted-foreground">{request.department?.name ?? "-"} · {formatDateTime(request.requiredByDate)}</p>
                  </div>
                  <TalentStatusBadge status={request.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-background p-2">
                    <span className="text-muted-foreground">Vacancies</span>
                    <p className="font-semibold tabular-nums">{request.vacancies ?? "-"}</p>
                  </div>
                  <div className="rounded-md bg-background p-2">
                    <span className="text-muted-foreground">Budget</span>
                    <p className="font-semibold tabular-nums">{formatCurrency(request.budgetedCtc)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Stage {formatTalentLabel(request.currentApprovalStage)}</span>
                  {canManage && request.status === "PENDING_APPROVAL" ? (
                    <Button size="sm" onClick={() => approveHiringRequest.mutate(request.id)} disabled={approveHiringRequest.isPending}>
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </TalentDataCard>
      </div>
    </TalentPageShell>
  );
}
