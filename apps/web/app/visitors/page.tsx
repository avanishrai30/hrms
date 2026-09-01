"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function VisitorManagementPage() {
  const [visitors] = useState([
    {
      id: "v-1",
      passCode: "VP-998811",
      name: "Rohan Verma",
      company: "Deloitte Digital",
      phone: "+91 98450 11223",
      host: "Aarav Sharma (Engineering)",
      purpose: "Enterprise Client Architecture Discussion",
      status: "CHECKED_IN",
      checkInTime: "10:15 AM",
      badgeNumber: "B-402"
    },
    {
      id: "v-2",
      passCode: "VP-442299",
      name: "Sneha Kapur",
      company: "KPMG Advisory",
      phone: "+91 99887 66554",
      host: "Priya Menon (Finance)",
      purpose: "Statutory Financial Audit Review",
      status: "PRE_REGISTERED",
      checkInTime: "—",
      badgeNumber: "—"
    },
    {
      id: "v-3",
      passCode: "VP-112233",
      name: "Vikram Das",
      company: "AWS India",
      phone: "+91 91234 56789",
      host: "Suresh DevOps",
      purpose: "Cloud Infrastructure Well-Architected Review",
      status: "CHECKED_OUT",
      checkInTime: "09:00 AM - 11:30 AM",
      badgeNumber: "B-301"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🛂 Visitor Management & Digital Gate Passes</h1>
          <p className="text-sm text-slate-600">
            Pre-registration, QR check-in & check-out, host notifications, and visitor badge issuance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/gate-passes" as Route}>
            <Button variant="secondary">🚪 Gate Passes</Button>
          </Link>
          <Button variant="secondary">+ Walk-in Check In</Button>
          <Button variant="primary">+ Pre-Register Visitor</Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Total Visitors</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">14 Visitors</p>
          <p className="mt-1 text-xs text-slate-500">Scheduled & Walk-ins</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Currently on Premises</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">1 Guest</p>
          <p className="mt-1 text-xs text-emerald-600">Active visitor badges active</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Pre-Registered Expected</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">1 Guest</p>
          <p className="mt-1 text-xs text-blue-600">QR code emailed to guest</p>
        </Panel>
      </div>

      {/* Visitors Table */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Pass Code</th>
                <th className="p-4">Guest Name</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Host Employee</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Timing</th>
                <th className="p-4">Badge</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-emerald-800">{v.passCode}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.phone}</div>
                  </td>
                  <td className="p-4 text-slate-700">{v.company}</td>
                  <td className="p-4 text-slate-700 font-medium">{v.host}</td>
                  <td className="p-4 text-xs text-slate-600 max-w-xs truncate">{v.purpose}</td>
                  <td className="p-4 text-xs text-slate-700">{v.checkInTime}</td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-900">{v.badgeNumber}</td>
                  <td className="p-4">
                    <Badge
                      tone={
                        v.status === "CHECKED_IN"
                          ? "success"
                          : v.status === "PRE_REGISTERED"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {v.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    {v.status === "PRE_REGISTERED" ? (
                      <Button variant="primary">Check In</Button>
                    ) : v.status === "CHECKED_IN" ? (
                      <Button variant="secondary">Check Out</Button>
                    ) : (
                      <Button variant="secondary">Print Pass</Button>
                    )}
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
