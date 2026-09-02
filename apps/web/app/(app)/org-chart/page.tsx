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
import { Card, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";

function OrgTreeNode({ node, level = 0 }: { node: OrgNodeView; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const initial = (node.name || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-2">
      <Card
        className={`border border-border bg-card p-3 shadow-xs transition hover:shadow-sm flex items-center justify-between gap-3 max-w-xl ${
          level > 0 ? "ml-4 sm:ml-8 border-l-4 border-l-primary" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground transition"
              aria-label={isExpanded ? "Collapse node" : "Expand node"}
            >
              {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          ) : (
            <div className="size-6 flex items-center justify-center text-muted-foreground/40">
              <User className="size-3" />
            </div>
          )}

          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <Link
              href={node.id ? (`/employees/${node.id}` as Route) : ("#" as Route)}
              className="text-xs font-semibold text-foreground hover:underline truncate block"
            >
              {node.name}
            </Link>
            <p className="text-[11px] text-muted-foreground truncate">
              {node.title || node.designation || "—"} {node.department ? `• ${node.department}` : ""}
            </p>
          </div>
        </div>

        {hasChildren && (
          <Badge variant="secondary" className="text-[10px] px-2">
            {node.children!.length} direct
          </Badge>
        )}
      </Card>

      {hasChildren && isExpanded && (
        <div className="space-y-2 relative before:absolute before:left-3 before:top-0 before:bottom-2 before:w-px before:bg-border">
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
      <div className="flex flex-col gap-5 max-w-5xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="space-y-3">
          <div className="h-16 max-w-xl rounded-xl border border-border bg-muted/40 animate-pulse" />
          <div className="h-16 ml-8 max-w-xl rounded-xl border border-border bg-muted/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full text-center p-6 border-border shadow-xs">
          <CardHeader className="items-center pb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Hierarchy Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission to view the reporting hierarchy.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Organization Hierarchy</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive reporting tree from leadership down through functional departments.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={"/directory" as Route}>
            <Users className="size-3.5 mr-1.5 text-primary" />
            <span>Directory View</span>
          </Link>
        </Button>
      </div>

      {/* 2. Org Tree Content */}
      {isError || !rootNode ? (
        <Card className="border-dashed border-border py-12 text-center text-xs text-muted-foreground">
          <Network className="size-8 mx-auto mb-2 opacity-40" />
          <p className="font-semibold text-foreground">Hierarchy tree unavailable</p>
          <p className="text-[11px] mt-0.5">Ensure department managers and employee reporting lines are configured.</p>
        </Card>
      ) : (
        <div className="py-2">
          <OrgTreeNode node={rootNode} />
        </div>
      )}
    </div>
  );
}
