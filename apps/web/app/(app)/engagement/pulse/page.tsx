"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeePulsePage() {
  const [happiness, setHappiness] = useState<number>(4);
  const [stress, setStress] = useState<number>(2);
  const [energy, setEnergy] = useState<number>(4);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <Link href={"/engagement" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
          ← Back to Engagement
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">⚡ Weekly Morale & Pulse Check</h1>
        <p className="text-sm text-slate-600">
          How are you feeling this week? Your quick rating helps us maintain healthy team rhythms.
        </p>
      </div>

      {submitted ? (
        <Panel className="p-8 text-center space-y-4 border-emerald-500">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-slate-900">Thank you for sharing your feedback!</h2>
          <p className="text-sm text-slate-600">
            Your response has been logged anonymously to help improve team workload and support.
          </p>
          <div className="pt-2">
            <Link href={"/engagement" as Route}>
              <Button variant="primary">Return to Hub</Button>
            </Link>
          </div>
        </Panel>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel className="p-6 space-y-6">
            {/* Happiness Rating */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                1. Overall Happiness & Satisfaction this week:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { rating: 1, emoji: "😞", label: "Very Low" },
                  { rating: 2, emoji: "🙁", label: "Low" },
                  { rating: 3, emoji: "😐", label: "Neutral" },
                  { rating: 4, emoji: "😊", label: "Happy" },
                  { rating: 5, emoji: "🤩", label: "Vibrant" }
                ].map((item) => (
                  <button
                    key={item.rating}
                    type="button"
                    onClick={() => setHappiness(item.rating)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition ${
                      happiness === item.rating
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress Rating */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                2. Workload & Stress Level:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { rating: 1, label: "Very Relaxed" },
                  { rating: 2, label: "Manageable" },
                  { rating: 3, label: "Moderate" },
                  { rating: 4, label: "Elevated" },
                  { rating: 5, label: "Overwhelmed" }
                ].map((item) => (
                  <button
                    key={item.rating}
                    type="button"
                    onClick={() => setStress(item.rating)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs transition ${
                      stress === item.rating
                        ? "border-amber-500 bg-amber-50 text-amber-900 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Rating */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                3. Energy & Motivation:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { rating: 1, label: "Exhausted" },
                  { rating: 2, label: "Low Energy" },
                  { rating: 3, label: "Normal" },
                  { rating: 4, label: "High Energy" },
                  { rating: 5, label: "Fully Energized" }
                ].map((item) => (
                  <button
                    key={item.rating}
                    type="button"
                    onClick={() => setEnergy(item.rating)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs transition ${
                      energy === item.rating
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Any highlights, roadblocks, or context you’d like to mention? (Optional & Confidential)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share any thoughts or support you need..."
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Badge tone="success">🔒 100% Confidential</Badge>
              <Button variant="primary" type="submit">Submit Pulse Check 🚀</Button>
            </div>
          </Panel>
        </form>
      )}
    </div>
  );
}
