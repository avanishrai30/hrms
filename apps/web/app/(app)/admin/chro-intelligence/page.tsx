"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface ChroData {
  averageEngagementScore: number;
  highPerformersPercent: number;
  learningRoiIndex: number;
  successionReadinessPercent: number;
  benchStrengthScore: number;
  flightRiskCount: number;
}

export default function ChroIntelligencePage() {
  const [data, setData] = useState<ChroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChro() {
      try {
        setLoading(true);
        const res = await apiRequest<ChroData>("/ai/executive/chro-dashboard");
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChro();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-muted-foreground">Loading CHRO Intelligence Platform...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CHRO Talent, Culture & Succession Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Holistic talent health, employee happiness score, leadership succession readiness, and retention indicators.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/executive-intelligence" as Route}>
            <Button variant="secondary">CEO Cockpit</Button>
          </Link>
          <Link href={"/admin/cfo-intelligence" as Route}>
            <Button variant="secondary">CFO Cockpit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Employee Happiness Score</span>
          <div className="text-3xl font-extrabold text-success">{data.averageEngagementScore} / 5.0</div>
          <p className="text-xs text-muted-foreground">Pulse eNPS calibrated</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">High Performers Ratio</span>
          <div className="text-3xl font-extrabold text-primary">{data.highPerformersPercent}%</div>
          <p className="text-xs text-muted-foreground">Bell curve normal</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Leadership Succession Readiness</span>
          <div className="text-3xl font-extrabold text-foreground">{data.successionReadinessPercent}%</div>
          <p className="text-xs text-muted-foreground">Tier-1 critical roles ready</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Learning Adoption ROI</span>
          <div className="text-3xl font-extrabold text-foreground">{data.learningRoiIndex} / 100</div>
          <p className="text-xs text-muted-foreground">Course completion velocity</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Bench Strength Index</span>
          <div className="text-3xl font-extrabold text-success">{data.benchStrengthScore} / 100</div>
          <p className="text-xs text-muted-foreground">Internal mobility index</p>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Flight Risk Personnel</span>
          <div className="text-3xl font-extrabold text-warning">{data.flightRiskCount} Employees</div>
          <p className="text-xs text-muted-foreground">Retention interventions pending</p>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Recommended Talent Interventions</h3>
        <div className="space-y-3">
          <div className="p-3 bg-muted/20 border border-border rounded text-xs text-foreground flex items-center justify-between">
            <span>🎯 <strong>HiPo Leadership Fast-Track:</strong> Nominate 8 senior engineers for the Q4 Technical Architecture Mentorship Path.</span>
            <Button variant="secondary" onClick={() => alert("Approved training enrollments.")}>Enroll Nominees</Button>
          </div>
          <div className="p-3 bg-muted/20 border border-border rounded text-xs text-foreground flex items-center justify-between">
            <span>🛡️ <strong>Retention Grants:</strong> 4 critical personnel flagged with flight risk in supply chain operations.</span>
            <Button variant="secondary" onClick={() => alert("Opened compensation review.")}>Review Packages</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
