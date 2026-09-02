"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Megaphone, ArrowUpRight, ShieldCheck, FileText, LifeBuoy, Inbox } from "lucide-react";
import type { AnnouncementItem } from "../../../lib/queries/use-dashboard-queries";
import { SkeletonLoader } from "../feedback/aiavro-states";

interface WorkspaceServicesCardProps {
  announcements?: AnnouncementItem[];
  isLoading?: boolean;
  isError?: boolean;
}

export function DeviceBenefitsAccordion({
  announcements = [],
  isLoading,
  isError
}: WorkspaceServicesCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-3 animate-pulse">
        <div className="flex justify-between">
          <SkeletonLoader className="h-4 w-32" />
          <SkeletonLoader className="h-4 w-16" />
        </div>
        <SkeletonLoader className="h-12 w-full rounded-card" />
        <SkeletonLoader className="h-12 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-pill bg-primary-soft flex items-center justify-center text-primary">
            <Megaphone className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Announcements & Notices</h3>
        </div>
        <Link
          href={"/announcements" as Route}
          className="w-7 h-7 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
          title="View all announcements"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Real Announcements List or Empty State */}
      {isError ? (
        <p className="text-xs text-foreground-muted text-center py-4">Announcements service unavailable.</p>
      ) : announcements.length > 0 ? (
        <div className="space-y-2">
          {announcements.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-card bg-surface-muted/60 border border-border-subtle flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                {item.publishedAt && (
                  <p className="text-[10px] text-foreground-muted font-mono">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary text-[10px] font-bold shrink-0">
                {item.priority || "NOTICE"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center flex flex-col items-center justify-center text-foreground-muted">
          <Inbox className="w-4 h-4 mb-1 opacity-70" />
          <p className="text-xs font-semibold text-foreground">No active announcements</p>
          <p className="text-[10px] text-foreground-muted">Tenant updates will appear here when published.</p>
        </div>
      )}

      {/* Quick Services Links */}
      <div className="pt-2 border-t border-border-subtle grid grid-cols-3 gap-2">
        <Link
          href={"/documents" as Route}
          className="p-2 rounded-control bg-surface-muted/50 hover:bg-surface-muted border border-border-subtle text-center transition flex flex-col items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-foreground-secondary">Documents</span>
        </Link>
        <Link
          href={"/compliance" as Route}
          className="p-2 rounded-control bg-surface-muted/50 hover:bg-surface-muted border border-border-subtle text-center transition flex flex-col items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-foreground-secondary">Policies</span>
        </Link>
        <Link
          href={"/helpdesk" as Route}
          className="p-2 rounded-control bg-surface-muted/50 hover:bg-surface-muted border border-border-subtle text-center transition flex flex-col items-center gap-1"
        >
          <LifeBuoy className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-foreground-secondary">Helpdesk</span>
        </Link>
      </div>
    </div>
  );
}
