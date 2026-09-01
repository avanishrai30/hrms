"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface OrgNode {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  department: string;
  designation: string;
}

export default function OrgChartPage() {
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrgChart() {
      try {
        setLoading(true);
        const res = await apiRequest<OrgNode[]>("/directory/org-chart");
        setNodes(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrgChart();
  }, []);

  const rootNodes = nodes.filter((n) => !n.parentId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organizational Hierarchy & Chart</h1>
          <p className="text-sm text-muted-foreground">
            Visual tree representation of enterprise reporting relationships, departments, and leadership tiers.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/directory" as Route}>
            <Button variant="secondary">Directory List View</Button>
          </Link>
          <Link href={"/ess" as Route}>
            <Button>Back to ESS</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Generating org hierarchy structure...</div>
      ) : (
        <Panel className="p-8 overflow-x-auto">
          <div className="min-w-[800px] space-y-8">
            <div className="text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Executive Tier</span>
              <div className="flex justify-center gap-6 mt-3">
                {rootNodes.map((root) => (
                  <div
                    key={root.id}
                    className="p-4 border-2 border-primary rounded-xl bg-card shadow-sm w-64 text-center space-y-1"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-lg mx-auto flex items-center justify-center">
                      {root.name.charAt(0)}
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{root.name}</h3>
                    <p className="text-xs text-primary font-medium">{root.designation}</p>
                    <Badge tone="neutral">{root.department}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground block text-center mb-4">
                Operational & Functional Teams
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nodes
                  .filter((n) => n.parentId)
                  .map((node) => (
                    <div
                      key={node.id}
                      className="p-3 border border-border rounded-lg bg-card shadow-none hover:border-primary/50 transition-colors"
                    >
                      <h4 className="text-sm font-semibold text-foreground">{node.name}</h4>
                      <p className="text-xs text-muted-foreground">{node.designation}</p>
                      <div className="mt-2 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-mono">{node.code}</span>
                        <Badge tone="neutral">{node.department}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
