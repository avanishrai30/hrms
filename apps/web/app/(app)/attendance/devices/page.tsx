"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";

export default function BiometricDevicesPage() {
  const [showModal, setShowModal] = useState(false);
  const [devName, setDevName] = useState("");
  const [serial, setSerial] = useState("");

  const [devices] = useState([
    {
      id: "dev-1",
      name: "Warehouse North Gate Turnstile",
      vendor: "ESSL",
      model: "SilkBio-101TC",
      serial: "ESSL-WH-N01",
      ip: "192.168.10.45",
      location: "Main Plant Warehouse",
      syncMode: "PUSH (ADMS)",
      lastSync: "Just now",
      status: "ONLINE"
    },
    {
      id: "dev-2",
      name: "HQ Corporate Reception Kiosk",
      vendor: "ZKTECO",
      model: "FaceDepot-7B",
      serial: "ZK-HQ-REC02",
      ip: "192.168.1.120",
      location: "Corporate Office",
      syncMode: "REALTIME",
      lastSync: "1 min ago",
      status: "ONLINE"
    },
    {
      id: "dev-3",
      name: "Cold-Chain Facility Gate 2",
      vendor: "MATRIX",
      model: "COSEC Vega CAX",
      serial: "MTX-CC-G02",
      ip: "192.168.20.12",
      location: "Cold Storage Unit 3",
      syncMode: "PUSH",
      lastSync: "3 mins ago",
      status: "ONLINE"
    },
    {
      id: "dev-4",
      name: "Packaging Line 4 Terminal",
      vendor: "SUPREMA",
      model: "BioStation 3",
      serial: "SUP-PKG-L04",
      ip: "192.168.30.88",
      location: "Packaging Hub",
      syncMode: "PULL (CRON)",
      lastSync: "18 mins ago",
      status: "OFFLINE"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📟 Biometric Device Master Fleet</h1>
          <p className="text-sm text-slate-600">
            Register and monitor hardware terminals across factories, logistics hubs, and corporate turnstiles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Register Device
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Register Biometric Hardware Terminal</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Device Name">
                <Input placeholder="e.g. Processing Floor Terminal 1" value={devName} onChange={(e) => setDevName(e.target.value)} />
              </Field>
              <Field label="Vendor Protocol">
                <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none">
                  <option value="ESSL">eSSL (Push ADMS)</option>
                  <option value="ZKTECO">ZKTeco (Face / Fingerprint)</option>
                  <option value="MATRIX">Matrix COSEC</option>
                  <option value="SUPREMA">Suprema BioStation</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Serial Number">
                <Input placeholder="e.g. ESSL-WH-094" value={serial} onChange={(e) => setSerial(e.target.value)} />
              </Field>
              <Field label="IP Address">
                <Input placeholder="192.168.10.50" defaultValue="192.168.10.50" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Register Terminal
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Device Fleet Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Registered Terminals ({devices.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Terminal Name & Serial</th>
                <th className="py-3 px-4">Vendor & Model</th>
                <th className="py-3 px-4">Site Location</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Sync Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{d.name}</div>
                    <div className="font-mono text-xs text-slate-500">{d.serial}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-semibold text-slate-900">{d.vendor}</div>
                    <div className="text-slate-500">{d.model}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700">{d.location}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{d.ip}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-primary">{d.syncMode}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={d.status === "ONLINE" ? "success" : "danger"}>
                      {d.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Sync Now</Button>
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
