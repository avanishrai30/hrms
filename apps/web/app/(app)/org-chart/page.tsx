"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Network,
  ChevronDown,
  ChevronRight,
  User,
  ShieldCheck,
  Users
} from "lucide-react";
import { useOrgTree, useOrgChart, type OrgNodeView } from "../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

function OrgTreeNode({ node, level = 0 }: { node: OrgNodeView; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const initial = (node.name || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-2">
      <div
        className={`rounded-card bg-surface-raised border border-border-subtle p-4 shadow-card hover:border-primary/40 transition flex items-center justify-between gap-3 max-w-xl ${
          level > 0 ? "ml-4 sm:ml-8 border-l-4 border-l-primary/60" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted transition"
              aria-label={isExpanded ? "Collapse node" : "Expand node"}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center text-foreground-muted/40">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="w-9 h-9 rounded-panel bg-primary-soft text-primary font-bold flex items-center justify-center text-xs shrink-0">
            {initial}
          </div>

          <div className="min-w-0">
            <Link
              href={node.id ? (`/employees/${node.id}` as Route) : ("#" as Route)}
              className="text-xs font-bold text-foreground hover:text-primary transition truncate block"
            >
              {node.name}
            </Link>
            <p className="text-[10px] text-foreground-secondary truncate">
              {node.title || node.designation || "—"} {node.department ? `• ${node.department}` : ""}
            </p>
          </div>
        </div>

        {hasChildren && (
          <span className="px-2 py-0.5 rounded-pill bg-primary/10 text-primary text-[10px] font-bold shrink-0">
            {node.children!.length} direct
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-2 relative before:absolute before:left-3 before:top-0 before:bottom-2 before:w-0.5 before:bg-border-subtle">
          {node.children!.map((child: OrgNodeView, idx: number) => (
            <OrgTreeNode key={child.id || idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationHierarchyPage() {
  const gate = usePermissionGate(["directory.view", "organization.view"]);

  const chartQuery = useOrgChart(gate.isAuthorized);
  const treeQuery = useOrgTree(gate.isAuthorized && !chartQuery.data);

  const rootNode = chartQuery.data || treeQuery.data;
  const isLoading = chartQuery.isLoading || treeQuery.isLoading;
  const isError = chartQuery.isError && treeQuery.isError;

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="space-y-3">
          <SkeletonLoader className="h-20 max-w-xl rounded-card" />
          <SkeletonLoader className="h-20 ml-8 max-w-xl rounded-card" />
          <SkeletonLoader className="h-20 ml-16 max-w-xl rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Hierarchy Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`directory.view`) to explore the organizational hierarchy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization Hierarchy</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Interactive reporting tree from leadership down to functional units.
          </p>
        </div>

        <Link
          href={"/directory" as Route}
          className="px-3.5 py-2 rounded-control bg-surface-raised border border-border-subtle hover:bg-surface-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Users className="w-4 h-4 text-primary" />
          <span>People Directory</span>
        </Link>
      </div>

      {/* 2. Tree Canvas */}
      {isError || !rootNode ? (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Network className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No organizational reporting tree configured</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">
            Reporting structures will appear once manager assignments are configured.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-card bg-surface border border-border-subtle shadow-card space-y-4 overflow-x-auto">
          <OrgTreeNode node={rootNode} />
        </div>
      )}
    </div>
  );
}
