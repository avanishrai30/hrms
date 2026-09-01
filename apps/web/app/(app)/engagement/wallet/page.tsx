"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Panel } from "../../../../components/ui";

export default function EmployeeWalletPage() {
  const [transactions] = useState([
    {
      id: "tx-1",
      date: "Aug 28, 2026",
      type: "POINTS_EARNED",
      points: 100,
      balanceAfter: 1250,
      reference: "Kudos from Rahul Sharma: Innovation Star",
      category: "RECOGNITION"
    },
    {
      id: "tx-2",
      date: "Aug 20, 2026",
      type: "POINTS_REDEEMED",
      points: 1000,
      balanceAfter: 1150,
      reference: "Redemption: Amazon Pay ₹1,000 Voucher",
      category: "REDEMPTION"
    },
    {
      id: "tx-3",
      date: "Aug 15, 2026",
      type: "POINTS_EARNED",
      points: 500,
      balanceAfter: 2150,
      reference: "Award: Hackathon 2nd Place Solution",
      category: "CHALLENGE_WIN"
    },
    {
      id: "tx-4",
      date: "Aug 02, 2026",
      type: "POINTS_EARNED",
      points: 50,
      balanceAfter: 1650,
      reference: "Kudos from Priya Patel: Team Player",
      category: "RECOGNITION"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/engagement/rewards" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Rewards Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">💳 Reward Points Ledger</h1>
          <p className="text-sm text-slate-600">
            Transparent audit history of all earned, redeemed, and adjusted recognition reward points.
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <Panel className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Points</th>
                <th className="py-2.5 px-3">Balance</th>
                <th className="py-2.5 px-3">Reference / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 px-3 text-slate-500">{tx.date}</td>
                  <td className="py-3 px-3">
                    <Badge tone={tx.type === "POINTS_EARNED" ? "success" : "warning"}>
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-bold">
                    {tx.type === "POINTS_EARNED" ? `+${tx.points}` : `-${tx.points}`}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{tx.balanceAfter} Pts</td>
                  <td className="py-3 px-3 font-sans text-xs text-slate-600">{tx.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
