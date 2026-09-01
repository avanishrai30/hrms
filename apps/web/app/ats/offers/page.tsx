"use client";

import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function OffersPage() {
  const [offers, setOffers] = useState([
    {
      id: "off-1",
      code: "OFF-2026-001",
      candidateName: "Sneha Mukherjee",
      candidateEmail: "sneha.m@example.com",
      role: "Talent Acquisition Specialist",
      baseSalary: 1400000,
      joiningBonus: 100000,
      variablePay: 100000,
      totalCtc: 1600000,
      joiningDate: "2026-10-01",
      status: "ACCEPTED",
      currentStage: "COMPLETED",
      approvals: [
        { role: "HR", status: "APPROVED" },
        { role: "DEPT_HEAD", status: "APPROVED" },
        { role: "FINANCE", status: "APPROVED" },
        { role: "CEO", status: "APPROVED" }
      ]
    },
    {
      id: "off-2",
      code: "OFF-2026-002",
      candidateName: "Aakash Sharma",
      candidateEmail: "aakash.sharma@example.com",
      role: "Senior Full Stack Engineer",
      baseSalary: 2200000,
      joiningBonus: 200000,
      variablePay: 200000,
      totalCtc: 2600000,
      joiningDate: "2026-10-15",
      status: "RELEASED",
      currentStage: "COMPLETED",
      approvals: [
        { role: "HR", status: "APPROVED" },
        { role: "DEPT_HEAD", status: "APPROVED" },
        { role: "FINANCE", status: "APPROVED" },
        { role: "CEO", status: "APPROVED" }
      ]
    },
    {
      id: "off-3",
      code: "OFF-2026-003",
      candidateName: "Priya Patel",
      candidateEmail: "priya.patel@example.com",
      role: "Senior Full Stack Engineer",
      baseSalary: 2400000,
      joiningBonus: 150000,
      variablePay: 250000,
      totalCtc: 2800000,
      joiningDate: "2026-11-01",
      status: "PENDING_APPROVAL",
      currentStage: "FINANCE",
      approvals: [
        { role: "HR", status: "APPROVED" },
        { role: "DEPT_HEAD", status: "APPROVED" },
        { role: "FINANCE", status: "PENDING" },
        { role: "CEO", status: "PENDING" }
      ]
    }
  ]);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    candidateName: "Rohan Verma",
    candidateEmail: "rohan.verma@example.com",
    role: "Product Operations Lead",
    baseSalary: "2000000",
    joiningBonus: "100000",
    variablePay: "100000",
    totalCtc: "2200000",
    joiningDate: "2026-10-15"
  });

  const [onboardingSuccess, setOnboardingSuccess] = useState<string | null>(null);

  const handleGenerateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `off-${Date.now()}`,
      code: `OFF-2026-00${offers.length + 1}`,
      candidateName: newOffer.candidateName,
      candidateEmail: newOffer.candidateEmail,
      role: newOffer.role,
      baseSalary: parseFloat(newOffer.baseSalary) || 0,
      joiningBonus: parseFloat(newOffer.joiningBonus) || 0,
      variablePay: parseFloat(newOffer.variablePay) || 0,
      totalCtc: parseFloat(newOffer.totalCtc) || 0,
      joiningDate: newOffer.joiningDate,
      status: "PENDING_APPROVAL",
      currentStage: "HR",
      approvals: [
        { role: "HR", status: "PENDING" },
        { role: "DEPT_HEAD", status: "PENDING" },
        { role: "FINANCE", status: "PENDING" },
        { role: "CEO", status: "PENDING" }
      ]
    };
    setOffers([created, ...offers]);
    setShowGenerateModal(false);
  };

  const handleAdvanceApproval = (offerId: string) => {
    setOffers((prev) =>
      prev.map((off) => {
        if (off.id !== offerId) return off;
        if (off.currentStage === "HR") {
          return { ...off, currentStage: "DEPT_HEAD" };
        } else if (off.currentStage === "DEPT_HEAD") {
          return { ...off, currentStage: "FINANCE" };
        } else if (off.currentStage === "FINANCE") {
          return { ...off, currentStage: "CEO" };
        } else if (off.currentStage === "CEO") {
          return { ...off, currentStage: "COMPLETED", status: "APPROVED" };
        }
        return off;
      })
    );
  };

  const handleReleaseOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((off) =>
        off.id === offerId ? { ...off, status: "RELEASED" } : off
      )
    );
  };

  const handleOnboardCandidate = (offer: { candidateName: string }) => {
    setOnboardingSuccess(
      `🎉 Successfully onboarded ${offer.candidateName} as Active Employee! Generated Employee ID (EMP-0148), provisioned ESS portal account, allocated default leaves, and activated salary compensation.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Offer Management & Approvals</h1>
          <p className="text-sm text-zinc-500">Generate structured offer letters, route 4-tier approval chains, and transition to employee onboarding.</p>
        </div>
        <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
          + Generate New Offer
        </Button>
      </div>

      {onboardingSuccess && (
        <div className="p-4 rounded-panel bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start justify-between">
          <span>{onboardingSuccess}</span>
          <button onClick={() => setOnboardingSuccess(null)} className="font-bold text-emerald-900 ml-4">✕</button>
        </div>
      )}

      {/* Offers Table */}
      <Panel className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
              <tr>
                <th className="py-2.5 px-3">Offer Code</th>
                <th className="py-2.5 px-3">Candidate & Role</th>
                <th className="py-2.5 px-3">Total CTC Breakdown</th>
                <th className="py-2.5 px-3">Joining Date</th>
                <th className="py-2.5 px-3">Approval Flow (HR → Dept → Fin → CEO)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {offers.map((off) => (
                <tr key={off.id} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-3 font-mono text-xs text-zinc-500">{off.code}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-zinc-900">{off.candidateName}</p>
                    <p className="text-xs text-zinc-400">{off.role}</p>
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <p className="font-bold text-zinc-900 text-sm">₹{(off.totalCtc / 100000).toFixed(2)} LPA</p>
                    <p className="text-zinc-400">Base: ₹{(off.baseSalary / 100000).toFixed(1)}L | Bonus: ₹{(off.joiningBonus / 100000).toFixed(1)}L</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">{off.joiningDate}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {["HR", "DEPT_HEAD", "FINANCE", "CEO"].map((r, idx) => {
                        const isDone =
                          off.currentStage === "COMPLETED" ||
                          (off.currentStage === "DEPT_HEAD" && idx === 0) ||
                          (off.currentStage === "FINANCE" && idx <= 1) ||
                          (off.currentStage === "CEO" && idx <= 2);
                        return (
                          <span
                            key={r}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isDone
                                ? "bg-emerald-100 text-emerald-800"
                                : off.currentStage === r
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : "bg-zinc-100 text-zinc-400"
                            }`}
                          >
                            {r}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      tone={
                        off.status === "ACCEPTED"
                          ? "success"
                          : off.status === "RELEASED"
                          ? "neutral"
                          : "warning"
                      }
                    >
                      {off.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {off.status === "PENDING_APPROVAL" && (
                      <Button variant="primary" onClick={() => handleAdvanceApproval(off.id)}>
                        Approve ({off.currentStage})
                      </Button>
                    )}
                    {off.status === "APPROVED" && (
                      <Button variant="primary" onClick={() => handleReleaseOffer(off.id)}>
                        Release Offer 🚀
                      </Button>
                    )}
                    {off.status === "ACCEPTED" && (
                      <Button variant="primary" onClick={() => handleOnboardCandidate(off)}>
                        ⚡ Onboard Employee
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Generate Offer Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-lg p-6 bg-white space-y-4 rounded-panel shadow-2xl">
            <h2 className="text-lg font-bold text-zinc-900 border-b border-border pb-3">Generate Offer Letter</h2>
            <form onSubmit={handleGenerateOffer} className="space-y-3">
              <Field label="Candidate Name">
                <Input
                  required
                  value={newOffer.candidateName}
                  onChange={(e) => setNewOffer({ ...newOffer, candidateName: e.target.value })}
                />
              </Field>
              <Field label="Role Title">
                <Input
                  required
                  value={newOffer.role}
                  onChange={(e) => setNewOffer({ ...newOffer, role: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Base Salary (₹)">
                  <Input
                    required
                    value={newOffer.baseSalary}
                    onChange={(e) => setNewOffer({ ...newOffer, baseSalary: e.target.value })}
                  />
                </Field>
                <Field label="Joining Bonus (₹)">
                  <Input
                    value={newOffer.joiningBonus}
                    onChange={(e) => setNewOffer({ ...newOffer, joiningBonus: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Total CTC (₹)">
                  <Input
                    required
                    value={newOffer.totalCtc}
                    onChange={(e) => setNewOffer({ ...newOffer, totalCtc: e.target.value })}
                  />
                </Field>
                <Field label="Joining Date">
                  <Input
                    type="date"
                    required
                    value={newOffer.joiningDate}
                    onChange={(e) => setNewOffer({ ...newOffer, joiningDate: e.target.value })}
                  />
                </Field>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Initiate Approvals
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
