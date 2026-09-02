"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Sparkles, ArrowRight, HelpCircle } from "lucide-react";

export function AiavroCopilotCard() {
  return (
    <div className="rounded-card bg-gradient-to-r from-[#261A4E] to-[#3B2577] text-white p-5 shadow-panel border border-[#48338C] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Background glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-pill bg-accent-purple/20 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3.5 relative z-10">
        <div className="w-11 h-11 rounded-panel bg-white/10 border border-white/20 flex items-center justify-center text-purple-200 shadow-inner">
          <Sparkles className="w-5 h-5 text-accent-lavender" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">AIavro Intelligent Copilot</h3>
            <span className="px-2 py-0.5 rounded-pill bg-accent-purple/40 text-purple-200 text-[10px] font-bold border border-purple-300/30">
              RAG Active
            </span>
          </div>
          <p className="text-xs text-purple-200/80 mt-0.5">
            Ask questions about leave policies, salary slips, attendance guidelines, or get workforce summaries.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10 shrink-0">
        <Link
          href={"/ai/knowledge-base" as Route}
          className="px-3 py-2 rounded-pill bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition inline-flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Policy Search
        </Link>
        <Link
          href={"/ai" as Route}
          className="px-4 py-2 rounded-pill bg-white text-[#261A4E] hover:bg-purple-50 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
        >
          <span>Ask AIavro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
