"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AssetInventoryStockPage() {
  const stockCategories = [
    { name: "Laptops & MacBooks", total: 85, assigned: 78, inStock: 7, threshold: 5 },
    { name: "Mobile Phones & Tablets", total: 40, assigned: 35, inStock: 5, threshold: 3 },
    { name: "Monitors & Displays", total: 110, assigned: 95, inStock: 15, threshold: 10 },
    { name: "Keyboards, Mice & Docks", total: 150, assigned: 120, inStock: 30, threshold: 15 },
    { name: "SIM Cards & Data Dongles", total: 50, assigned: 42, inStock: 8, threshold: 5 }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hardware & Peripherals Stock Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Warehouse stock levels, buffer reorder thresholds, and peripheral allocations.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">Asset Registry</Button>
          </Link>
          <Link href={"/assets/assignments" as Route}>
            <Button variant="secondary">Assignments</Button>
          </Link>
        </div>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Category Inventory Balances</h3>
        <div className="divide-y divide-border">
          {stockCategories.map((c) => (
            <div key={c.name} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">{c.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total Fleet: {c.total} • Assigned: {c.assigned} • In Stock: <strong className="text-foreground">{c.inStock}</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={c.inStock >= c.threshold ? "success" : "warning"}>
                  {c.inStock >= c.threshold ? "HEALTHY BUFFER" : "REORDER REQUIRED"}
                </Badge>
                <Button variant="secondary" onClick={() => alert(`Initiated procurement for ${c.name}`)}>
                  + Restock
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
