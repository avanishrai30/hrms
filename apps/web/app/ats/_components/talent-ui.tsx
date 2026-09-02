"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { ReactNode } from "react";
import { ArrowRight, BriefcaseBusiness, CalendarClock, FileCheck2, Layers3, UsersRound } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../../components/page-primitives";
import { formatTalentLabel, statusTone, type TalentStatus } from "../../../lib/queries/use-talent-queries";
import { useSessionStore } from "../../../lib/session-store";
import { cn } from "../../../lib/utils";

export const talentTabs: Array<{ href: Route; label: string; permission: string; icon: typeof BriefcaseBusiness }> = [
  { href: "/ats" as Route, label: "Overview", permission: "recruitment.read", icon: Layers3 },
  { href: "/ats/jobs" as Route, label: "Jobs", permission: "recruitment.read", icon: BriefcaseBusiness },
  { href: "/ats/candidates" as Route, label: "Candidates", permission: "candidates.read", icon: UsersRound },
  { href: "/ats/pipeline" as Route, label: "Pipeline", permission: "applications.read", icon: Layers3 },
  { href: "/ats/interviews" as Route, label: "Interviews", permission: "interviews.read", icon: CalendarClock },
  { href: "/ats/offers" as Route, label: "Offers", permission: "offers.read", icon: FileCheck2 }
];

export function getVisibleTalentTabs(
  permissions: string[],
  tabs = talentTabs
): typeof talentTabs {
  return tabs.filter((tab) => permissions.includes(tab.permission));
}

export function isTalentTabActive(tabHref: string, currentPathname: string): boolean {
  if (tabHref === "/ats") {
    return currentPathname === "/ats";
  }
  return currentPathname === tabHref || currentPathname.startsWith(`${tabHref}/`);
}

export function TalentPageShell({
  title,
  description,
  actions,
  children
}: {
  title: string;
  description?: string | null | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const permissions = useSessionStore((state) => state.permissions);
  const visibleTabs = getVisibleTalentTabs(permissions);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Talent Acquisition" title={title} description={description || undefined} actions={actions} />
      {visibleTabs.length > 0 ? (
        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-xs" aria-label="Talent sections">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isTalentTabActive(tab.href, pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium transition",
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
      {children}
    </div>
  );
}

export function TalentMetric({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode | undefined;
  icon: typeof BriefcaseBusiness;
}) {
  return (
    <Card className="bg-linear-to-t from-primary/5 to-card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardAction>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
        {detail ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}

export function TalentStatusBadge({ status }: { status?: TalentStatus | null | undefined }) {
  return (
    <Badge variant={statusTone(status ?? undefined)} className="whitespace-nowrap rounded-full">
      {formatTalentLabel(status)}
    </Badge>
  );
}

export function TalentToolbar({
  search,
  onSearch,
  searchPlaceholder,
  children
}: {
  search?: string | undefined;
  onSearch?: ((value: string) => void) | undefined;
  searchPlaceholder?: string | undefined;
  children?: ReactNode | undefined;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {onSearch ? (
          <Input
            value={search ?? ""}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 md:max-w-sm"
          />
        ) : null}
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

export function TalentDataCard({
  title,
  description,
  action,
  children,
  className
}: {
  title: string;
  description?: string | null | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function TalentTable({
  columns,
  children,
  emptyTitle,
  isLoading,
  error
}: {
  columns: string[];
  children: ReactNode;
  emptyTitle: string;
  isLoading?: boolean | undefined;
  error?: string | null | undefined;
}) {
  if (isLoading) return <LoadingState label="Loading Talent records" />;
  if (error) return <ErrorState message={error} />;
  const hasRows = Boolean(children);
  if (!hasRows) return <EmptyState title={emptyTitle} />;
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

export function TalentMobileList({
  children,
  emptyTitle,
  isLoading,
  error
}: {
  children: ReactNode;
  emptyTitle: string;
  isLoading?: boolean | undefined;
  error?: string | null | undefined;
}) {
  if (isLoading) return <LoadingState label="Loading Talent records" />;
  if (error) return <ErrorState message={error} />;
  if (!children) return <EmptyState title={emptyTitle} />;
  return <div className="grid gap-3 md:hidden">{children}</div>;
}

export function TalentRecordCard({
  title,
  eyebrow,
  meta,
  status,
  href,
  children
}: {
  title: string;
  eyebrow?: string | null | undefined;
  meta?: string | null | undefined;
  status?: TalentStatus | null | undefined;
  href?: Route | undefined;
  children?: ReactNode | undefined;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="min-w-0">
          {eyebrow ? <CardDescription className="font-mono">{eyebrow}</CardDescription> : null}
          <CardTitle className="truncate text-sm">{title}</CardTitle>
          {meta ? <CardDescription>{meta}</CardDescription> : null}
        </div>
        {status ? <CardAction><TalentStatusBadge status={status} /></CardAction> : null}
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
      {href ? (
        <div className="px-3.5 pb-3.5">
          <Button asChild variant="outline" size="sm" className="w-full justify-between">
            <Link href={href}>
              Open
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function FieldGrid({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}

export { TableCell, TableRow };
