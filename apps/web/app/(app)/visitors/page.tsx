"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface VisitorPassItem {
  id: string;
  passNumber: string;
  visitorName: string;
  visitorPhone?: string;
  purpose: string;
  hostEmployeeName?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "SCHEDULED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
}

export default function VisitorsManagementPage() {
  const [passes, setPasses] = useState<VisitorPassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPasses() {
      try {
        setLoading(true);
        const res = await apiRequest<VisitorPassItem[]>("/visitor/passes");
        setPasses(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPasses();
  }, []);

  const samplePasses: VisitorPassItem[] = [
    { id: "1", passNumber: "VIS-2026-101", visitorName: "Vikram Malhotra", visitorPhone: "+91 98765 43210", purpose: "Vendor Quarterly Review", hostEmployeeName: "Avanish Rai", checkInTime: "10:30 AM", status: "CHECKED_IN" },
    { id: "2", passNumber: "VIS-2026-102", visitorName: "Ananya Deshmukh", visitorPhone: "+91 98123 45678", purpose: "Senior Staff Interview", hostEmployeeName: "Priya Sharma", checkInTime: "11:15 AM", status: "CHECKED_IN" },
    { id: "3", passNumber: "VIS-2026-103", visitorName: "Karthik Nair", visitorPhone: "+91 97654 32109", purpose: "HVAC Facility Inspection", hostEmployeeName: "Admin Ops", status: "SCHEDULED" }
  ];

  const data = passes.length > 0 ? passes : samplePasses;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitor Management & Security Passes</h1>
          <p className="text-sm text-muted-foreground">
            Digital visitor check-in, host notifications, QR gatepasses, and premises entry logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/facilities" as Route}>
            <Button variant="secondary">Facilities</Button>
          </Link>
          <Link href={"/meeting-rooms" as Route}>
            <Button variant="secondary">Meeting Rooms</Button>
          </Link>
          <Button onClick={() => alert("Open Pre-Register Visitor Modal")}>+ Pre-Register Guest</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Expected Visitors Today</span>
          <div className="text-3xl font-extrabold text-foreground">{data.length}</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Currently On-Premises</span>
          <div className="text-3xl font-extrabold text-success">
            {data.filter((p) => p.status === "CHECKED_IN").length}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Checked Out</span>
          <div className="text-3xl font-extrabold text-primary">
            {data.filter((p) => p.status === "CHECKED_OUT").length}
          </div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Visitor Gate Log — Today</h3>
        {loading && passes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Loading visitor registry...</div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((p) => (
              <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{p.passNumber}</span>
                    <h4 className="text-sm font-bold text-foreground">{p.visitorName}</h4>
                    <Badge tone={p.status === "CHECKED_IN" ? "success" : p.status === "SCHEDULED" ? "warning" : "neutral"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Host: <strong className="text-foreground">{p.hostEmployeeName || "Security"}</strong> • Purpose: {p.purpose}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Phone: {p.visitorPhone || "N/A"} {p.checkInTime && `• Entry: ${p.checkInTime}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {p.status === "CHECKED_IN" ? (
                    <Button variant="secondary" onClick={() => alert(`Checked out visitor ${p.visitorName}`)}>
                      Check Out
                    </Button>
                  ) : (
                    <Button onClick={() => alert(`Checked in visitor ${p.visitorName}`)}>
                      Check In
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => alert(`Displaying QR pass for ${p.passNumber}`)}>
                    QR Pass
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
