"use client";

import { use, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { AnnouncementView } from "@vc-wms/shared-types";

export default function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [ann, setAnn] = useState<AnnouncementView | null>(null);
  const [loading, setLoading] = useState(true);
  const [acking, setAcking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest<AnnouncementView>(`/announcements/${resolvedParams.id}`);
        setAnn(res);
      } catch (err: unknown) {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load announcement"
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  async function handleAcknowledge() {
    setAcking(true);
    try {
      await apiRequest(`/announcements/${resolvedParams.id}/acknowledge`, { method: "POST" });
      setStatusMsg({ type: "success", text: "You have acknowledged this announcement." });
      setAnn((prev) => (prev ? { ...prev, isAcknowledged: true, acknowledgedAt: new Date().toISOString() } : null));
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to record acknowledgement"
      });
    } finally {
      setAcking(false);
    }
  }

  if (loading && !ann) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="h-28 bg-muted animate-pulse rounded-panel" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Company Announcement</h1>
          <p className="text-sm text-zinc-500">Broadcast from leadership & HR</p>
        </div>
        <Link href={"/announcements" as Route}>
          <Button variant="secondary">← Back to Feed</Button>
        </Link>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-control text-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-700"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <Panel className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            {ann?.isPinned && <span className="text-sm font-bold text-amber-600">📌 Pinned</span>}
            <Badge
              tone={
                ann?.priority === "URGENT" || ann?.priority === "HIGH"
                  ? "danger"
                  : ann?.priority === "MEDIUM"
                  ? "warning"
                  : "neutral"
              }
            >
              {ann?.priority} PRIORITY
            </Badge>
          </div>
          <span className="text-xs text-zinc-500">
            Published {ann?.publishedAt ? new Date(ann.publishedAt).toLocaleString() : ""} by {ann?.authorName}
          </span>
        </div>

        <h2 className="text-xl font-bold text-zinc-950">{ann?.title}</h2>

        <div className="prose prose-zinc max-w-none text-zinc-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {ann?.content}
        </div>

        {/* Acknowledgement Status & Action */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {ann?.isAcknowledged ? (
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                <span>✓ You acknowledged this announcement on</span>
                <span>{ann.acknowledgedAt ? new Date(ann.acknowledgedAt).toLocaleString() : "Recently"}</span>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Please review and click acknowledge to confirm you have read and understood this notice.
              </p>
            )}
          </div>

          {!ann?.isAcknowledged && (
            <Button variant="primary" onClick={handleAcknowledge} disabled={acking}>
              {acking ? "Recording..." : "✓ I Acknowledge"}
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
}
