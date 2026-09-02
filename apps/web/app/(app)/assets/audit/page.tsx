"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AssetAuditQrPage() {
  const auditScans = [
    { tag: "AST-LAP-001", name: 'MacBook Pro 16" M3 Max', serial: "C02XYZ12345", verifiedBy: "IT Sec Ops", lastScanned: "Today, 10:15 AM", status: "VERIFIED_PRESENT", location: "Assigned Office - Floor 4" },
    { tag: "AST-LAP-002", name: "Dell XPS 15 9530", serial: "DL987654321", verifiedBy: "IT Sec Ops", lastScanned: "Yesterday, 04:30 PM", status: "VERIFIED_PRESENT", location: "Assigned Office - IT Vault" },
    { tag: "AST-MOB-001", name: "iPhone 15 Pro Max", serial: "F2LZ987654", verifiedBy: "Asset Officer", lastScanned: "28 Aug 2026", status: "VERIFIED_REMOTE", location: "Remote - Mumbai" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Physical Asset Verification & QR Barcode Audits</h1>
          <p className="text-sm text-muted-foreground">
            Perform barcode scanning audits, track geo-tagged physical verifications, and reconcile inventory discrepancies.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">Asset Registry</Button>
          </Link>
          <Button onClick={() => alert("Launching Mobile QR Camera Scanner...")}>📷 Scan Asset QR</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Audited Q3 Fleet</span>
          <div className="text-3xl font-extrabold text-success">98.2%</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Scanned Past 30 Days</span>
          <div className="text-3xl font-extrabold text-primary">181 / 185</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Missing / Discrepancy</span>
          <div className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-200">0</div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Recent Physical Audit Scans</h3>
        <div className="divide-y divide-border">
          {auditScans.map((s) => (
            <div key={s.tag} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{s.tag}</span>
                  <h4 className="text-sm font-bold text-foreground">{s.name}</h4>
                  <Badge tone="success">{s.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Serial: {s.serial} • Location: {s.location} • Verified By: {s.verifiedBy}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Timestamp: {s.lastScanned}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => alert(`Generated QR label for ${s.tag}`)}>
                  🖨️ Print QR Label
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
