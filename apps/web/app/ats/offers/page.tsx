"use client";

import { Check, Send } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { LoadingState, PermissionState } from "../../../components/page-primitives";
import {
  formatCurrency,
  formatDateTime,
  formatTalentLabel,
  useApproveOffer,
  useOffers,
  useReleaseOffer
} from "../../../lib/queries/use-talent-queries";
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
import type { OfferApproverRole } from "@vc-wms/shared-types";

const approvalRoles: OfferApproverRole[] = ["HR", "DEPT_HEAD", "FINANCE", "CEO"];

export default function OffersPage() {
  const gate = usePermissionGate("offers.read");
  const canManage = useHasPermission("offers.manage");
  const offers = useOffers(undefined, gate.isAuthorized);
  const approveOffer = useApproveOffer();
  const releaseOffer = useReleaseOffer();

  if (gate.isLoading) return <LoadingState label="Loading offers" />;
  if (!gate.isAuthorized) return <PermissionState />;

  const rows = offers.data ?? [];

  return (
    <TalentPageShell
      title="Offers"
      description="Review compensation-sensitive offers, approvals, release status, and candidate responses."
    >
      <TalentDataCard title="Offer approvals" description="Compensation values are rendered only after server authorization grants offer read access.">
        <TalentTable
          columns={["Code", "Candidate", "Role", "Compensation", "Joining", "Approvals", "Status", "Action"]}
          emptyTitle="No offers awaiting action"
          isLoading={offers.isLoading}
          error={offers.error?.message}
        >
          {rows.length
            ? rows.map((offer) => {
                const currentStage = approvalRoles.includes(offer.currentApprovalStage as OfferApproverRole)
                  ? (offer.currentApprovalStage as OfferApproverRole)
                  : "HR";
                return (
                  <TableRow key={offer.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{offer.offerCode}</TableCell>
                    <TableCell className="font-medium">{offer.candidate?.fullName ?? "-"}</TableCell>
                    <TableCell>{offer.requisition?.jobTitle ?? "-"}</TableCell>
                    <TableCell>
                      <div className="font-semibold tabular-nums">{formatCurrency(offer.totalCtc)}</div>
                      <div className="text-xs text-muted-foreground">Base {formatCurrency(offer.baseSalary)}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{formatDateTime(offer.joiningDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {approvalRoles.map((role) => {
                          const approval = offer.approvals?.find((item) => (item.approverRole ?? item.role) === role);
                          return (
                            <span key={role} className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px]">
                              {role}: {formatTalentLabel(approval?.status)}
                            </span>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell><TalentStatusBadge status={offer.status} /></TableCell>
                    <TableCell className="text-right">
                      {canManage && offer.status === "PENDING_APPROVAL" ? (
                        <Button size="sm" onClick={() => approveOffer.mutate({ id: offer.id, role: currentStage })} disabled={approveOffer.isPending}>
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                      ) : canManage && offer.status === "APPROVED" ? (
                        <Button size="sm" onClick={() => releaseOffer.mutate(offer.id)} disabled={releaseOffer.isPending}>
                          <Send className="h-4 w-4" />
                          Release
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

        <TalentMobileList emptyTitle="No offers awaiting action" isLoading={offers.isLoading} error={offers.error?.message}>
          {rows.length
            ? rows.map((offer) => (
                <TalentRecordCard
                  key={offer.id}
                  eyebrow={offer.offerCode}
                  title={offer.candidate?.fullName ?? "-"}
                  meta={`${offer.requisition?.jobTitle ?? "-"} · ${formatCurrency(offer.totalCtc)}`}
                  status={offer.status}
                />
              ))
            : null}
        </TalentMobileList>
      </TalentDataCard>
    </TalentPageShell>
  );
}
