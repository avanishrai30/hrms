"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type { OrgHierarchyNode } from "@vc-wms/shared-types";

interface ReportingNode {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  status: string;
  department?: { name: string } | null;
  designation?: { name: string } | null;
  businessUnit?: { name: string } | null;
  region?: { name: string } | null;
  team?: { name: string } | null;
  level: number;
}

function OrgTreeNodeItem({ node }: { node: OrgHierarchyNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const typeConfig: Record<string, { label: string; badgeTone: "neutral" | "success" | "warning" | "danger"; icon: string }> = {
    BUSINESS_UNIT: { label: "Business Unit", badgeTone: "neutral", icon: "🏢" },
    REGION: { label: "Region", badgeTone: "success", icon: "📍" },
    DEPARTMENT: { label: "Department", badgeTone: "warning", icon: "👥" },
    TEAM: { label: "Team", badgeTone: "neutral", icon: "⚡" }
  };

  const config = typeConfig[node.type] ?? { label: node.type, badgeTone: "neutral" as const, icon: "📁" };

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center justify-between rounded-control border border-border bg-surface p-3 transition hover:border-primary/50 ${
          node.type === "BUSINESS_UNIT"
            ? "border-l-4 border-l-primary shadow-sm"
            : node.type === "REGION"
            ? "border-l-4 border-l-emerald-500"
            : node.type === "DEPARTMENT"
            ? "border-l-4 border-l-amber-500"
            : "border-l-4 border-l-zinc-400"
        }`}
      >
        <div className="flex items-center gap-3">
          {hasChildren && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="grid h-6 w-6 place-items-center rounded bg-muted text-xs font-bold text-zinc-600 hover:bg-zinc-200"
            >
              {isOpen ? "−" : "+"}
            </button>
          )}
          {!hasChildren && <span className="w-6 text-center text-xs text-zinc-300">•</span>}
          <span className="text-base">{config.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-950">{node.name}</span>
              <span className="font-mono text-xs text-zinc-400">({node.code})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone={config.badgeTone}>{config.label}</Badge>
          {hasChildren && (
            <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              {node.children.length} sub-units
            </span>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="ml-6 space-y-2 border-l-2 border-dashed border-border pl-4">
          {node.children.map((child) => (
            <OrgTreeNodeItem key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [tree, setTree] = useState<OrgHierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick stats
  const [buCount, setBuCount] = useState(0);
  const [regionCount, setRegionCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [deptCount, setDeptCount] = useState(0);

  // Reporting line inspection
  const [searchEmployeeId, setSearchEmployeeId] = useState("");
  const [reportingChain, setReportingChain] = useState<ReportingNode[] | null>(null);
  const [isResolvingChain, setIsResolvingChain] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [treeRes, buRes, regRes, teamRes, deptRes] = await Promise.all([
        apiRequest<OrgHierarchyNode[]>("/organization/tree"),
        apiRequest<unknown[]>("/organization/business-units").catch(() => []),
        apiRequest<unknown[]>("/organization/regions").catch(() => []),
        apiRequest<unknown[]>("/organization/teams").catch(() => []),
        apiRequest<unknown[]>("/departments").catch(() => [])
      ]);

      setTree(treeRes ?? []);
      setBuCount(buRes.length);
      setRegionCount(regRes.length);
      setTeamCount(teamRes.length);
      setDeptCount(deptRes.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load organizational hierarchy.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleResolveChain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmployeeId) return;
    try {
      setIsResolvingChain(true);
      setChainError(null);
      const chain = await apiRequest<ReportingNode[]>(`/organization/reporting-chain/${searchEmployeeId}`);
      setReportingChain(chain ?? []);
    } catch (err: unknown) {
      setChainError(err instanceof Error ? err.message : "Failed to resolve reporting line.");
      setReportingChain(null);
    } finally {
      setIsResolvingChain(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Enterprise Organization Structure</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Hierarchical visualization across Business Units, Regional hubs, Departments, and Functional Teams.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={"/organization/business-units" as Route}>
            <Button variant="secondary">Business Units Directory</Button>
          </Link>
          <Link href={"/organization/teams" as Route}>
            <Button variant="secondary">Teams Directory</Button>
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-control border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Business Units</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950">{buCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Autonomous business lines</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Regions & Hubs</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950">{regionCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Geographic branches</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Departments</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950">{deptCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Functional areas</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Functional Teams</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950">{teamCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Operational squads</p>
        </Panel>
      </div>

      {/* Main Grid: Tree View + Reporting Chain Resolver */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Visual Org Tree */}
        <Panel className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-semibold text-zinc-950">Hierarchical Structure</h2>
            <Button variant="ghost" className="text-xs h-7" onClick={loadData}>
              Refresh Tree
            </Button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-zinc-500">Constructing organization tree...</div>
          ) : tree.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              No organization units defined. Start by creating Business Units or Teams.
            </div>
          ) : (
            <div className="space-y-3">
              {tree.map((rootNode) => (
                <OrgTreeNodeItem key={rootNode.id} node={rootNode} />
              ))}
            </div>
          )}
        </Panel>

        {/* Reporting Line Inspector */}
        <Panel className="lg:col-span-1 space-y-4">
          <h2 className="text-base font-semibold text-zinc-950">Reporting Chain Inspector</h2>
          <p className="text-xs text-zinc-600">
            Query any employee UUID to trace their complete management chain up to executive leadership.
          </p>

          <form onSubmit={handleResolveChain} className="space-y-3">
            <Input
              required
              placeholder="Enter Employee UUID..."
              value={searchEmployeeId}
              onChange={(e) => setSearchEmployeeId(e.target.value)}
            />
            <Button variant="primary" type="submit" className="w-full h-9 text-xs" disabled={isResolvingChain}>
              {isResolvingChain ? "Resolving..." : "Trace Reporting Line"}
            </Button>
          </form>

          {chainError && (
            <div className="rounded-control bg-red-50 p-3 text-xs text-red-700">{chainError}</div>
          )}

          {reportingChain && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Reporting Chain ({reportingChain.length} Levels)
              </h3>
              <div className="space-y-2">
                {reportingChain.map((node, i) => (
                  <div
                    key={node.id}
                    className={`rounded-control border p-3 text-xs ${
                      i === 0
                        ? "border-primary/50 bg-primary/5 font-semibold text-zinc-950"
                        : "border-border bg-surface text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{i === 0 ? "Target Employee" : `Level ${i} Manager`}</span>
                      <span className="font-mono text-[11px] text-zinc-400">{node.employeeCode}</span>
                    </div>
                    <p className="mt-1 font-bold text-sm text-zinc-950">{node.fullName}</p>
                    <p className="text-zinc-500">{node.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-zinc-600">
                      {node.designation && <span>{node.designation.name}</span>}
                      {node.department && <span>• {node.department.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
