"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { getOfflineData, saveOfflineData } from "../../../lib/offline-storage";
import type { AnnouncementPriority, AnnouncementView } from "@vc-wms/shared-types";

export default function AnnouncementsFeedPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New announcement form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("MEDIUM");
  const [isPinned, setIsPinned] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const res = await apiRequest<AnnouncementView[]>("/announcements");
      setAnnouncements(res);
      saveOfflineData("announcements_list", res);
    } catch (err: unknown) {
      const cached = getOfflineData<AnnouncementView[]>("announcements_list");
      if (cached) {
        setAnnouncements(cached);
      } else {
        setStatusMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load announcements"
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setStatusMsg(null);

    try {
      await apiRequest<AnnouncementView>("/announcements", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          priority,
          isPinned,
          notifyChannels: ["IN_APP", "PUSH"]
        })
      });
      setStatusMsg({ type: "success", text: "Announcement published and broadcasted!" });
      setShowCreateModal(false);
      setTitle("");
      setContent("");
      setIsPinned(false);
      loadAnnouncements();
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish announcement"
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Company Announcements & Communications</h1>
          <p className="text-sm text-zinc-500">
            Official broadcasts, townhall notes, HR policy updates, and team alerts
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          📢 Post Announcement
        </Button>
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

      {/* Announcements Feed */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-panel" />
          <div className="h-32 bg-muted animate-pulse rounded-panel" />
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Panel
              key={ann.id}
              className={`p-6 space-y-4 hover:border-primary/50 transition ${
                ann.isPinned ? "border-amber-500/40 bg-amber-500/5" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {ann.isPinned && <span className="text-xs font-bold text-amber-600">📌 PINNED</span>}
                  <Badge
                    tone={
                      ann.priority === "URGENT" || ann.priority === "HIGH"
                        ? "danger"
                        : ann.priority === "MEDIUM"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {ann.priority} PRIORITY
                  </Badge>
                  {ann.isAcknowledged && <Badge tone="success">✓ Acknowledged</Badge>}
                </div>
                <span className="text-xs text-zinc-500">
                  Published {new Date(ann.publishedAt).toLocaleDateString()} by {ann.authorName}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-zinc-950 text-lg">{ann.title}</h3>
                <p className="text-sm text-zinc-700 mt-2 whitespace-pre-wrap leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <span className="text-zinc-500">
                  {ann.acknowledgementCount ?? 0} colleagues acknowledged
                </span>
                <Link href={`/announcements/${ann.id}` as Route}>
                  <Button variant="secondary" className="text-xs">
                    Read & Acknowledge →
                  </Button>
                </Link>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel className="p-12 text-center space-y-3">
          <span className="text-4xl">📢</span>
          <h3 className="text-base font-semibold text-zinc-900">No Announcements</h3>
          <p className="text-sm text-zinc-500">Stay tuned for upcoming news and company updates.</p>
        </Panel>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Panel className="max-w-lg w-full p-6 space-y-6 bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-zinc-900">Post Company Announcement</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Headline Title</label>
                <Input
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Town Hall and Bonus Announcement"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Red Alert)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pinCheckbox"
                    checked={isPinned}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="pinCheckbox" className="text-xs font-semibold text-zinc-800">
                    Pin to top of feed
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                  rows={5}
                  className="w-full rounded-control border border-border bg-surface p-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Draft full message for company broadcast..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={creating}>
                  {creating ? "Publishing..." : "Broadcast Announcement"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
