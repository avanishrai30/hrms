"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeSocialWallPage() {
  const [posts] = useState([
    {
      id: "post-1",
      author: "Aditi Rao",
      role: "Culture Committee Lead",
      community: "Company-wide Announcement",
      type: "ANNOUNCEMENT",
      content: "🎉 Celebrating our 5th Company Anniversary this Friday! Join us in the town hall for team games, festive lunch, and milestone awards distribution.",
      likes: 34,
      commentsCount: 8,
      time: "1 hour ago"
    },
    {
      id: "post-2",
      author: "Siddharth Sen",
      role: "DevOps Engineer",
      community: "Engineering & Tech Innovators",
      type: "GENERAL",
      content: "🚀 Just completed the zero-downtime deployment for the new HRMS payroll & compensation pipeline! Huge shoutout to the infrastructure team for smooth execution.",
      likes: 21,
      commentsCount: 4,
      time: "3 hours ago"
    },
    {
      id: "post-3",
      author: "Neha Kapoor",
      role: "Talent Acquisition",
      community: "Runners & Fitness Enthusiasts",
      type: "EVENT",
      content: "🏃‍♀️ Join our upcoming weekend 10K Cyclothon & Run! Meeting at the city botanical garden this Sunday at 6:30 AM. All fitness levels welcome!",
      likes: 15,
      commentsCount: 6,
      time: "Yesterday"
    }
  ]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/engagement" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Engagement Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📱 Company Social Wall & Feed</h1>
          <p className="text-sm text-slate-600">
            Share updates, milestone celebrations, interest group events, and team cheer.
          </p>
        </div>
      </div>

      {/* Create Post Box */}
      <Panel className="p-4 space-y-3">
        <textarea
          rows={3}
          placeholder="Share an achievement, team update, or shoutout..."
          className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:border-primary focus:outline-none"
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500 font-mono">📷 Add Media / Poll</span>
          <Button variant="primary">Post to Wall 🚀</Button>
        </div>
      </Panel>

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.map((p) => (
          <Panel key={p.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  {p.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{p.author}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    {p.role} • <span className="text-primary">{p.community}</span> • {p.time}
                  </div>
                </div>
              </div>
              <Badge tone="neutral">{p.type}</Badge>
            </div>

            <p className="text-sm text-slate-800 whitespace-pre-line">{p.content}</p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
              <div className="flex gap-4">
                <button className="font-bold text-slate-600 hover:text-primary">
                  ❤️ {p.likes} Likes
                </button>
                <button className="text-slate-500 hover:text-slate-800">
                  💬 {p.commentsCount} Comments
                </button>
              </div>
              <button className="text-slate-500 hover:text-slate-800">Share 🔗</button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
