"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FaceAttendancePage() {
  const [faceTelemetry] = useState({
    enrolledCount: 232,
    totalEmployees: 240,
    verifiedPunchesToday: 384,
    spoofsBlocked: 3,
    avgMatchConfidence: 98.4
  });

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">👤 Face Recognition Attendance & Liveness Shield</h1>
          <p className="text-sm text-slate-600">
            Webcam and mobile camera biometric verification with 3D liveness detection, blink analysis, and anti-spoof protection.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">📸 Enroll Face Template</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled Face Profiles</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{faceTelemetry.enrolledCount} / {faceTelemetry.totalEmployees}</div>
          <div className="mt-1 text-xs text-slate-600">96.6% Workforce Enrollment</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Similarity Score</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{faceTelemetry.avgMatchConfidence}%</div>
          <div className="mt-1 text-xs text-slate-600">Cosine Distance Confidence</div>
        </Panel>
        <Panel className="border-l-4 border-l-rose-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Photo Spoofs Intercepted</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">{faceTelemetry.spoofsBlocked} Attempts</div>
          <div className="mt-1 text-xs text-slate-600">Digital screen replay blocked</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Liveness Test Modality</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">Blink + Motion</div>
          <div className="mt-1 text-xs text-slate-600">Passive & Active Defense</div>
        </Panel>
      </div>

      {/* Interactive Kiosk Simulator */}
      <Panel className="space-y-4 p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Live Kiosk Attendance Capture</h2>
          <Badge tone="success">CAMERA ACTIVE</Badge>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 text-center text-white space-y-4">
          <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 border-emerald-500 bg-slate-800 text-5xl">
            👤
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-400">Face Recognized: Vikramaditya Chauhan (EMP-001)</h3>
            <p className="text-xs text-slate-300">Confidence: 99.2% · Blink Detected · Liveness Verified · GPS Location: HQ Mumbai</p>
          </div>
          <div>
            <Button variant="primary">✅ Punch In Verified (09:00:14 AM)</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
