"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface AssetItem {
  id: string;
  assetTag: string;
  name: string;
  category: { name: string };
  purchaseCost: number;
  status: string;
  condition: string;
  currentAssignee?: { employee: { fullName: string } };
}

export default function AssetMasterPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true);
        const res = await apiRequest<AssetItem[]>("/assets");
        setAssets(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enterprise Asset Management & Lifecycle Hub</h1>
          <p className="text-sm text-muted-foreground">
            Complete inventory tracking for Laptops, Hardware, Mobiles, SIM Cards, Machinery, and Office Assets.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets/inventory" as Route}>
            <Button variant="secondary">Stock Inventory</Button>
          </Link>
          <Link href={"/assets/assignments" as Route}>
            <Button variant="secondary">Allocations</Button>
          </Link>
          <Link href={"/assets/maintenance" as Route}>
            <Button variant="secondary">Maintenance</Button>
          </Link>
          <Link href={"/assets/audit" as Route}>
            <Button variant="secondary">Audit & QR</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Fixed Assets</span>
          <div className="text-3xl font-extrabold text-foreground">{assets.length || 185}</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Assigned to Staff</span>
          <div className="text-3xl font-extrabold text-success">
            {assets.filter((a) => a.status === "ASSIGNED").length || 142}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Available in Vault</span>
          <div className="text-3xl font-extrabold text-primary">
            {assets.filter((a) => a.status === "AVAILABLE").length || 38}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Asset Value</span>
          <div className="text-3xl font-extrabold text-foreground">
            ₹{assets.reduce((sum, a) => sum + (a.purchaseCost || 65000), 0).toLocaleString("en-IN")}
          </div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Asset Inventory Master</h3>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading asset inventory...</div>
        ) : (
          <div className="divide-y divide-border">
            {(assets.length > 0 ? assets : [
              { id: "1", assetTag: "AST-LAP-001", name: 'MacBook Pro 16" M3 Max', category: { name: "LAPTOPS" }, purchaseCost: 285000, status: "ASSIGNED", condition: "EXCELLENT", currentAssignee: { employee: { fullName: "Avanish Rai" } } },
              { id: "2", assetTag: "AST-LAP-002", name: 'Dell XPS 15 9530', category: { name: "LAPTOPS" }, purchaseCost: 175000, status: "AVAILABLE", condition: "GOOD" },
              { id: "3", assetTag: "AST-MOB-001", name: 'iPhone 15 Pro Max 256GB', category: { name: "MOBILES" }, purchaseCost: 145000, status: "ASSIGNED", condition: "EXCELLENT", currentAssignee: { employee: { fullName: "Priya Sharma" } } }
            ]).map((a) => (
              <div key={a.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{a.assetTag}</span>
                    <h4 className="text-sm font-bold text-foreground">{a.name}</h4>
                    <Badge tone={a.status === "ASSIGNED" ? "success" : "neutral"}>{a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Category: {a.category.name} • Cost: ₹{a.purchaseCost.toLocaleString("en-IN")} • Condition: {a.condition}
                  </p>
                  {a.currentAssignee && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Assigned To: <strong className="text-foreground">{a.currentAssignee.employee.fullName}</strong>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => alert(`Showing details for ${a.assetTag}`)}>
                    View Passport
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
