"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function HelpdeskOverviewPage() {
  const [stats] = useState({
    totalTickets: 84,
    openTickets: 12,
    slaCompliance: 96.4,
    mttrHours: 3.2,
    csatScore: 4.8
  });

  const [categories] = useState([
    { name: "Hardware & Laptops", count: 28, open: 4, icon: "💻" },
    { name: "Software & SaaS Access", count: 22, open: 3, icon: "🔑" },
    { name: "Network & VPN", count: 14, open: 2, icon: "🌐" },
    { name: "Facilities & Office", count: 12, open: 2, icon: "🏢" },
    { name: "Payroll & HR Queries", count: 8, open: 1, icon: "💵" }
  ]);

  const [recentTickets] = useState([
    {
      id: "t-1",
      number: "TICK-00084",
      title: "Display flickering on Dell 32 Monitor",
      category: "HARDWARE",
      priority: "HIGH",
      requester: "Aarav Sharma",
      status: "IN_PROGRESS",
      dueIn: "3h 40m",
      assignee: "Rajesh IT"
    },
    {
      id: "t-2",
      number: "TICK-00083",
      title: "Google Cloud Sandbox access provisioning",
      category: "ACCESS",
      priority: "MEDIUM",
      requester: "Meera Nair",
      status: "ASSIGNED",
      dueIn: "14h 20m",
      assignee: "Suresh DevOps"
    },
    {
      id: "t-3",
      number: "TICK-00082",
      title: "Air conditioning leak in Executive Cabin 3",
      category: "FACILITIES",
      priority: "MEDIUM",
      requester: "Priya Menon",
      status: "RESOLVED",
      dueIn: "Met SLA",
      assignee: "Ramesh Admin"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎫 IT Service Management (ITSM) Helpdesk</h1>
          <p className="text-sm text-slate-600">
            Enterprise support ticketing, auto-assignment, multi-tier SLAs, and incident management.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/helpdesk/sla" as Route}>
            <Button variant="secondary">⏱️ SLA Matrix</Button>
          </Link>
          <Link href={"/helpdesk/tickets" as Route}>
            <Button variant="secondary">📋 View All Tickets</Button>
          </Link>
          <Button variant="primary">+ Create Ticket</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Ticket Queue</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.openTickets} Open</p>
          <p className="mt-1 text-xs text-slate-500">{stats.totalTickets} Total Raised This Month</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">SLA Compliance Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.slaCompliance}%</p>
          <p className="mt-1 text-xs text-emerald-600">Target: 95.0%</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Mean Time to Resolve (MTTR)</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{stats.mttrHours} Hours</p>
          <p className="mt-1 text-xs text-blue-600">-24% improvement vs Q2</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">CSAT Satisfaction</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">⭐ {stats.csatScore} / 5.0</p>
          <p className="mt-1 text-xs text-amber-600">Based on 68 user ratings</p>
        </Panel>
      </div>

      {/* Category Distribution Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">📂 Service Queues & Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat) => (
            <Panel key={cat.name} className="p-4 space-y-2">
              <div className="text-2xl">{cat.icon}</div>
              <h3 className="font-semibold text-slate-900 text-sm">{cat.name}</h3>
              <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>{cat.count} Raised</span>
                <span className="font-semibold text-amber-700">{cat.open} Active</span>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      {/* Active Priority Tickets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">⚡ High Priority & Active Incidents</h2>
          <Link href={"/helpdesk/tickets" as Route} className="text-xs font-semibold text-emerald-800 hover:underline">
            View full queue →
          </Link>
        </div>
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Requester</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4">SLA Due</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-medium text-slate-900">{t.number}</td>
                    <td className="p-4 font-semibold text-slate-900">{t.title}</td>
                    <td className="p-4">
                      <Badge tone="neutral">{t.category}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge tone={t.priority === "CRITICAL" ? "danger" : t.priority === "HIGH" ? "warning" : "neutral"}>
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-700">{t.requester}</td>
                    <td className="p-4 text-slate-700">{t.assignee}</td>
                    <td className="p-4 text-xs font-mono font-medium text-blue-700">{t.dueIn}</td>
                    <td className="p-4">
                      <Badge tone={t.status === "RESOLVED" ? "success" : "neutral"}>
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
