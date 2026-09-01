"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface ComplianceRecord {
  id: string;
  complianceType: string;
  documentNumber?: string;
  validUntil?: string;
  isVerified: boolean;
  status: string;
  notes?: string;
  vendor: { id: string; name: string; code: string };
}

export default function VendorCompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompliance() {
      try {
        setLoading(true);
        const res = await apiRequest<ComplianceRecord[]>("/vendors/compliance");
        setRecords(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCompliance();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Statutory & Compliance Audits</h1>
          <p className="text-sm text-muted-foreground">
            Track GST filings, MSME certifications, Labor Licenses, Insurance policies, and EPF/ESIC proof.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/vendors" as Route}>
            <Button variant="secondary">Vendor Registry</Button>
          </Link>
          <Link href={"/vendors/analytics" as Route}>
            <Button variant="secondary">Vendor Analytics</Button>
          </Link>
        </div>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Audit Verification Queue</h3>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading compliance records...</div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((r) => (
              <div key={r.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{r.complianceType.replace(/_/g, " ")}</span>
                    <Badge tone={r.isVerified ? "success" : "warning"}>
                      {r.isVerified ? "VERIFIED" : "PENDING AUDIT"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vendor: <strong className="text-foreground">{r.vendor.name}</strong> • Doc Ref: {r.documentNumber || "N/A"}
                  </p>
                  {r.validUntil && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Valid Until: {new Date(r.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => alert(`Verified compliance for ${r.vendor.name}`)}>
                    Verify Document
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
