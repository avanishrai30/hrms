"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { FileText, Inbox, ArrowUpRight } from "lucide-react";
import type { EmployeeRequestItem } from "../../../lib/queries/use-dashboard-queries";
import { SkeletonLoader } from "../feedback/aiavro-states";

interface OnboardingTaskRailProps {
  requests?: EmployeeRequestItem[];
  isLoading?: boolean;
  isError?: boolean;
}

export function OnboardingTaskRail({ requests = [], isLoading, isError }: OnboardingTaskRailProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="rounded-card bg-surface-raised border border-border-subtle p-4 shadow-card animate-pulse">
          <SkeletonLoader className="h-4 w-32 mb-2" />
          <SkeletonLoader className="h-2 w-full rounded-pill" />
        </div>
        <div className="rounded-card bg-[#18153B] p-5 border border-[#2B2758] space-y-3">
          <SkeletonLoader className="h-4 w-28 bg-white/20" />
          <SkeletonLoader className="h-12 w-full rounded-control bg-white/10" />
          <SkeletonLoader className="h-12 w-full rounded-control bg-white/10" />
        </div>
      </div>
    );
  }

  const completedRequests = requests.filter((r) => r.status === "APPROVED" || r.status === "RESOLVED");
  const totalCount = requests.length;
  const progressPercent = totalCount > 0 ? Math.round((completedRequests.length / totalCount) * 100) : 100;

  return (
    <div className="space-y-3">
      {/* Top Completion Header & Segmented Pill */}
      <div className="rounded-card bg-surface-raised border border-border-subtle p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Workflow Resolution</span>
          <span className="text-sm font-extrabold text-primary tabular-nums">
            {totalCount > 0 ? `${progressPercent}%` : "100%"}
          </span>
        </div>

        {/* Progress Track */}
        <div className="flex items-center gap-1.5 h-2 w-full">
          <div
            className="h-full rounded-pill bg-primary transition-all duration-500"
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
          <div className="h-full flex-1 rounded-pill bg-surface-muted" />
        </div>
      </div>

      {/* Dark Indigo Main Action Container */}
      <div className="rounded-card bg-[#18153B] text-white p-5 shadow-panel border border-[#2B2758]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Action Rail</h3>
            <p className="text-[11px] text-purple-200/70 font-medium">Service Requests</p>
          </div>
          <Link
            href={"/requests" as Route}
            className="w-6 h-6 rounded-pill bg-white/10 hover:bg-white/20 flex items-center justify-center text-purple-200 transition"
            title="View all requests"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isError ? (
          <div className="py-6 text-center text-purple-200/70 text-xs">
            Unable to load workflow items.
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-2">
            {requests.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-control bg-white/10 hover:bg-white/15 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-control bg-white/10 flex items-center justify-center text-purple-200 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {item.title || item.requestType.replace(/_/g, " ")}
                    </p>
                    <p className="text-[10px] text-purple-300/70 font-mono truncate">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-pill text-[10px] font-bold shrink-0 ${
                    item.status === "APPROVED" || item.status === "RESOLVED"
                      ? "bg-success/20 text-green-300"
                      : "bg-warning/20 text-amber-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-pill bg-white/10 flex items-center justify-center text-purple-200 mb-2">
              <Inbox className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">No pending requests</p>
            <p className="text-[10px] text-purple-300/70 mt-0.5">All service tasks are up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
