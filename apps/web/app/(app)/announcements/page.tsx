"use client";

import React from "react";
import {
  Pin,
  CheckCircle2,
  Inbox,
  AlertCircle
} from "lucide-react";
import {
  useAnnouncements,
  useAcknowledgeAnnouncementMutation
} from "../../../lib/queries/use-ess-queries";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

export default function TenantAnnouncementsPage() {
  const { data: announcements = [], isLoading, isError, refetch } = useAnnouncements();
  const ackMutation = useAcknowledgeAnnouncementMutation();

  const handleAcknowledge = async (id: string) => {
    try {
      await ackMutation.mutateAsync(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to acknowledge announcement");
    }
  };

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const regularAnnouncements = announcements.filter((a) => !a.isPinned);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements & Notices</h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Official company broadcasts, policy revisions, and workplace communications.
        </p>
      </div>

      {/* 2. Announcements Stream */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader className="h-32 rounded-card" />
          <SkeletonLoader className="h-28 rounded-card" />
        </div>
      ) : isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Announcements unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {/* Pinned Section */}
          {pinnedAnnouncements.map((a) => (
            <div
              key={a.id}
              className="rounded-card bg-gradient-to-br from-[#E2E0FC]/70 via-[#D3D0F8]/50 to-[#C4C0F4]/40 border-2 border-primary/30 p-6 shadow-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-primary text-white">
                    <Pin className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Pinned Broadcast</span>
                  <span className="px-2 py-0.5 rounded-pill bg-primary/20 text-primary text-[10px] font-bold">
                    {a.priority || "NORMAL"}
                  </span>
                </div>

                {a.publishedAt && (
                  <span className="text-[11px] text-zinc-600 font-mono">
                    {new Date(a.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-zinc-950">{a.title}</h2>
              <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">{a.content}</p>

              <div className="pt-3 border-t border-primary/20 flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">
                  Author: {a.author?.email || "Organization Admin"}
                </span>

                <button
                  onClick={() => handleAcknowledge(a.id)}
                  disabled={ackMutation.isPending}
                  className="px-3 py-1.5 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
              </div>
            </div>
          ))}

          {/* Regular Announcements */}
          {regularAnnouncements.map((a) => (
            <div
              key={a.id}
              className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary text-[10px] font-bold">
                    {a.priority || "NOTICE"}
                  </span>
                  <span className="text-[11px] text-foreground-muted font-mono">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed whitespace-pre-wrap">{a.content}</p>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[11px] text-foreground-muted">
                  Author: {a.author?.email || "Administration"}
                </span>

                <button
                  onClick={() => handleAcknowledge(a.id)}
                  disabled={ackMutation.isPending}
                  className="px-3 py-1 rounded-control bg-surface-muted hover:bg-muted text-foreground text-xs font-semibold transition inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>Acknowledge</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Inbox className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No active announcements</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">
            Organization broadcasts will be delivered to this feed when published.
          </p>
        </div>
      )}
    </div>
  );
}
