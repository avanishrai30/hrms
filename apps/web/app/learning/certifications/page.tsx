"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function CertificationsPage() {
  const [certifications] = useState([
    {
      id: "cert-1",
      title: "GMP Certified Food Safety & Quality Specialist",
      code: "CERT-GMP-2026",
      type: "COMPLIANCE",
      certificateNumber: "VCO-CERT-94821",
      issueDate: "Aug 15, 2026",
      expiryDate: "Aug 15, 2027",
      issuingAuthority: "VC Organics Academy & Quality Council",
      status: "ACTIVE",
      scorePercent: 92.5
    },
    {
      id: "cert-2",
      title: "Workplace Safety & Emergency First-Aid Responder",
      code: "CERT-SAFE-2025",
      type: "INTERNAL",
      certificateNumber: "VCO-CERT-81204",
      issueDate: "Sep 10, 2025",
      expiryDate: "Sep 10, 2026",
      issuingAuthority: "National Safety Council Partner",
      status: "EXPIRING_SOON",
      scorePercent: 88.0
    },
    {
      id: "cert-3",
      title: "PostgreSQL Advanced Distributed Data Engineering",
      code: "CERT-DB-2026",
      type: "PROFESSIONAL",
      certificateNumber: "VCO-CERT-39401",
      issueDate: "May 20, 2026",
      expiryDate: "May 20, 2028",
      issuingAuthority: "VC Tech Academy",
      status: "ACTIVE",
      scorePercent: 96.0
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/learning" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Learning Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏆 Earned Certifications & Credentials Vault</h1>
          <p className="text-sm text-slate-600">
            Download verified digital certificates, monitor statutory expiration dates, and initiate automated renewals.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/catalog" as Route}>
            <Button variant="primary">+ Earn New Certification</Button>
          </Link>
        </div>
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <Panel key={cert.id} className="flex flex-col justify-between space-y-4 p-5 border-t-4 border-t-primary">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">{cert.code}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{cert.title}</h3>
                </div>
                <Badge tone={cert.status === "ACTIVE" ? "success" : "warning"}>{cert.status}</Badge>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1.5 font-medium">
                <div>
                  <span className="text-slate-500">📜 Certificate ID:</span> <span className="font-mono font-bold text-slate-900">{cert.certificateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">🏛️ Issuer:</span> <span className="text-slate-900">{cert.issuingAuthority}</span>
                </div>
                <div>
                  <span className="text-slate-500">📅 Valid Period:</span> <span className="text-slate-900">{cert.issueDate} → {cert.expiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">🎯 Exam Score:</span> <span className="font-mono font-bold text-emerald-700">{cert.scorePercent}%</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {cert.status === "EXPIRING_SOON" ? (
                <Button variant="secondary">Renew Now</Button>
              ) : (
                <span className="text-xs text-emerald-700 font-semibold">✓ Verified Active</span>
              )}
              <Button variant="primary">📥 Download PDF</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
