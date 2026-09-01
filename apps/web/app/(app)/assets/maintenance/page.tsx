"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AssetMaintenancePage() {
  const maintenanceLogs = [
    { tag: "AST-LAP-009", asset: "MacBook Pro 14", type: "BATTERY_REPLACEMENT", vendor: "Apple Authorised Service", cost: 18500, scheduledDate: "28 Aug 2026", status: "IN_PROGRESS" },
    { tag: "AST-MON-003", asset: 'Dell UltraSharp 27"', type: "PANEL_REPAIR", vendor: "Dell Premier Support", cost: 8200, scheduledDate: "15 Aug 2026", status: "COMPLETED" },
    { tag: "AST-SRV-001", asset: "Dell PowerEdge R750", type: "ANNUAL_MAINTENANCE_AMC", vendor: "Wipro Enterprise Services", cost: 45000, scheduledDate: "10 Sep 2026", status: "SCHEDULED" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Asset Maintenance, Repairs & AMC Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Schedule hardware service, track warranty repairs, monitor Annual Maintenance Contracts (AMC), and log repair expenses.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">Asset Registry</Button>
          </Link>
          <Button onClick={() => alert("Open Schedule Repair Modal")}>+ Schedule Service</Button>
        </div>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Maintenance Tickets</h3>
        <div className="divide-y divide-border">
          {maintenanceLogs.map((m) => (
            <div key={m.tag} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{m.tag}</span>
                  <h4 className="text-sm font-bold text-foreground">{m.asset}</h4>
                  <Badge tone={m.status === "COMPLETED" ? "success" : m.status === "IN_PROGRESS" ? "warning" : "neutral"}>
                    {m.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Type: {m.type.replace(/_/g, " ")} • Service Provider: {m.vendor} • Estimated Cost: ₹{m.cost.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Date: {m.scheduledDate}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => alert(`Showing service report for ${m.tag}`)}>
                  Service Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
