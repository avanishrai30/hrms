"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function GeoFencePage() {
  const [fences] = useState([
    {
      id: "gf-1",
      siteName: "VC Organics Main Plant & Cold Storage",
      lat: 19.0760,
      lon: 72.8777,
      radius: "150 meters",
      maxAccuracy: "50m",
      activeStaff: 120,
      status: "ACTIVE"
    },
    {
      id: "gf-2",
      siteName: "BKC Corporate Technology Center",
      lat: 19.0657,
      lon: 72.8683,
      radius: "100 meters",
      maxAccuracy: "30m",
      activeStaff: 45,
      status: "ACTIVE"
    },
    {
      id: "gf-3",
      siteName: "Pune Central Fulfillment Hub",
      lat: 18.5204,
      lon: 73.8567,
      radius: "200 meters",
      maxAccuracy: "50m",
      activeStaff: 35,
      status: "ACTIVE"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/attendance/command-center" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Attendance Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📍 GPS & Geo-Fencing Attendance Perimeters</h1>
          <p className="text-sm text-slate-600">
            Define multi-site boundary fences, enforce Haversine radius validation, and detect mock GPS manipulation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Add Geofence Site</Button>
        </div>
      </div>

      {/* Geofences List */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Configured Geo-Fences ({fences.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Site Location Name</th>
                <th className="py-3 px-4">Center Coordinates</th>
                <th className="py-3 px-4">Authorized Radius</th>
                <th className="py-3 px-4">Max GPS Accuracy</th>
                <th className="py-3 px-4">Active Personnel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fences.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{f.siteName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                    {f.lat.toFixed(4)}° N, {f.lon.toFixed(4)}° E
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{f.radius}</td>
                  <td className="py-3.5 px-4 text-slate-600">{f.maxAccuracy}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{f.activeStaff} Checked In</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{f.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Edit Bounds</Button>
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
