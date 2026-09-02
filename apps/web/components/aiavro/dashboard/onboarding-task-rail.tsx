"use client";

import React, { useState } from "react";
import { FileText, Users, Sparkles, Shield, Bookmark, Check } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  subtitle?: string;
  completed: boolean;
  iconType?: "doc" | "meeting" | "security" | "ai" | "general";
}

interface OnboardingTaskRailProps {
  initialTasks?: TaskItem[];
}

export function OnboardingTaskRail({ initialTasks }: OnboardingTaskRailProps) {
  const defaultTasks: TaskItem[] = [
    { id: "1", title: "Complete Profile & Bank KYC", subtitle: "HR Document Vault", completed: true, iconType: "doc" },
    { id: "2", title: "Weekly 1-on-1 Sync", subtitle: "With Engineering Lead", completed: true, iconType: "meeting" },
    { id: "3", title: "Quarterly OKR Goals", subtitle: "Set Key Results", completed: false, iconType: "ai" },
    { id: "4", title: "Review Code of Conduct", subtitle: "Statutory Compliance", completed: false, iconType: "security" },
    { id: "5", title: "Asset Custody Acknowledgement", subtitle: "IT Hardware Vault", completed: false, iconType: "general" }
  ];

  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks || defaultTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const renderIcon = (type?: string) => {
    switch (type) {
      case "doc":
        return <FileText className="w-3.5 h-3.5" />;
      case "meeting":
        return <Users className="w-3.5 h-3.5" />;
      case "security":
        return <Shield className="w-3.5 h-3.5" />;
      case "ai":
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Bookmark className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Completion Header & Segmented Pill */}
      <div className="rounded-card bg-surface-raised border border-border-subtle p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Onboarding Progress</span>
          <span className="text-sm font-extrabold text-primary tabular-nums">{progressPercent}%</span>
        </div>

        {/* Segmented Progress Track */}
        <div className="flex items-center gap-1.5 h-2 w-full">
          <div
            className="h-full rounded-pill bg-primary transition-all duration-500"
            style={{ width: `${Math.max(10, progressPercent)}%` }}
          />
          <div className="h-full flex-1 rounded-pill bg-surface-muted" />
        </div>
      </div>

      {/* Dark Indigo Main Checklist Container */}
      <div className="rounded-card bg-[#18153B] text-white p-5 shadow-panel border border-[#2B2758]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Action Rail</h3>
            <p className="text-[11px] text-purple-200/70 font-medium">Pending Checklist</p>
          </div>
          <span className="px-2.5 py-1 rounded-pill bg-white/10 text-xs font-mono font-bold text-purple-200">
            {completedCount}/{tasks.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-2.5 rounded-control cursor-pointer transition-all flex items-center justify-between gap-3 ${
                task.completed
                  ? "bg-white/5 opacity-75 hover:opacity-100"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-control bg-white/10 flex items-center justify-center text-purple-200 shrink-0">
                  {renderIcon(task.iconType)}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${
                      task.completed ? "line-through text-purple-300/60" : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.subtitle && (
                    <p className="text-[10px] text-purple-300/70 font-medium truncate">{task.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {task.completed ? (
                  <div className="w-5 h-5 rounded-pill bg-primary flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-pill border-2 border-white/40 hover:border-white transition" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
