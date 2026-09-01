"use client";

import { Badge, Panel } from "../../../components/ui";

export default function AiRecruitmentDashboardPage() {
  const hiringRisks = [
    {
      code: "REQ-2026-002",
      title: "Product Operations Lead",
      riskLevel: "HIGH",
      reason: "Critical Pipeline Shortage: Only 1 qualified application in 14 days.",
      recommendation: "Activate external recruiting agency or increase budgeted compensation band by 10%."
    },
    {
      code: "REQ-2026-001",
      title: "Senior Full Stack Engineer",
      riskLevel: "LOW",
      reason: "Healthy Inflow: 18 active candidates with 4 in final managerial evaluation.",
      recommendation: "Pipeline healthy. Expedite scorecard turnaround to prevent offer decline."
    }
  ];

  const declineRisks = [
    {
      candidate: "Vikram Malhotra",
      role: "Senior Full Stack Engineer",
      declineProbability: 58,
      riskDriver: "Long Notice Period (60 Days) + 15% lower than expected CTC",
      mitigationTip: "Propose ₹1.5L Joining Bonus and initiate weekly engagement touchpoints."
    },
    {
      candidate: "Priya Patel",
      role: "Senior Full Stack Engineer",
      declineProbability: 18,
      riskDriver: "Short Notice Period (15 Days) + CTC matched candidate expectations",
      mitigationTip: "Low decline risk. Send welcome kit and schedule team intro."
    }
  ];

  const dropOffs = [
    { stage: "Technical Deep Dive", dropOff: "38%", rootCause: "Live coding difficulty calibration mismatch" },
    { stage: "Managerial Round", dropOff: "18%", rootCause: "Role scope clarity & hybrid working policy" },
    { stage: "Offer Acceptance", dropOff: "12%", rootCause: "Counter-offers from current employer" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">AI Recruitment Intelligence & Risk Radar</h1>
        </div>
        <p className="text-sm text-zinc-500">Predictive talent acquisition modeling for requisitions, offer decline forecasting, and pipeline bottlenecks.</p>
      </div>

      {/* Probability Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-zinc-500 uppercase">High Joining Probability</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">4 Candidates</p>
          <span className="text-xs text-zinc-400">Notice period &lt; 30 days & CTC matched</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Moderate Decline Risk</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">2 Candidates</p>
          <span className="text-xs text-zinc-400">Notice period 30-60 days</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold text-zinc-500 uppercase">High Decline Risk</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">1 Candidate</p>
          <span className="text-xs text-zinc-400">Requires proactive mitigation</span>
        </Panel>
      </div>

      {/* Sourcing Latency & Delayed Requisition Risks */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-zinc-900">Delayed Requisition & Pipeline Shortage Alerts</h2>
        <div className="space-y-3">
          {hiringRisks.map((hr) => (
            <div
              key={hr.code}
              className={`p-4 rounded-panel border ${
                hr.riskLevel === "HIGH" ? "bg-rose-50/40 border-rose-200" : "bg-emerald-50/40 border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-zinc-500">{hr.code}</span>
                  <h3 className="font-semibold text-zinc-900">{hr.title}</h3>
                  <p className="text-xs text-zinc-600 mt-1">{hr.reason}</p>
                </div>
                <Badge tone={hr.riskLevel === "HIGH" ? "danger" : "success"}>
                  {hr.riskLevel} RISK
                </Badge>
              </div>
              <div className="mt-3 text-xs p-2.5 bg-white rounded-panel border border-border text-zinc-700">
                <span className="font-semibold text-primary">AI Recommendation:</span> {hr.recommendation}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Candidate Offer Decline Forecasting */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-zinc-900">Predictive Offer Decline Risk Radar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
              <tr>
                <th className="py-2.5 px-3">Candidate & Role</th>
                <th className="py-2.5 px-3">Decline Probability</th>
                <th className="py-2.5 px-3">Identified Risk Drivers</th>
                <th className="py-2.5 px-3">AI Recommended Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {declineRisks.map((cand) => (
                <tr key={cand.candidate} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-zinc-900">{cand.candidate}</p>
                    <p className="text-xs text-zinc-400">{cand.role}</p>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cand.declineProbability > 40 ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${cand.declineProbability}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-zinc-900">{cand.declineProbability}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-zinc-700">{cand.riskDriver}</td>
                  <td className="py-3 px-3 text-xs font-medium text-primary bg-primary/5 p-2 rounded">
                    {cand.mitigationTip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Stage Drop-off Analysis */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-zinc-900">Pipeline Stage Drop-Off Diagnostic</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dropOffs.map((doItem) => (
            <div key={doItem.stage} className="p-4 rounded-panel bg-zinc-50 border border-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-zinc-900">{doItem.stage}</span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {doItem.dropOff} Drop
                </span>
              </div>
              <p className="text-xs text-zinc-500">{doItem.rootCause}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
