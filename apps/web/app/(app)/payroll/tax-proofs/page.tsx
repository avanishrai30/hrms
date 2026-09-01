"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function TaxProofsPage() {
  const [proofs] = useState([
    {
      id: "prf-1",
      section: "Section 80C",
      particulars: "HDFC Life Insurance Premium Receipt",
      claimed: "₹45,000",
      verified: "₹45,000",
      status: "APPROVED"
    },
    {
      id: "prf-2",
      section: "Section 80D",
      particulars: "Star Health Family Mediclaim Policy",
      claimed: "₹22,400",
      verified: "₹22,400",
      status: "APPROVED"
    },
    {
      id: "prf-3",
      section: "HRA Exemption",
      particulars: "Rent Agreement & Landlord PAN Receipt",
      claimed: "₹1,80,000",
      verified: "Pending Review",
      status: "PENDING"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/payroll/tax-declaration" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Tax Declaration
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📎 Tax Investment Proof Submissions</h1>
          <p className="text-sm text-slate-600">
            Upload supporting documentary evidence for LIC premiums, health insurance, rent agreements, and home loan certificates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Upload New Proof</Button>
        </div>
      </div>

      {/* Proofs Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Submitted Proof Documents</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Tax Section</th>
                <th className="py-3 px-4">Document Particulars</th>
                <th className="py-3 px-4">Claimed Amount</th>
                <th className="py-3 px-4">Verified Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {proofs.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-primary">{p.section}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-900 font-medium">{p.particulars}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.claimed}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">{p.verified}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={p.status === "APPROVED" ? "success" : "warning"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View PDF</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
