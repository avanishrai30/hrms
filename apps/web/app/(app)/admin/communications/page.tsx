"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  isPinned: boolean;
  publishedAt: string;
}

export default function AdminCommunicationsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isPinned, setIsPinned] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await apiRequest<AnnouncementItem[]>("/announcements");
        setAnnouncements(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPublishing(true);
      await apiRequest("/announcements", {
        method: "POST",
        body: JSON.stringify({ title, content, priority, isPinned })
      });
      setShowModal(false);
      setTitle("");
      setContent("");
      const res = await apiRequest<AnnouncementItem[]>("/announcements");
      setAnnouncements(res || []);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to publish broadcast");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enterprise Communications & News Center</h1>
          <p className="text-sm text-muted-foreground">
            Publish targeted company-wide notices, policy circulars, executive broadcasts, and culture news.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/communications" as Route}>
            <Button variant="secondary">View Broadcast Hub</Button>
          </Link>
          <Button onClick={() => setShowModal(true)}>+ New Broadcast</Button>
        </div>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Active Broadcasts ({announcements.length})</h3>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading broadcasts...</div>
        ) : (
          <div className="divide-y divide-border">
            {announcements.map((a) => (
              <div key={a.id} className="py-3 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{a.title}</h4>
                    {a.isPinned && <Badge tone="neutral">Pinned</Badge>}
                    <Badge tone={a.priority === "URGENT" ? "danger" : "neutral"}>{a.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Published: {new Date(a.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Panel className="w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Publish Company Broadcast</h2>
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Broadcast Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Q3 Town Hall & Performance Bonus Announcement"
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent / Alert</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="pinned" className="text-xs font-medium text-foreground">Pin to top</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Broadcast Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  placeholder="Write message content here..."
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={publishing}>
                  {publishing ? "Publishing..." : "Publish Broadcast"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
