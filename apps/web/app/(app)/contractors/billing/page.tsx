"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function ContractorBillingPage() {
  const vendorInvoices = [
    { invoiceNo: "INV-APX-2026-08", vendor: "Apex Logistics & Staffing", period: "August 2026", headCount: 28, manDays: 712, totalAmount: 640800, gstAmount: 115344, netPayable: 756144, status: "APPROVED" },
    { invoiceNo: "INV-PRM-2026-08", vendor: "Prime Staffing Solutions", period: "August 2026", headCount: 17, manDays: 425, totalAmount: 382500, gstAmount: 68850, netPayable: 451350, status: "PENDING_AUDIT" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contractor Billing & Agency Invoicing</h1>
          <p className="text-sm text-muted-foreground">
            Reconcile biometric attendance mandays with agency monthly invoices and GST tax credits.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Mandays Billed</span>
          <div className="text-3xl font-extrabold text-foreground">1,137 days</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Net Agency Payouts</span>
          <div className="text-3xl font-extrabold text-primary">₹12,07,494</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">GST Input Tax Credit</span>
          <div className="text-3xl font-extrabold text-success">₹1,84,194</div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Monthly Staffing Agency Invoices</h3>
        <div className="divide-y divide-border">
          {vendorInvoices.map((inv) => (
            <div key={inv.invoiceNo} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{inv.invoiceNo}</span>
                  <h4 className="text-sm font-bold text-foreground">{inv.vendor}</h4>
                  <Badge tone={inv.status === "APPROVED" ? "success" : "warning"}>{inv.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Billing Period: {inv.period} • Personnel: {inv.headCount} • Total Mandays: {inv.manDays}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Base: ₹{inv.totalAmount.toLocaleString("en-IN")} + GST: ₹{inv.gstAmount.toLocaleString("en-IN")} = <strong className="text-foreground">₹{inv.netPayable.toLocaleString("en-IN")}</strong>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => alert(`Matched attendance logs for invoice ${inv.invoiceNo}`)}>
                  Verify Biometric Log
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
