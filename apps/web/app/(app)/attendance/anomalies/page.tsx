"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AnomaliesPage() {
  const [anomalies] = useState([
    {
      id: "an-1",
      employee: "Ramesh Pawar (EMP-109)",
      dept: "Warehouse Shift Supervisor",
      date: "Sep 01, 2026",
      type: "MISSING_PUNCH",
      severity: "MEDIUM",
      explanation: "Check-in logged at 06:02 AM without corresponding check-out punch.",
      recommendation: "Prompt employee in ESS to submit attendance regularization.",
      isResolved: false
    },
    {
      id: "an-2",
      employee: "Kavita Rao (EMP-077)",
      dept: "Software Engineering",
      date: "Aug 31, 2026",
      type: "EXCESSIVE_LATE",
      severity: "MEDIUM",
      explanation: "Employee checked in 72 minutes past scheduled shift start (10:12 AM).",
      recommendation: "Apply half-day late deduction rule or manager dispensation.",
      isResolved: false
    },
    {
      id: "an-3",
      employee: "Unregistered Device IP",
      dept: "Security Telemetry",
      date: "Aug 30, 2026",
      type: "SPOOF_ATTEMPT",
      severity: "CRITICAL",
      explanation: "Biometric anti-spoof score triggered on Kiosk 2 (Photo replay attempt).",
      recommendation: "Freeze automated attendance credit and notify Security & HR Admin.",
      isResolved: true
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⚠️ Attendance Anomaly & Compliance Engine</h1>
          <p className="text-sm text-slate-600">
            Automated detection of missing punches, double punches, tardiness patterns, geofence breaches, and biometric spoofing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">⚡ Run Anomaly Scan</Button>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {anomalies.map((an) => (
          <Panel key={an.id} className="p-5 space-y-3 border-l-4 border-l-primary">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{an.date} · {an.dept}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{an.employee}</h3>
              </div>
              <div className="flex gap-2">
                <Badge tone={an.severity === "CRITICAL" || an.severity === "HIGH" ? "danger" : "warning"}>
                  {an.severity} SEVERITY
                </Badge>
                <Badge tone={an.isResolved ? "success" : "neutral"}>
                  {an.isResolved ? "RESOLVED" : "OPEN"}
                </Badge>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
              <div className="text-slate-800 font-medium"><strong>Anomaly:</strong> {an.explanation}</div>
              <div className="text-primary font-medium"><strong>Recommended Action:</strong> {an.recommendation}</div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              {!an.isResolved && (
                <>
                  <Button variant="secondary">Request Employee Justification</Button>
                  <Button variant="primary">Resolve Anomaly</Button>
                </>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
