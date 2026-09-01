"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeENPSPage() {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score === null) return;
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <Link href={"/engagement" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
          ← Back to Engagement
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">📊 Quarterly eNPS Campaign (Q3 2026)</h1>
        <p className="text-sm text-slate-600">
          How likely are you to recommend our company as a great place to work to a friend or colleague?
        </p>
      </div>

      {submitted ? (
        <Panel className="p-8 text-center space-y-4 border-emerald-500">
          <div className="text-5xl">✨</div>
          <h2 className="text-xl font-bold text-slate-900">Thank you for your rating!</h2>
          <p className="text-sm text-slate-600">
            Your feedback directly shapes leadership decisions, company benefits, and workplace culture.
          </p>
          <div className="pt-2">
            <Link href={"/engagement" as Route}>
              <Button variant="primary">Back to Hub</Button>
            </Link>
          </div>
        </Panel>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>0 = Not at all likely</span>
                <span>10 = Extremely likely</span>
              </div>
              <div className="grid grid-cols-11 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScore(val)}
                    className={`py-3 rounded text-center text-sm font-bold transition ${
                      score === val
                        ? val >= 9
                          ? "bg-emerald-600 text-white shadow"
                          : val >= 7
                          ? "bg-amber-500 text-white shadow"
                          : "bg-rose-600 text-white shadow"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                What is the primary reason for your score? (Confidential)
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what we are doing well and what we can improve..."
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Badge tone="success">🔒 Anonymous Submission</Badge>
              <Button variant="primary" type="submit" disabled={score === null}>
                Submit eNPS Rating 🚀
              </Button>
            </div>
          </Panel>
        </form>
      )}
    </div>
  );
}
