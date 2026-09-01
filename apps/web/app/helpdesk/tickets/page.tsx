"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function TicketsQueuePage() {
  const [selectedTicket, setSelectedTicket] = useState<string>("t-1");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const [tickets] = useState([
    {
      id: "t-1",
      number: "TICK-00084",
      title: "Display flickering on Dell 32 Monitor",
      category: "HARDWARE",
      priority: "HIGH",
      requester: "Aarav Sharma",
      requesterEmail: "aarav@vcorganics.com",
      status: "IN_PROGRESS",
      createdAt: "2026-09-01 09:30 AM",
      dueIn: "3h 40m",
      assignee: "Rajesh IT",
      description: "My external monitor started flickering intermittently after the latest OS update. Tried re-plugging HDMI and Type-C cables but issue persists.",
      comments: [
        {
          id: "c-1",
          author: "Rajesh IT",
          message: "Please test with the high-speed certified Thunderbolt cable from the IT store (Bin A1).",
          time: "10:15 AM",
          isInternal: false
        },
        {
          id: "c-2",
          author: "Rajesh IT",
          message: "Internal Note: If cable swap does not resolve, replacement unit is available in Shelf 2.",
          time: "10:16 AM",
          isInternal: true
        }
      ]
    },
    {
      id: "t-2",
      number: "TICK-00083",
      title: "Google Cloud Sandbox access provisioning",
      category: "ACCESS",
      priority: "MEDIUM",
      requester: "Meera Nair",
      requesterEmail: "meera@vcorganics.com",
      status: "ASSIGNED",
      createdAt: "2026-09-01 08:45 AM",
      dueIn: "14h 20m",
      assignee: "Suresh DevOps",
      description: "Need IAM role 'roles/viewer' on project vcwms-staging-ai to inspect analytics logs.",
      comments: []
    }
  ]);

  const activeTicket = tickets.find((t) => t.id === selectedTicket) || tickets[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📋 Support Ticket Management</h1>
          <p className="text-sm text-slate-600">
            Interactive ticket queue, internal engineering notes, comments, and resolution workflow.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/helpdesk" as Route}>
            <Button variant="secondary">🎫 Overview</Button>
          </Link>
          <Button variant="primary">+ New Ticket</Button>
        </div>
      </div>

      {/* Main Split Layout: Ticket List on Left, Active Detail on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Ticket Queue List */}
        <div className="lg:col-span-5 space-y-4">
          <Panel className="p-3">
            <div className="flex gap-2">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    filterPriority === p
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Panel>

          <div className="space-y-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTicket === t.id
                    ? "bg-emerald-50/60 border-emerald-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700">{t.number}</span>
                  <Badge tone={t.priority === "HIGH" ? "warning" : "neutral"}>
                    {t.priority}
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{t.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 mt-1">{t.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 mt-2 border-t border-slate-100">
                  <span>{t.requester}</span>
                  <span className="font-mono font-medium text-emerald-800">Due: {t.dueIn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Conversation & Actions */}
        <div className="lg:col-span-7 space-y-4">
          {activeTicket ? (
            <Panel className="p-6 space-y-6">
              {/* Header Details */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-800">
                      {activeTicket.number}
                    </span>
                    <Badge tone="neutral">{activeTicket.category}</Badge>
                    <Badge tone={activeTicket.priority === "HIGH" ? "warning" : "neutral"}>
                      {activeTicket.priority}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{activeTicket.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Raised by {activeTicket.requester} ({activeTicket.requesterEmail}) on {activeTicket.createdAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary">Reassign</Button>
                  <Button variant="primary">Resolve</Button>
                </div>
              </div>

              {/* Description Body */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Issue Description
                </p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{activeTicket.description}</p>
              </div>

              {/* Thread & Comments */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Activity & Comments Timeline</h3>
                {activeTicket.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg text-sm border ${
                      c.isInternal
                        ? "bg-amber-50/80 border-amber-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-900 flex items-center gap-2">
                        {c.author}
                        {c.isInternal && (
                          <Badge tone="warning">INTERNAL NOTE</Badge>
                        )}
                      </span>
                      <span className="text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-slate-700 text-xs">{c.message}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={isInternal ? "Write an internal note (visible only to IT agents)..." : "Reply to user..."}
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Make this an Internal Note</span>
                  </label>
                  <Button
                    variant={isInternal ? "secondary" : "primary"}
                    disabled={!commentText.trim()}
                  >
                    {isInternal ? "Post Internal Note" : "Send Response"}
                  </Button>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel className="p-8 text-center text-slate-500">Select a ticket to view details</Panel>
          )}
        </div>
      </div>
    </div>
  );
}
