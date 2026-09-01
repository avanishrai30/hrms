"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AdminRewardsPage() {
  const [redemptions] = useState([
    {
      id: "rd-1",
      employee: "Avanish Rai",
      item: "Amazon Pay ₹1,000 E-Voucher",
      points: 1000,
      date: "Aug 28, 2026",
      status: "APPROVED"
    },
    {
      id: "rd-2",
      employee: "Pooja Hegde",
      item: "Cult.fit 1-Month Fitness Pass",
      points: 1200,
      date: "Aug 27, 2026",
      status: "FULFILLED"
    }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🎁 Rewards Catalog & Fulfillment Center</h1>
          <p className="text-sm text-slate-600">
            Manage rewards inventory, approve gift vouchers, and verify employee point redemptions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Add Catalog Item</Button>
        </div>
      </div>

      {/* Redemptions Table */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recent Redemption Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-sans">Employee</th>
                <th className="py-2.5 px-3 font-sans">Catalog Item</th>
                <th className="py-2.5 px-3">Points</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {redemptions.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">{r.employee}</td>
                  <td className="py-3 px-3 font-sans text-xs">{r.item}</td>
                  <td className="py-3 px-3 font-bold text-primary">{r.points} Pts</td>
                  <td className="py-3 px-3 text-slate-500">{r.date}</td>
                  <td className="py-3 px-3">
                    <Badge tone="success">{r.status}</Badge>
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
