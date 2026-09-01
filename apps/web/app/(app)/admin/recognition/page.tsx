"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AdminRecognitionPage() {
  const [badges] = useState([
    { id: "b1", name: "Core Values Champion", category: "CORE_VALUES", points: 150, active: true },
    { id: "b2", name: "Innovation Star", category: "INNOVATOR", points: 100, active: true },
    { id: "b3", name: "Team Player Legend", category: "TEAM_PLAYER", points: 100, active: true },
    { id: "b4", name: "Customer Delight", category: "CUSTOMER_DELIGHT", points: 100, active: true }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏆 Recognition Badges & Budget Control</h1>
          <p className="text-sm text-slate-600">
            Configure company recognition badges, define point values, and monitor department reward point distributions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Add Badge</Button>
        </div>
      </div>

      {/* Badges Table */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Active Recognition Badges</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-sans">Badge Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Point Value</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {badges.map((b) => (
                <tr key={b.id}>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">{b.name}</td>
                  <td className="py-3 px-3">{b.category}</td>
                  <td className="py-3 px-3 font-bold text-primary">+{b.points} Pts</td>
                  <td className="py-3 px-3">
                    <Badge tone="success">ACTIVE</Badge>
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
