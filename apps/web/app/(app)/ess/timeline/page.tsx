"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface Milestone {
  id: string;
  formattedDate: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export default function EssTimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        setLoading(true);
        const res = await apiRequest<Milestone[]>("/employee-timeline");
        setMilestones(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Journey Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Complete career progression, achievements, awards, and historical milestones.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Back to ESS</Button>
          </Link>
          <Link href={"/ess/profile" as Route}>
            <Button>View Full Profile</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Synthesizing career journey...</div>
      ) : (
        <Panel className="p-8">
          <div className="relative border-l-2 border-primary/30 pl-6 ml-4 space-y-8">
            {milestones.map((m) => (
              <div key={m.id} className="relative group">
                <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm shadow">
                  {m.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-primary">{m.formattedDate}</span>
                    <Badge tone="neutral">{m.category}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
