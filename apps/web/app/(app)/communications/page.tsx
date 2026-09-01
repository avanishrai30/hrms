"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  isPinned: boolean;
  publishedAt: string;
}

export default function CommunicationsHubPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunications() {
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
    loadCommunications();
  }, []);

  const getPriorityTone = (p: string): "neutral" | "success" | "warning" | "danger" => {
    switch (p) {
      case "URGENT":
        return "danger";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Internal Communications & Broadcasts</h1>
          <p className="text-sm text-muted-foreground">
            Official executive announcements, corporate updates, policies, and company circulars.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/communications/news" as Route}>
            <Button variant="secondary">Company News</Button>
          </Link>
          <Link href={"/communications/policies" as Route}>
            <Button>Policies & SOPs</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <Panel className="p-8 text-center text-muted-foreground">No recent announcements published.</Panel>
        ) : (
          announcements.map((ann) => (
            <Panel key={ann.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {ann.isPinned && <span className="text-xs text-primary font-bold">📌 PINNED</span>}
                  <h3 className="text-base font-bold text-foreground">{ann.title}</h3>
                </div>
                <Badge tone={getPriorityTone(ann.priority)}>{ann.priority}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border flex justify-between">
                <span>Published on {new Date(ann.publishedAt).toLocaleDateString()}</span>
                <span className="text-primary font-medium">Corporate HR & Leadership</span>
              </div>
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}
