"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function ContractorDailyAttendancePage() {
  const dailyAttendance = [
    { code: "CON-001", name: "Ramesh Sharma", shift: "MORNING_08_16", inTime: "07:58 AM", outTime: "04:30 PM", status: "PRESENT", location: "Warehouse Dock A" },
    { code: "CON-002", name: "Suresh Patil", shift: "MORNING_08_16", inTime: "08:05 AM", outTime: "04:15 PM", status: "PRESENT", location: "Packing Line 2" },
    { code: "CON-003", name: "Amit Kumar", shift: "GENERAL_09_18", inTime: "08:52 AM", outTime: "—", status: "ON_DUTY", location: "Assembly Bay 1" },
    { code: "CON-004", name: "Vijay Singh", shift: "GENERAL_09_18", inTime: "—", outTime: "—", status: "ABSENT", location: "—" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contractor Biometric Daily Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Real-time biometric punch tracking, shift verification, and on-site contractor headcount.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/contractors" as Route}>
            <Button variant="secondary">Contractor Master</Button>
          </Link>
          <Link href={"/contractors/muster" as Route}>
            <Button variant="secondary">Muster Roll</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Scheduled Today</span>
          <div className="text-3xl font-extrabold text-foreground">45</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Clocked In</span>
          <div className="text-3xl font-extrabold text-success">42</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Absent</span>
          <div className="text-3xl font-extrabold text-danger">3</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Attendance Rate</span>
          <div className="text-3xl font-extrabold text-primary">93.3%</div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Live Punch Log — Today</h3>
        <div className="divide-y divide-border">
          {dailyAttendance.map((d) => (
            <div key={d.code} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{d.code}</span>
                  <h4 className="text-sm font-bold text-foreground">{d.name}</h4>
                  <Badge tone={d.status === "PRESENT" || d.status === "ON_DUTY" ? "success" : "danger"}>
                    {d.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Shift: {d.shift} • In: {d.inTime} • Out: {d.outTime} • Area: {d.location}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => alert(`Checked log for ${d.name}`)}>
                  View Log
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
