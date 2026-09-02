"use client";

import Link from "next/link";
import type { Route } from "next";
import { Check, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { LoadingState, PermissionState } from "../../../components/page-primitives";
import { formatDateTime, formatTalentLabel, usePreboardingTasks, useVerifyPreboardingTask } from "../../../lib/queries/use-talent-queries";
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

export default function PreboardingPage() {
  const gate = usePermissionGate("preboarding.read");
  const canManage = useHasPermission("preboarding.manage");
  const tasks = usePreboardingTasks(undefined, gate.isAuthorized);
  const verifyTask = useVerifyPreboardingTask();

  if (gate.isLoading) return <LoadingState label="Loading onboarding tasks" />;
  if (!gate.isAuthorized) return <PermissionState />;

  const rows = tasks.data ?? [];

  return (
    <TalentPageShell
      title="Hiring Onboarding"
      description="Review preboarding task status and verification metadata before candidate-to-employee conversion."
      actions={
        <Button asChild variant="outline">
          <Link href={"/ats/offers" as Route}>Offers</Link>
        </Button>
      }
    >
      <TalentDataCard title="Preboarding tasks" description="Submitted payload contents stay hidden from list views to protect candidate PII.">
        <TalentTable
          columns={["Candidate", "Task", "Type", "Created", "Verified", "Status", "Action"]}
          emptyTitle="No onboarding tasks"
          isLoading={tasks.isLoading}
          error={tasks.error?.message}
        >
          {rows.length
            ? rows.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.candidate?.fullName ?? "-"}</TableCell>
                  <TableCell>{task.taskTitle}</TableCell>
                  <TableCell>{formatTalentLabel(task.taskType)}</TableCell>
                  <TableCell className="font-mono text-xs">{formatDateTime(task.createdAt)}</TableCell>
                  <TableCell className="text-xs">{task.verifiedBy?.fullName ?? "-"} {task.verifiedAt ? `· ${formatDateTime(task.verifiedAt)}` : ""}</TableCell>
                  <TableCell><TalentStatusBadge status={task.status} /></TableCell>
                  <TableCell className="text-right">
                    {canManage && task.status === "SUBMITTED" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => verifyTask.mutate({ id: task.id, status: "VERIFIED" })} disabled={verifyTask.isPending}>
                          <Check className="h-4 w-4" />
                          Verify
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => verifyTask.mutate({ id: task.id, status: "REJECTED" })} disabled={verifyTask.isPending}>
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TalentTable>

        <TalentMobileList emptyTitle="No onboarding tasks" isLoading={tasks.isLoading} error={tasks.error?.message}>
          {rows.length
            ? rows.map((task) => (
                <TalentRecordCard
                  key={task.id}
                  title={task.taskTitle}
                  meta={`${task.candidate?.fullName ?? "-"} · ${formatTalentLabel(task.taskType)}`}
                  status={task.status}
                />
              ))
            : null}
        </TalentMobileList>
      </TalentDataCard>
    </TalentPageShell>
  );
}
