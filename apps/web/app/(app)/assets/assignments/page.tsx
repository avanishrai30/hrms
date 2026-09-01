"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AssetAssignmentsPage() {
  const assignments = [
    { tag: "AST-LAP-001", asset: 'MacBook Pro 16" M3 Max', employee: "Avanish Rai", dept: "Engineering", assignedDate: "15 Jan 2026", status: "ACTIVE", acknowledged: true },
    { tag: "AST-MOB-001", asset: "iPhone 15 Pro Max", employee: "Priya Sharma", dept: "Product & Growth", assignedDate: "10 Feb 2026", status: "ACTIVE", acknowledged: true },
    { tag: "AST-LAP-004", asset: "ThinkPad T14s Gen 4", employee: "Rohit Verma", dept: "Operations", assignedDate: "01 Mar 2026", status: "ACTIVE", acknowledged: false }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Asset Allocations & Employee Custody</h1>
          <p className="text-sm text-muted-foreground">
            Monitor digital handovers, signed custody acknowledgements, and asset return clearances.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">Asset Registry</Button>
          </Link>
          <Button onClick={() => alert("Open Allocate Asset Modal")}>+ Allocate Asset</Button>
        </div>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Active Custody Allocations</h3>
        <div className="divide-y divide-border">
          {assignments.map((a) => (
            <div key={a.tag} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{a.tag}</span>
                  <h4 className="text-sm font-bold text-foreground">{a.asset}</h4>
                  <Badge tone={a.acknowledged ? "success" : "warning"}>
                    {a.acknowledged ? "DIGITALLY SIGNED" : "PENDING ACKNOWLEDGEMENT"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Custodian: <strong className="text-foreground">{a.employee}</strong> ({a.dept}) • Handover Date: {a.assignedDate}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => alert(`Initiated handover receipt for ${a.tag}`)}>
                  View Receipt
                </Button>
                <Button variant="secondary" onClick={() => alert(`Initiated return clearance for ${a.tag}`)}>
                  Initiate Return
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
