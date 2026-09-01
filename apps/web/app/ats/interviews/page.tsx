"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

interface InterviewScorecard {
  overallScore: number;
  recommendation: "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE" | string;
  technical: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
}

interface InterviewItem {
  id: string;
  candidateName: string;
  jobTitle: string;
  roundName: string;
  type: string;
  scheduledTime: string;
  panel: string[];
  status: string;
  meetingLink?: string;
  scorecard?: InterviewScorecard;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([
    {
      id: "int-1",
      candidateName: "Aakash Sharma",
      jobTitle: "Senior Full Stack Engineer",
      roundName: "Technical Deep Dive & Architecture",
      type: "VIDEO",
      scheduledTime: "Today at 03:00 PM - 04:00 PM",
      panel: ["Prakash Rao (Lead Architect)", "Neha Gupta (Senior SRE)"],
      status: "SCHEDULED",
      meetingLink: "https://meet.google.com/xyz-abcd-efg"
    },
    {
      id: "int-2",
      candidateName: "Priya Patel",
      jobTitle: "Senior Full Stack Engineer",
      roundName: "Engineering Manager Fit",
      type: "VIDEO",
      scheduledTime: "Today at 05:00 PM - 06:00 PM",
      panel: ["Rahul Verma (VP Engineering)"],
      status: "SCHEDULED",
      meetingLink: "https://meet.google.com/uvw-pqrs-tuv"
    },
    {
      id: "int-3",
      candidateName: "Sneha Mukherjee",
      jobTitle: "Talent Acquisition Specialist",
      roundName: "HR & Culture Alignment",
      type: "PANEL",
      scheduledTime: "Yesterday at 02:00 PM",
      panel: ["Tanvi Deshmukh (Head of HR)"],
      status: "COMPLETED",
      scorecard: {
        overallScore: 4.6,
        recommendation: "STRONG_HIRE",
        technical: 5,
        communication: 5,
        problemSolving: 4,
        cultureFit: 5
      }
    }
  ]);

  const [activeScorecard, setActiveScorecard] = useState<{
    interviewId: string;
    candidateName: string;
    technical: number;
    communication: number;
    problemSolving: number;
    cultureFit: number;
    leadership: number;
    experienceScore: number;
    recommendation: "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE";
    notes: string;
  } | null>(null);

  const openScorecard = (interview: InterviewItem) => {
    setActiveScorecard({
      interviewId: interview.id,
      candidateName: interview.candidateName,
      technical: 4,
      communication: 4,
      problemSolving: 4,
      cultureFit: 4,
      leadership: 4,
      experienceScore: 4,
      recommendation: "HIRE",
      notes: "Candidate demonstrated solid domain grasp and clear communication."
    });
  };

  const handleScorecardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScorecard) return;

    const weightedScore = Number(
      (
        activeScorecard.technical * 0.25 +
        activeScorecard.problemSolving * 0.20 +
        activeScorecard.experienceScore * 0.20 +
        activeScorecard.communication * 0.15 +
        activeScorecard.cultureFit * 0.10 +
        activeScorecard.leadership * 0.10
      ).toFixed(2)
    );

    setInterviews((prev) =>
      prev.map((item) =>
        item.id === activeScorecard.interviewId
          ? {
              ...item,
              status: "COMPLETED",
              scorecard: {
                overallScore: weightedScore,
                recommendation: activeScorecard.recommendation,
                technical: activeScorecard.technical,
                communication: activeScorecard.communication,
                problemSolving: activeScorecard.problemSolving,
                cultureFit: activeScorecard.cultureFit
              }
            }
          : item
      )
    );
    setActiveScorecard(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Interview Schedules & Scorecards</h1>
          <p className="text-sm text-zinc-500">Coordinate evaluation rounds, manage panel members, and record structured 6-criteria scorecards.</p>
        </div>
        <Link href={"/ats/pipeline" as Route}>
          <Button variant="secondary">📋 View ATS Pipeline</Button>
        </Link>
      </div>

      {/* Interviews Table */}
      <Panel className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
              <tr>
                <th className="py-2.5 px-3">Candidate & Role</th>
                <th className="py-2.5 px-3">Interview Round</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Panel Members</th>
                <th className="py-2.5 px-3">Meeting Link</th>
                <th className="py-2.5 px-3">Status / Result</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {interviews.map((int) => (
                <tr key={int.id} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-zinc-900">{int.candidateName}</p>
                    <p className="text-xs text-zinc-400">{int.jobTitle}</p>
                  </td>
                  <td className="py-3 px-3 font-medium text-zinc-800">{int.roundName}</td>
                  <td className="py-3 px-3 text-xs text-zinc-600 font-mono">{int.scheduledTime}</td>
                  <td className="py-3 px-3 text-xs text-zinc-600">
                    {int.panel.map((p, idx) => (
                      <div key={idx}>• {p}</div>
                    ))}
                  </td>
                  <td className="py-3 px-3 text-xs">
                    {int.meetingLink ? (
                      <a href={int.meetingLink} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline">
                        Join Meeting ↗
                      </a>
                    ) : (
                      <span className="text-zinc-400">In-person</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {int.scorecard ? (
                      <div className="space-y-0.5">
                        <Badge tone={int.scorecard.recommendation === "STRONG_HIRE" ? "success" : "neutral"}>
                          {int.scorecard.recommendation} ({int.scorecard.overallScore}/5.0)
                        </Badge>
                      </div>
                    ) : (
                      <Badge tone="warning">SCHEDULED</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {int.status === "SCHEDULED" ? (
                      <Button variant="primary" onClick={() => openScorecard(int)}>
                        📝 Fill Scorecard
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={() => openScorecard(int)}>
                        View Scorecard
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Scorecard Modal */}
      {activeScorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-xl p-6 bg-white space-y-4 rounded-panel shadow-2xl">
            <div className="border-b border-border pb-3 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Evaluation Scorecard</h2>
                <p className="text-xs text-zinc-500">Candidate: {activeScorecard.candidateName}</p>
              </div>
              <button onClick={() => setActiveScorecard(null)} className="text-zinc-400 hover:text-zinc-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleScorecardSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-700">1. Technical Proficiency (25%)</label>
                  <select
                    className="w-full mt-1 border border-border rounded-panel p-2 text-sm bg-white"
                    value={activeScorecard.technical}
                    onChange={(e) => setActiveScorecard({ ...activeScorecard, technical: parseInt(e.target.value, 10) })}
                  >
                    <option value="5">5 - Exceptional / Expert</option>
                    <option value="4">4 - Strong / Exceeds</option>
                    <option value="3">3 - Competent / Meets</option>
                    <option value="2">2 - Needs Improvement</option>
                    <option value="1">1 - Unsatisfactory</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700">2. Problem Solving & Logic (20%)</label>
                  <select
                    className="w-full mt-1 border border-border rounded-panel p-2 text-sm bg-white"
                    value={activeScorecard.problemSolving}
                    onChange={(e) => setActiveScorecard({ ...activeScorecard, problemSolving: parseInt(e.target.value, 10) })}
                  >
                    <option value="5">5 - Exceptional</option>
                    <option value="4">4 - Strong</option>
                    <option value="3">3 - Competent</option>
                    <option value="2">2 - Marginal</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700">3. Relevant Experience (20%)</label>
                  <select
                    className="w-full mt-1 border border-border rounded-panel p-2 text-sm bg-white"
                    value={activeScorecard.experienceScore}
                    onChange={(e) => setActiveScorecard({ ...activeScorecard, experienceScore: parseInt(e.target.value, 10) })}
                  >
                    <option value="5">5 - Extensive Domain Match</option>
                    <option value="4">4 - High Alignment</option>
                    <option value="3">3 - Baseline Relevant</option>
                    <option value="2">2 - Partial Match</option>
                    <option value="1">1 - Insufficient</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700">4. Communication & Clarity (15%)</label>
                  <select
                    className="w-full mt-1 border border-border rounded-panel p-2 text-sm bg-white"
                    value={activeScorecard.communication}
                    onChange={(e) => setActiveScorecard({ ...activeScorecard, communication: parseInt(e.target.value, 10) })}
                  >
                    <option value="5">5 - Articulate & Influential</option>
                    <option value="4">4 - Clear & Structured</option>
                    <option value="3">3 - Satisfactory</option>
                    <option value="2">2 - Hesitant</option>
                    <option value="1">1 - Unclear</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700">5. Culture & Values Alignment (10%)</label>
                  <select
                    className="w-full mt-1 border border-border rounded-panel p-2 text-sm bg-white"
                    value={activeScorecard.cultureFit}
                    onChange={(e) => setActiveScorecard({ ...activeScorecard, cultureFit: parseInt(e.target.value, 10) })}
                  >
                    <option value="5">5 - Exemplary Role Model</option>
                    <option value="4">4 - Strong Cultural Fit</option>
                    <option value="3">3 - Compatible</option>
                    <option value="2">2 - Minor Friction</option>
                    <option value="1">1 - Value Mismatch</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700">6. Leadership & Ownership (10%)</label>
                  <select
                    className="w-full mt-1 border border-border rounded-panel p-2 text-sm bg-white"
                    value={activeScorecard.leadership}
                    onChange={(e) => setActiveScorecard({ ...activeScorecard, leadership: parseInt(e.target.value, 10) })}
                  >
                    <option value="5">5 - Proactive Catalyst</option>
                    <option value="4">4 - Strong Ownership</option>
                    <option value="3">3 - Reliable Contributor</option>
                    <option value="2">2 - Reactive</option>
                    <option value="1">1 - Lacks Initiative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Final Hiring Recommendation</label>
                <select
                  className="w-full mt-1 border border-border rounded-panel p-2 text-sm bg-white font-semibold"
                  value={activeScorecard.recommendation}
                  onChange={(e) => setActiveScorecard({ ...activeScorecard, recommendation: e.target.value as "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE" })}
                >
                  <option value="STRONG_HIRE">🌟 Strong Hire</option>
                  <option value="HIRE">✅ Hire</option>
                  <option value="NO_HIRE">⚠️ No Hire</option>
                  <option value="STRONG_NO_HIRE">🚫 Strong No Hire</option>
                </select>
              </div>

              <Field label="Interviewer Notes & Key Observations">
                <Input
                  value={activeScorecard.notes}
                  onChange={(e) => setActiveScorecard({ ...activeScorecard, notes: e.target.value })}
                />
              </Field>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setActiveScorecard(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit Scorecard
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
