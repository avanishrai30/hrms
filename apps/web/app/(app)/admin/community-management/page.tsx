"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AdminCommunityManagementPage() {
  const [communities] = useState([
    { id: "c1", name: "Engineering & Tech Innovators", type: "DEPARTMENT", members: 42, posts: 128, status: "ACTIVE" },
    { id: "c2", name: "Runners & Fitness Enthusiasts", type: "SPORTS_WELLNESS", members: 35, posts: 94, status: "ACTIVE" },
    { id: "c3", name: "Sustainability & Green Earth Club", type: "CULTURE_CLUB", members: 58, posts: 76, status: "ACTIVE" },
    { id: "c4", name: "Book Club & Lifelong Learners", type: "INTEREST_GROUP", members: 24, posts: 53, status: "ACTIVE" }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/engagement" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Engagement Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">👥 Community & Social Wall Governance</h1>
          <p className="text-sm text-slate-600">
            Moderate employee interest groups, review content policies, and foster cross-functional collaboration clubs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Create Official Club</Button>
        </div>
      </div>

      {/* Communities Table */}
      <Panel className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-sans">Community Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Members</th>
                <th className="py-2.5 px-3">Posts</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {communities.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">{c.name}</td>
                  <td className="py-3 px-3">{c.type}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{c.members}</td>
                  <td className="py-3 px-3">{c.posts}</td>
                  <td className="py-3 px-3">
                    <Badge tone="success">{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
