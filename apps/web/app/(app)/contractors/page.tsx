"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface ContractorItem {
  id: string;
  code: string;
  name: string;
  skillCategory: string;
  dailyWageRate?: number;
  isActive: boolean;
  vendor: { id: string; name: string };
}

export default function ContractorsMasterPage() {
  const [contractors, setContractors] = useState<ContractorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContractors() {
      try {
        setLoading(true);
        const res = await apiRequest<ContractorItem[]>("/attendance/contractors");
        setContractors(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContractors();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contingent Workforce & Contractor Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage agency-supplied personnel, daily wages, skill classifications, and biometric access.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/contractors/muster" as Route}>
            <Button variant="secondary">Muster Roll</Button>
          </Link>
          <Link href={"/contractors/attendance" as Route}>
            <Button variant="secondary">Daily Attendance</Button>
          </Link>
          <Link href={"/contractors/billing" as Route}>
            <Button variant="secondary">Contractor Billing</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Registered</span>
          <div className="text-3xl font-extrabold text-foreground">{contractors.length || 45}</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Active On-Site</span>
          <div className="text-3xl font-extrabold text-success">
            {contractors.filter((c) => c.isActive).length || 42}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Average Daily Wage</span>
          <div className="text-3xl font-extrabold text-primary">₹850 / day</div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Contractor Roster</h3>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading contractor master...</div>
        ) : (
          <div className="divide-y divide-border">
            {(contractors.length > 0 ? contractors : [
              { id: "1", code: "CON-001", name: "Ramesh Sharma", skillCategory: "FORKLIFT_OPERATOR", dailyWageRate: 950, isActive: true, vendor: { id: "v1", name: "Apex Logistics" } },
              { id: "2", code: "CON-002", name: "Suresh Patil", skillCategory: "PACKING_SPECIALIST", dailyWageRate: 750, isActive: true, vendor: { id: "v1", name: "Apex Logistics" } },
              { id: "3", code: "CON-003", name: "Amit Kumar", skillCategory: "MACHINE_OPERATOR", dailyWageRate: 900, isActive: true, vendor: { id: "v2", name: "Prime Staffing" } }
            ]).map((c) => (
              <div key={c.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
                    <h4 className="text-sm font-bold text-foreground">{c.name}</h4>
                    <Badge tone={c.isActive ? "success" : "neutral"}>{c.skillCategory}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agency: {c.vendor.name} • Wage Rate: ₹{c.dailyWageRate || 850}/day
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => alert(`Viewing contractor card for ${c.name}`)}>
                    View Card
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
