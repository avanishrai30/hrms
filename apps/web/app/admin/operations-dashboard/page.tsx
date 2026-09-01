"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function OperationsDashboardPage() {
  const [metrics] = useState({
    assets: {
      total: 124,
      assigned: 98,
      utilization: 79.0,
      totalValuation: "₹1.42 Cr",
      bookValue: "₹96.4 Lakhs"
    },
    helpdesk: {
      totalMonth: 84,
      open: 12,
      slaCompliance: 96.4,
      mttrHours: 3.2
    },
    facilities: {
      roomUtilization: 68.4,
      deskOccupancy: 84.2,
      activeVehicles: 3
    },
    visitors: {
      todayCount: 14,
      activeOnPremise: 1
    },
    clearance: {
      activeClearances: 2,
      avgTurnaroundDays: 3.5
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📊 Enterprise Operations & ITSM Dashboard</h1>
          <p className="text-sm text-slate-600">
            Real-time executive oversight across hardware assets, ITSM SLA metrics, facilities, fleet, and physical security.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">💻 Asset Register</Button>
          </Link>
          <Link href={"/helpdesk" as Route}>
            <Button variant="secondary">🎫 ITSM Helpdesk</Button>
          </Link>
          <Link href={"/facilities" as Route}>
            <Button variant="secondary">🏢 Facilities</Button>
          </Link>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4 border-l-4 border-l-emerald-600 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Fleet Utilization</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.assets.utilization}%</p>
          <p className="text-xs text-emerald-600">{metrics.assets.assigned} / {metrics.assets.total} Hardware Assigned</p>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-blue-600 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Helpdesk SLA Rate</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.helpdesk.slaCompliance}%</p>
          <p className="text-xs text-blue-600">MTTR: {metrics.helpdesk.mttrHours} hrs ({metrics.helpdesk.open} open)</p>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-purple-600 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Office Desk Occupancy</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.facilities.deskOccupancy}%</p>
          <p className="text-xs text-purple-600">Meeting Rooms: {metrics.facilities.roomUtilization}% Active</p>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-600 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exit Turnaround</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.clearance.avgTurnaroundDays} Days</p>
          <p className="text-xs text-amber-600">{metrics.clearance.activeClearances} Active Clearances in Flight</p>
        </Panel>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hardware & Asset Valuation Panel */}
        <Panel className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">💻 Asset Health & Valuation</h2>
            <Link href={"/assets/depreciation" as Route} className="text-xs font-semibold text-emerald-800 hover:underline">
              View Schedules →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="text-xs text-slate-500 block">Gross Acquisition Valuation</span>
              <span className="text-lg font-bold text-slate-900">{metrics.assets.totalValuation}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="text-xs text-slate-500 block">Net Carrying Book Value</span>
              <span className="text-lg font-bold text-emerald-800">{metrics.assets.bookValue}</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Laptops & MacBooks:</span>
              <span className="font-semibold text-slate-900">64 Units</span>
            </div>
            <div className="flex justify-between">
              <span>Monitors & Displays:</span>
              <span className="font-semibold text-slate-900">42 Units</span>
            </div>
            <div className="flex justify-between">
              <span>Biometric & Network Devices:</span>
              <span className="font-semibold text-slate-900">18 Units</span>
            </div>
          </div>
        </Panel>

        {/* ITSM Support & SLA Panel */}
        <Panel className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">🎫 ITSM Queue & SLA Health</h2>
            <Link href={"/helpdesk/sla" as Route} className="text-xs font-semibold text-emerald-800 hover:underline">
              SLA Analytics →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="text-xs text-emerald-700 font-semibold block">Critical Tier</span>
              <span className="text-lg font-bold text-emerald-800">100%</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="text-xs text-emerald-700 font-semibold block">High Tier</span>
              <span className="text-lg font-bold text-emerald-800">95.8%</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="text-xs text-emerald-700 font-semibold block">Medium Tier</span>
              <span className="text-lg font-bold text-emerald-800">94.7%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Average ticket resolution time across all departments is currently 3.2 hours against an enterprise target of 4.0 hours.
          </p>
        </Panel>

        {/* Physical Infrastructure & Fleet */}
        <Panel className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">🏢 Physical Workspaces & Corporate Fleet</h2>
            <Link href={"/facilities" as Route} className="text-xs font-semibold text-emerald-800 hover:underline">
              Facilities Hub →
            </Link>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="font-medium text-slate-700">Meeting Room Capacity Utilization:</span>
              <Badge tone="success">{metrics.facilities.roomUtilization}%</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="font-medium text-slate-700">Dedicated & Hot Desk Seating Occupancy:</span>
              <Badge tone="success">{metrics.facilities.deskOccupancy}%</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="font-medium text-slate-700">Active Company Vehicles Available:</span>
              <Badge tone="neutral">{metrics.facilities.activeVehicles} Vehicles</Badge>
            </div>
          </div>
        </Panel>

        {/* Security, Visitors & Exit Clearance */}
        <Panel className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base">🛡️ Physical Security & Exit Recovery</h2>
            <Link href={"/clearance" as Route} className="text-xs font-semibold text-emerald-800 hover:underline">
              Exit Portal →
            </Link>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="font-medium text-slate-700">Guests Logged Today:</span>
              <span className="font-bold text-slate-900">{metrics.visitors.todayCount} Visitors</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="font-medium text-slate-700">Security Gate Passes Cleared:</span>
              <span className="font-bold text-slate-900">8 Outward / 3 Inward</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
              <span className="font-medium text-slate-700">100% Asset Recovery Rate on Exits:</span>
              <Badge tone="success">100% Compliant</Badge>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
