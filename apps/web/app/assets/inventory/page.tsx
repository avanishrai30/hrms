"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function InventoryPage() {
  const [items] = useState([
    {
      id: "inv-1",
      sku: "INV-CBL-TYPEC",
      name: "65W USB-C Braided Fast Charge Cable",
      category: "CABLES & ADAPTERS",
      stock: 45,
      reorder: 15,
      unitCost: 650,
      supplier: "Belkin India Pvt Ltd",
      location: "IT Store - Bin A1"
    },
    {
      id: "inv-2",
      sku: "INV-MOUSE-WRL",
      name: "Logitech MX Master 3S Wireless Mouse",
      category: "PERIPHERALS",
      stock: 6,
      reorder: 10,
      unitCost: 7995,
      supplier: "Ingram Micro",
      location: "IT Store - Bin B4"
    },
    {
      id: "inv-3",
      sku: "INV-HDMI-4K",
      name: "High Speed HDMI 2.1 4K 120Hz Cable",
      category: "CABLES & ADAPTERS",
      stock: 28,
      reorder: 8,
      unitCost: 450,
      supplier: "Amazon Business",
      location: "IT Store - Bin A2"
    },
    {
      id: "inv-4",
      sku: "INV-RAM-32GB",
      name: "Crucial 32GB DDR5 SODIMM 4800MHz RAM",
      category: "SPARE PARTS",
      stock: 3,
      reorder: 5,
      unitCost: 9200,
      supplier: "PrimeABGB",
      location: "Hardware Repair Lab"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📦 Consumables & Spare Parts Inventory</h1>
          <p className="text-sm text-slate-600">
            Track IT accessories, cables, spare parts, stock levels, and reorder thresholds.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">💻 Asset Register</Button>
          </Link>
          <Button variant="secondary">+ Stock In / Out</Button>
          <Button variant="primary">+ New Inventory Item</Button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SKUs</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{items.length} Items</p>
          <p className="mt-1 text-xs text-slate-500">82 Total Units in Stock</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Low Stock Warnings</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">2 SKUs</p>
          <p className="mt-1 text-xs text-amber-600">Stock below reorder threshold</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Inventory Valuation</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">₹1,17,420</p>
          <p className="mt-1 text-xs text-emerald-600">Total current holding value</p>
        </Panel>
      </div>

      {/* Inventory Items Table */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Reorder Level</th>
                <th className="p-4">Unit Cost</th>
                <th className="p-4">Supplier & Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isLow = item.stock <= item.reorder;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-medium text-slate-900">{item.sku}</td>
                    <td className="p-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="p-4">
                      <Badge tone="neutral">{item.category}</Badge>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{item.stock} Units</td>
                    <td className="p-4 text-slate-500">{item.reorder} Units</td>
                    <td className="p-4 text-slate-900 font-medium">₹{item.unitCost}</td>
                    <td className="p-4">
                      <div className="text-xs text-slate-700">{item.supplier}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.location}</div>
                    </td>
                    <td className="p-4">
                      <Badge tone={isLow ? "warning" : "success"}>
                        {isLow ? "LOW STOCK" : "OPTIMAL"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="secondary">Adjust</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
