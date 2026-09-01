"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeRewardsPage() {
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🎁 Rewards & Recognition Center</h1>
          <p className="text-sm text-slate-600">
            View your accrued reward points, redeem gift cards & experiences, and track past orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/engagement/catalog" as Route}>
            <Button variant="primary">Browse Catalog 🛍️</Button>
          </Link>
          <Link href={"/engagement/wallet" as Route}>
            <Button variant="secondary">View Ledger 💳</Button>
          </Link>
        </div>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 font-mono">
        <Panel className="p-5 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Available Balance</span>
          <div className="mt-1 text-3xl font-bold text-slate-900">1,250 Pts</div>
          <span className="text-xs font-sans text-emerald-600 font-medium">₹1,250 INR Value</span>
        </Panel>
        <Panel className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Lifetime Earned</span>
          <div className="mt-1 text-3xl font-bold text-emerald-700">4,800 Pts</div>
          <span className="text-xs font-sans text-slate-500">Tier: Values Ambassador</span>
        </Panel>
        <Panel className="p-5 border-l-4 border-l-purple-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Total Redeemed</span>
          <div className="mt-1 text-3xl font-bold text-purple-700">3,550 Pts</div>
          <span className="text-xs font-sans text-slate-500">4 items claimed</span>
        </Panel>
      </div>

      {/* Recent Redemptions */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recent Redemptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500 font-mono">
              <tr>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Points</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700 font-mono">
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-900">Amazon Pay ₹1,000 E-Voucher</td>
                <td className="py-3 px-3">GIFT_CARD</td>
                <td className="py-3 px-3 font-bold text-slate-900">1,000 Pts</td>
                <td className="py-3 px-3 text-slate-500">Aug 20, 2026</td>
                <td className="py-3 px-3">
                  <Badge tone="success">FULFILLED</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-900">BookMyShow ₹500 Movie Card</td>
                <td className="py-3 px-3">EXPERIENCE</td>
                <td className="py-3 px-3 font-bold text-slate-900">500 Pts</td>
                <td className="py-3 px-3 text-slate-500">Jul 12, 2026</td>
                <td className="py-3 px-3">
                  <Badge tone="success">FULFILLED</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
