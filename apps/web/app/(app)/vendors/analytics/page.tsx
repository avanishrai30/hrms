"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface VendorAnalyticsData {
  totalVendors: number;
  activeVendors: number;
  totalContractValueInr: number;
  overallComplianceRate: number;
  scorecards: Array<{
    vendorId: string;
    vendorName: string;
    activeContractsCount: number;
    totalContractValueInr: number;
    complianceRatePercent: number;
    averageSlaRating: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    expiringContractsCount: number;
  }>;
  expiringAlerts: Array<{
    contractId: string;
    contractNumber: string;
    vendorName: string;
    daysToExpiry: number;
    valueInInr: number;
  }>;
}

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<VendorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await apiRequest<VendorAnalyticsData>("/vendors/analytics");
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
    return <div className="p-8 text-center text-muted-foreground">Loading Vendor Ecosystem Analytics...</div>;
  }

  const getRiskTone = (r: string): "neutral" | "success" | "warning" | "danger" => {
    switch (r) {
      case "LOW":
        return "success";
      case "MEDIUM":
        return "neutral";
      case "HIGH":
        return "warning";
      default:
        return "danger";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Performance & SLA Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Holistic vendor scorecards, compliance health indices, risk classifications, and renewal pipelines.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/vendors" as Route}>
            <Button variant="secondary">Vendor Master</Button>
          </Link>
          <Link href={"/vendors/contracts" as Route}>
            <Button variant="secondary">Contracts Hub</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Active Vendors</span>
          <div className="text-3xl font-extrabold text-foreground">{data.activeVendors}</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Contract Portfolio</span>
          <div className="text-3xl font-extrabold text-primary">
            ₹{data.totalContractValueInr.toLocaleString("en-IN")}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Compliance Health</span>
          <div className="text-3xl font-extrabold text-success">{data.overallComplianceRate}%</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Renewal Alerts (60d)</span>
          <div className="text-3xl font-extrabold text-warning">{data.expiringAlerts.length}</div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Vendor Performance Scorecards</h3>
        <div className="divide-y divide-border">
          {data.scorecards.map((s) => (
            <div key={s.vendorId} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">{s.vendorName}</h4>
                  <Badge tone={getRiskTone(s.riskLevel)}>Risk: {s.riskLevel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Contracts: {s.activeContractsCount} • Value: ₹{s.totalContractValueInr.toLocaleString("en-IN")} • Compliance: {s.complianceRatePercent}% • SLA: {s.averageSlaRating}★
                </p>
              </div>
              <div>
                <Link href={`/vendors/contracts?vendorId=${s.vendorId}` as Route}>
                  <Button variant="secondary">View Scorecard</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
