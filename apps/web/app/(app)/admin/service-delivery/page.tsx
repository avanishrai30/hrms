"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface ServiceDeliveryData {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  slaCompliancePercent: number;
  firstResponseSlaPercent: number;
  avgResolutionHours: number;
  avgFirstResponseMinutes: number;
  csatAverage: number;
  topTicketCategory: string;
  categoryDistribution: Record<string, number>;
  healthStatus: "EXCELLENT" | "GOOD" | "AT_RISK" | "CRITICAL";
}

export default function ServiceDeliveryAnalyticsPage() {
  const [data, setData] = useState<ServiceDeliveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await apiRequest<ServiceDeliveryData>("/service-delivery/dashboard");
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-muted-foreground">Loading Service Delivery Analytics...</div>;
  }

  const getHealthTone = (h: string): "neutral" | "success" | "warning" | "danger" => {
    switch (h) {
      case "EXCELLENT":
      case "GOOD":
        return "success";
      case "AT_RISK":
        return "warning";
      default:
        return "danger";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Shared Services & Service Delivery Cockpit</h1>
          <p className="text-sm text-muted-foreground">
            Real-time SLA fulfillment metrics, first response velocities, ticket resolution efficiency, and employee CSAT ratings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <Badge tone={getHealthTone(data.healthStatus)}>
              Status: {data.healthStatus}
            </Badge>
          </div>
          <Link href={"/admin/helpdesk" as Route}>
            <Button variant="secondary">Helpdesk Queue</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2 bg-primary/5 border-primary/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase">SLA Compliance</span>
          <div className="text-3xl font-extrabold text-primary">{data.slaCompliancePercent}%</div>
          <p className="text-xs text-muted-foreground">Target: ≥95.0%</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Employee CSAT</span>
          <div className="text-3xl font-extrabold text-success">{data.csatAverage} / 5.0</div>
          <p className="text-xs text-muted-foreground">Based on post-resolution feedback</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Avg Resolution Time</span>
          <div className="text-3xl font-extrabold text-foreground">{data.avgResolutionHours} hrs</div>
          <p className="text-xs text-muted-foreground">Mean time to resolution (MTTR)</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Avg First Response</span>
          <div className="text-3xl font-extrabold text-foreground">{data.avgFirstResponseMinutes} mins</div>
          <p className="text-xs text-success font-medium">{data.firstResponseSlaPercent}% within SLA</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Inbound Ticket Volume by Category</h3>
          <div className="space-y-3">
            {Object.entries(data.categoryDistribution || {
              PAYROLL: 42,
              LEAVE_ATTENDANCE: 28,
              IT_EQUIPMENT: 19,
              BENEFITS: 12,
              GENERAL: 7
            }).map(([cat, count]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{cat.replace(/_/g, " ")}</span>
                  <span>{count} tickets</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${Math.min(100, (count / (data.totalTickets || 100)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Service Level Agreement (SLA) Matrix</h3>
          <div className="space-y-3">
            {[
              { priority: "CRITICAL", resolutionSla: "4 Hours", responseSla: "15 Mins", target: "99.0%" },
              { priority: "HIGH", resolutionSla: "8 Hours", responseSla: "30 Mins", target: "95.0%" },
              { priority: "MEDIUM", resolutionSla: "24 Hours", responseSla: "2 Hours", target: "90.0%" },
              { priority: "LOW", resolutionSla: "48 Hours", responseSla: "4 Hours", target: "85.0%" }
            ].map((row) => (
              <div key={row.priority} className="flex justify-between items-center p-3 border border-border rounded">
                <div>
                  <Badge tone={row.priority === "CRITICAL" ? "danger" : row.priority === "HIGH" ? "warning" : "neutral"}>
                    {row.priority}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Resolution: {row.resolutionSla} • First Resp: {row.responseSla}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-success">{row.target} Target</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
