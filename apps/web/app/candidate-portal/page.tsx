"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../components/ui";

export default function CandidatePortalPage() {
  const [trackingCode, setTrackingCode] = useState("APP-2026-0001");
  const [searched, setSearched] = useState(true);
  const [offerAccepted, setOfferAccepted] = useState(false);

  const mockApp = {
    code: "APP-2026-0001",
    candidateName: "Aakash Sharma",
    jobTitle: "Senior Full Stack Engineer",
    department: "Engineering",
    stage: "OFFER",
    appliedDate: "August 20, 2026",
    interviews: [
      { round: "Technical Round", date: "Aug 24, 2026", status: "COMPLETED" },
      { round: "Manager Round", date: "Aug 28, 2026", status: "COMPLETED" }
    ],
    offer: {
      code: "OFF-2026-002",
      totalCtc: "₹26,00,000 / Year",
      joiningDate: "October 15, 2026",
      status: "RELEASED"
    },
    preboardingTasks: [
      { id: "pb-1", title: "Upload PAN & Aadhaar Cards", status: "PENDING" },
      { id: "pb-2", title: "Bank Account Details for Salary Disbursal", status: "PENDING" },
      { id: "pb-3", title: "Sign Company NDA & Code of Conduct", status: "PENDING" }
    ]
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Candidate Self-Service Portal</h1>
            <p className="text-sm text-zinc-500">Track your recruitment progress, review offers, and complete preboarding.</p>
          </div>
          <Link href={"/careers" as Route}>
            <Button variant="secondary">🌐 Explore Careers</Button>
          </Link>
        </div>

        {/* Tracking Search Bar */}
        <Panel className="p-4 bg-white shadow-xs">
          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter your Application Code (e.g. APP-2026-0001)..."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
            </div>
            <Button variant="primary" type="submit">
              Track Application
            </Button>
          </form>
        </Panel>

        {searched && (
          <div className="space-y-6">
            {/* Status Snapshot */}
            <Panel className="p-6 bg-white space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono text-zinc-400">{mockApp.code}</span>
                  <h2 className="text-xl font-bold text-zinc-900">{mockApp.candidateName}</h2>
                  <p className="text-sm text-zinc-600">{mockApp.jobTitle} • {mockApp.department}</p>
                </div>
                <div>
                  <Badge tone="success">STAGE: {mockApp.stage}</Badge>
                </div>
              </div>

              {/* Recruitment Timeline */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-zinc-900">Application Progression</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-panel bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="font-bold block">1. Applied</span>
                    <span className="text-[10px] text-zinc-500">{mockApp.appliedDate}</span>
                  </div>
                  <div className="p-2.5 rounded-panel bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="font-bold block">2. Interviews</span>
                    <span className="text-[10px] text-zinc-500">2 Rounds Passed</span>
                  </div>
                  <div className="p-2.5 rounded-panel bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="font-bold block">3. Offer Letter</span>
                    <span className="text-[10px] text-emerald-700">Released & Ready</span>
                  </div>
                  <div className="p-2.5 rounded-panel bg-zinc-50 text-zinc-600 border border-border">
                    <span className="font-bold block">4. Day 1 Joining</span>
                    <span className="text-[10px] text-zinc-400">{mockApp.offer.joiningDate}</span>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Offer Letter Card if Released */}
            <Panel className="p-6 bg-white space-y-4 border-l-4 border-l-primary shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <Badge tone="warning">OFFER LETTER DISPATCHED</Badge>
                  <h3 className="mt-2 text-lg font-bold text-zinc-900">Congratulations! An official offer has been extended.</h3>
                  <p className="text-xs text-zinc-500">Please review the compensation terms and submit your response.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-panel text-xs border border-border">
                <div>
                  <span className="text-zinc-400 block">Offer Reference</span>
                  <span className="font-mono font-bold text-zinc-900">{mockApp.offer.code}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Total Annual CTC</span>
                  <span className="font-bold text-zinc-900 text-sm">{mockApp.offer.totalCtc}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Joining Date</span>
                  <span className="font-bold text-zinc-900">{mockApp.offer.joiningDate}</span>
                </div>
              </div>

              {offerAccepted ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-panel text-emerald-800 text-xs font-semibold">
                  ✓ You have accepted this offer! Please complete your preboarding document verification below.
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <Button variant="primary" onClick={() => setOfferAccepted(true)}>
                    🎉 Accept Offer Letter
                  </Button>
                  <Button variant="secondary">
                    Decline Offer
                  </Button>
                </div>
              )}
            </Panel>

            {/* Preboarding Task Uploads */}
            <Panel className="p-6 bg-white space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-zinc-900">Preboarding Verification Checklists</h3>
              <p className="text-xs text-zinc-500">Upload your statutory documents for verification prior to your joining date.</p>

              <div className="space-y-3">
                {mockApp.preboardingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-panel bg-zinc-50 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">{task.title}</p>
                      <span className="text-[10px] text-zinc-400">Required for payroll & identity verification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        className="text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-panel file:border file:border-border file:text-xs file:bg-white"
                      />
                      <Button variant="primary">Submit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
