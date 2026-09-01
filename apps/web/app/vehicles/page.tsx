"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function VehiclesPage() {
  const [vehicles] = useState([
    {
      id: "veh-1",
      regNo: "KA 01 MJ 8821",
      make: "Toyota",
      model: "Innova HyCross",
      type: "MPV",
      capacity: 7,
      driverName: "Manoj Kumar",
      driverPhone: "+91 98860 12345",
      odometer: "28,450 km",
      status: "AVAILABLE",
      insuranceExpiry: "2027-03-15"
    },
    {
      id: "veh-2",
      regNo: "KA 05 AB 4410",
      make: "Tata",
      model: "Nexon EV Max",
      type: "ELECTRIC SUV",
      capacity: 5,
      driverName: "Sunil Gowda",
      driverPhone: "+91 97410 54321",
      odometer: "14,200 km",
      status: "IN_TRANSIT",
      insuranceExpiry: "2027-01-20"
    },
    {
      id: "veh-3",
      regNo: "KA 01 EF 9012",
      make: "Mahindra",
      model: "Bolero Pickup",
      type: "LOGISTICS TRUCK",
      capacity: 2,
      driverName: "Raju B",
      driverPhone: "+91 99000 88776",
      odometer: "62,100 km",
      status: "AVAILABLE",
      insuranceExpiry: "2026-11-30"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🚗 Corporate Fleet & Vehicle Management</h1>
          <p className="text-sm text-slate-600">
            Company vehicles, driver assignments, official trip bookings, odometer logs, and fuel tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/facilities" as Route}>
            <Button variant="secondary">🏢 Facilities</Button>
          </Link>
          <Button variant="secondary">+ Log Fuel / Trip</Button>
          <Button variant="primary">+ Book Company Vehicle</Button>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fleet Size</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{vehicles.length} Vehicles</p>
          <p className="mt-1 text-xs text-slate-500">Passenger & Logistics Fleet</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Available at Depot</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">2 Vehicles</p>
          <p className="mt-1 text-xs text-emerald-600">Ready for dispatch</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">On Active Duty</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">1 Vehicle</p>
          <p className="mt-1 text-xs text-blue-600">Airport transfer in progress</p>
        </Panel>
      </div>

      {/* Fleet Table */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Registration</th>
                <th className="p-4">Vehicle Model</th>
                <th className="p-4">Category</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900">{v.regNo}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{v.make} {v.model}</div>
                    <div className="text-xs text-slate-500">Insurance to {v.insuranceExpiry}</div>
                  </td>
                  <td className="p-4">
                    <Badge tone="neutral">{v.type}</Badge>
                  </td>
                  <td className="p-4 text-slate-700">{v.capacity} Seater</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{v.driverName}</div>
                    <div className="text-xs text-slate-500">{v.driverPhone}</div>
                  </td>
                  <td className="p-4 font-mono text-slate-700">{v.odometer}</td>
                  <td className="p-4">
                    <Badge tone={v.status === "AVAILABLE" ? "success" : "warning"}>
                      {v.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="secondary">Dispatch</Button>
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
