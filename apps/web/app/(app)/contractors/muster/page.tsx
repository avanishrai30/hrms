"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function ContractorMusterRollPage() {
  const sampleMuster = [
    { code: "CON-001", name: "Ramesh Sharma", skill: "FORKLIFT_OPERATOR", daysPresent: 26, overtimeHours: 12, wage: 24700, status: "VERIFIED" },
    { code: "CON-002", name: "Suresh Patil", skill: "PACKING_SPECIALIST", daysPresent: 25, overtimeHours: 8, wage: 18750, status: "VERIFIED" },
    { code: "CON-003", name: "Amit Kumar", skill: "MACHINE_OPERATOR", daysPresent: 27, overtimeHours: 16, wage: 25200, status: "VERIFIED" },
    { code: "CON-004", name: "Vijay Singh", skill: "MATERIAL_HANDLER", daysPresent: 24, overtimeHours: 4, wage: 17400, status: "PENDING_AUDIT" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statutory Contractor Muster Roll (Form II)</h1>
          <p className="text-sm text-muted-foreground">
            Monthly muster roll records, verified shifts, overtime computations, and contractor payout summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/contractors" as Route}>
            <Button variant="secondary">Contractor Master</Button>
          </Link>
          <Button onClick={() => window.print()}>🖨️ Export Statutory PDF</Button>
        </div>
      </div>

      <Panel className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold">Monthly Muster Roll — August 2026</h3>
          <span className="text-xs text-muted-foreground">Compliance: CLRA Act 1970</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="py-2.5 px-3">Contractor</th>
                <th className="py-2.5 px-3">Skill Trade</th>
                <th className="py-2.5 px-3">Days Present</th>
                <th className="py-2.5 px-3">OT Hours</th>
                <th className="py-2.5 px-3">Gross Payable</th>
                <th className="py-2.5 px-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sampleMuster.map((m) => (
                <tr key={m.code} className="hover:bg-muted/10">
                  <td className="py-3 px-3">
                    <div className="font-bold text-foreground">{m.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">{m.code}</div>
                  </td>
                  <td className="py-3 px-3 text-xs">{m.skill}</td>
                  <td className="py-3 px-3 font-semibold">{m.daysPresent}</td>
                  <td className="py-3 px-3">{m.overtimeHours} hrs</td>
                  <td className="py-3 px-3 font-bold text-primary">₹{m.wage.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-3">
                    <Badge tone={m.status === "VERIFIED" ? "success" : "warning"}>{m.status}</Badge>
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
