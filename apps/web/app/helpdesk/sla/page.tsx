"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function SLAPerformancePage() {
  const [slaMatrix] = useState([
    {
      priority: "CRITICAL",
      responseTarget: "15 Minutes",
      resolutionTarget: "2 Hours",
      totalTickets: 8,
      breaches: 0,
      compliance: 100,
      avgResponse: "8 mins",
      avgResolution: "1.2 hours"
    },
    {
      priority: "HIGH",
      responseTarget: "2 Hours",
      resolutionTarget: "8 Hours",
      totalTickets: 24,
      breaches: 1,
      compliance: 95.8,
      avgResponse: "42 mins",
      avgResolution: "4.8 hours"
    },
    {
      priority: "MEDIUM",
      responseTarget: "8 Hours",
      resolutionTarget: "24 Hours",
      totalTickets: 38,
      breaches: 2,
      compliance: 94.7,
      avgResponse: "2.1 hours",
      avgResolution: "14.5 hours"
    },
    {
      priority: "LOW",
      responseTarget: "24 Hours",
      resolutionTarget: "72 Hours",
      totalTickets: 14,
      breaches: 0,
      compliance: 100,
      avgResponse: "5.4 hours",
      avgResolution: "36.0 hours"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">⏱️ ITSM SLA Performance & Escalations</h1>
          <p className="text-sm text-slate-600">
            Priority response & resolution compliance targets, breach tracking, and resolution trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/helpdesk" as Route}>
            <Button variant="secondary">🎫 Helpdesk</Button>
          </Link>
          <Link href={"/helpdesk/tickets" as Route}>
            <Button variant="secondary">📋 Tickets</Button>
          </Link>
        </div>
      </div>

      {/* SLA Target Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {slaMatrix.map((item) => (
          <Panel key={item.priority} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                tone={
                  item.priority === "CRITICAL"
                    ? "danger"
                    : item.priority === "HIGH"
                    ? "warning"
                    : "neutral"
                }
              >
                {item.priority}
              </Badge>
              <span className="text-sm font-bold text-emerald-700">{item.compliance}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Response Target: <span className="font-semibold text-slate-900">{item.responseTarget}</span></p>
              <p className="text-xs text-slate-500">Resolution Target: <span className="font-semibold text-slate-900">{item.resolutionTarget}</span></p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs flex justify-between text-slate-600">
              <span>{item.totalTickets} Tickets</span>
              <span className={item.breaches > 0 ? "text-rose-600 font-semibold" : "text-emerald-600"}>
                {item.breaches} Breached
              </span>
            </div>
          </Panel>
        ))}
      </div>

      {/* SLA Table Breakdown */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Priority Tier</th>
                <th className="p-4">Target Response</th>
                <th className="p-4">Target Resolution</th>
                <th className="p-4">Volume</th>
                <th className="p-4">Avg Response Time</th>
                <th className="p-4">Avg Resolution (MTTR)</th>
                <th className="p-4">Breaches</th>
                <th className="p-4 text-right">Compliance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slaMatrix.map((m) => (
                <tr key={m.priority} className="hover:bg-slate-50">
                  <td className="p-4">
                    <Badge
                      tone={
                        m.priority === "CRITICAL"
                          ? "danger"
                          : m.priority === "HIGH"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {m.priority}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-700">{m.responseTarget}</td>
                  <td className="p-4 text-slate-700">{m.resolutionTarget}</td>
                  <td className="p-4 font-semibold text-slate-900">{m.totalTickets}</td>
                  <td className="p-4 text-blue-700 font-medium">{m.avgResponse}</td>
                  <td className="p-4 text-slate-700">{m.avgResolution}</td>
                  <td className="p-4 font-bold text-rose-600">{m.breaches}</td>
                  <td className="p-4 text-right font-bold text-emerald-700">{m.compliance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
