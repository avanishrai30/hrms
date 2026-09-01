"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  startDate: string;
  endDate: string;
  valueInInr: number;
  status: string;
  slaRating: number;
  vendor: { id: string; name: string; code: string };
}

export default function VendorContractsPage() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContracts() {
      try {
        setLoading(true);
        const res = await apiRequest<ContractItem[]>("/vendors/contracts");
        setContracts(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContracts();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Contracts & Master Service Agreements</h1>
          <p className="text-sm text-muted-foreground">
            Track active service level agreements (SLAs), contract renewals, and valuation terms.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/vendors" as Route}>
            <Button variant="secondary">Vendor Registry</Button>
          </Link>
          <Link href={"/vendors/compliance" as Route}>
            <Button variant="secondary">Compliance Center</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Active Contracts</span>
          <div className="text-3xl font-extrabold text-foreground">{contracts.length}</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Committed Value</span>
          <div className="text-3xl font-extrabold text-primary">
            ₹{contracts.reduce((sum, c) => sum + c.valueInInr, 0).toLocaleString("en-IN")}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Average SLA Rating</span>
          <div className="text-3xl font-extrabold text-success">
            {contracts.length > 0
              ? (contracts.reduce((sum, c) => sum + c.slaRating, 0) / contracts.length).toFixed(1)
              : "5.0"} / 5.0
          </div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Contract Records</h3>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading vendor contracts...</div>
        ) : (
          <div className="divide-y divide-border">
            {contracts.map((c) => (
              <div key={c.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{c.contractNumber}</span>
                    <Badge tone="success">{c.status}</Badge>
                  </div>
                  <h4 className="text-base font-semibold text-foreground mt-1">{c.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vendor: <strong className="text-foreground">{c.vendor.name}</strong> ({c.vendor.code}) • Value: ₹{c.valueInInr.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Valid: {new Date(c.startDate).toLocaleDateString()} to {new Date(c.endDate).toLocaleDateString()} • SLA: {c.slaRating}★
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => alert(`Reviewing contract ${c.contractNumber}`)}>
                    View Terms
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
