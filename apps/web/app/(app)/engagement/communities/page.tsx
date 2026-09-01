"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeCommunitiesPage() {
  const [communities] = useState([
    {
      id: "comm-1",
      name: "Engineering & Tech Innovators",
      icon: "💻",
      type: "DEPARTMENT",
      members: 42,
      posts: 128,
      desc: "Tech stack architecture discussions, code reviews, and tech deep dives."
    },
    {
      id: "comm-2",
      name: "Runners & Fitness Enthusiasts",
      icon: "🏃‍♂️",
      type: "SPORTS_WELLNESS",
      members: 35,
      posts: 94,
      desc: "Morning running groups, weekend cyclothons, and fitness tips."
    },
    {
      id: "comm-3",
      name: "Sustainability & Green Earth Club",
      icon: "🌱",
      type: "CULTURE_CLUB",
      members: 58,
      posts: 76,
      desc: "Zero-waste initiatives, tree plantation drives, and environmental ideas."
    },
    {
      id: "comm-4",
      name: "Book Club & Lifelong Learners",
      icon: "📚",
      type: "INTEREST_GROUP",
      members: 24,
      posts: 53,
      desc: "Monthly book reviews, leadership literature, and podcast discussions."
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/engagement" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Engagement Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">👥 Employee Communities & Interest Clubs</h1>
          <p className="text-sm text-slate-600">
            Connect with colleagues across departments around shared hobbies, engineering projects, and wellness activities.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Create Community</Button>
        </div>
      </div>

      {/* Community Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {communities.map((c) => (
          <Panel key={c.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.icon}</span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{c.name}</h2>
                    <span className="text-xs font-mono text-slate-500">
                      {c.members} Members • {c.posts} Posts
                    </span>
                  </div>
                </div>
                <Badge tone="neutral">{c.type}</Badge>
              </div>
              <p className="text-xs text-slate-600">{c.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Link href={"/engagement/social-wall" as Route}>
                <Button variant="secondary">View Feed 💬</Button>
              </Link>
              <Button variant="primary">Join Club</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
