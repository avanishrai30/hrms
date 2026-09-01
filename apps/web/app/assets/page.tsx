"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function AssetsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [assets] = useState([
    {
      id: "ast-1",
      assetCode: "AST-2026-001",
      name: 'MacBook Pro 16" M3 Max',
      category: "LAPTOP",
      serialNumber: "C02XYZ123456",
      condition: "BRAND_NEW",
      status: "ASSIGNED",
      holder: "Aarav Sharma (ENG001)",
      purchaseCost: "₹2,45,000",
      bookValue: "₹2,10,000",
      location: "Bangalore HQ - Floor 4"
    },
    {
      id: "ast-2",
      assetCode: "AST-2026-002",
      name: "Dell UltraSharp 32 4K Monitor",
      category: "MONITOR",
      serialNumber: "DL-MON-9988",
      condition: "EXCELLENT",
      status: "ASSIGNED",
      holder: "Meera Nair (DES004)",
      purchaseCost: "₹65,000",
      bookValue: "₹52,000",
      location: "Design Studio A"
    },
    {
      id: "ast-3",
      assetCode: "AST-2026-003",
      name: "Lenovo ThinkPad P16 Gen 2",
      category: "LAPTOP",
      serialNumber: "LN-TP-77889",
      condition: "GOOD",
      status: "AVAILABLE",
      holder: null,
      purchaseCost: "₹1,85,000",
      bookValue: "₹1,40,000",
      location: "IT Store Room - Shelf 2"
    },
    {
      id: "ast-4",
      assetCode: "AST-2026-004",
      name: "ZKTeco Face & Palm Biometric Scanner",
      category: "BIOMETRIC_DEVICE",
      serialNumber: "ZK-BIO-4411",
      condition: "GOOD",
      status: "IN_MAINTENANCE",
      holder: null,
      purchaseCost: "₹45,000",
      bookValue: "₹30,000",
      location: "Warehouse Gate 1"
    }
  ]);

  const filteredAssets = assets.filter((a) => {
    const matchesCat = selectedCategory === "ALL" || a.category === selectedCategory;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">💻 Enterprise Asset Register</h1>
          <p className="text-sm text-slate-600">
            Hardware inventory, IT devices, assignments, and lifecycle tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets/depreciation" as Route}>
            <Button variant="secondary">📉 Depreciation</Button>
          </Link>
          <Link href={"/assets/maintenance" as Route}>
            <Button variant="secondary">🛠️ Maintenance</Button>
          </Link>
          <Button variant="primary">+ Register Asset</Button>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assets</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{assets.length}</p>
          <p className="mt-1 text-xs text-slate-500">Valuation ₹5.4 Lakhs</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Assigned</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">2 Assets</p>
          <p className="mt-1 text-xs text-emerald-600">50% Fleet Utilization</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Available in Stock</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">1 Asset</p>
          <p className="mt-1 text-xs text-blue-600">Ready for instant allocation</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Under Maintenance</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">1 Device</p>
          <p className="mt-1 text-xs text-amber-600">AMC repair in progress</p>
        </Panel>
      </div>

      {/* Filters & Search */}
      <Panel className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {["ALL", "LAPTOP", "MONITOR", "BIOMETRIC_DEVICE", "VEHICLE"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search code, serial, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Panel>

      {/* Asset Table */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Asset Code</th>
                <th className="p-4">Item Name & Specs</th>
                <th className="p-4">Category</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Current Holder</th>
                <th className="p-4">Purchase / Book Value</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-medium text-slate-900">{asset.assetCode}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{asset.name}</div>
                    <div className="text-xs text-slate-500 font-mono">SN: {asset.serialNumber}</div>
                  </td>
                  <td className="p-4">
                    <Badge tone="neutral">{asset.category}</Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-slate-700">{asset.condition}</span>
                  </td>
                  <td className="p-4">
                    {asset.holder ? (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                        {asset.holder}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-italic">Unassigned (In Store)</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-900 font-medium">{asset.purchaseCost}</div>
                    <div className="text-[11px] text-slate-500">Book: {asset.bookValue}</div>
                  </td>
                  <td className="p-4">
                    <Badge
                      tone={
                        asset.status === "ASSIGNED"
                          ? "success"
                          : asset.status === "AVAILABLE"
                          ? "neutral"
                          : "warning"
                      }
                    >
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {asset.status === "AVAILABLE" ? (
                        <Button variant="secondary">Assign</Button>
                      ) : asset.status === "ASSIGNED" ? (
                        <Button variant="secondary">Return</Button>
                      ) : (
                        <Button variant="secondary">Details</Button>
                      )}
                    </div>
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
