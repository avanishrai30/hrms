"use client";

import type { Route } from "next";
import Link from "next/link";
import { Button, Panel } from "../../../../components/ui";

export default function AdminEmployeeExperiencePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Digital Workplace & Experience Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Overview of employee self-service adoption, manager approval velocity, helpdesk resolution, and organizational directory engagement.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Preview ESS Portal</Button>
          </Link>
          <Link href={"/mss" as Route}>
            <Button>Preview MSS Portal</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">ESS Adoption Rate</span>
          <div className="text-3xl font-extrabold text-primary">96.4%</div>
          <p className="text-xs text-muted-foreground">Active self-service users</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Avg Approval Turnaround</span>
          <div className="text-3xl font-extrabold text-success">3.2 hrs</div>
          <p className="text-xs text-muted-foreground">Manager approval SLA</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Helpdesk CSAT</span>
          <div className="text-3xl font-extrabold text-foreground">4.8 / 5.0</div>
          <p className="text-xs text-muted-foreground">98.2% SLA compliance</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Letters Generated</span>
          <div className="text-3xl font-extrabold text-foreground">148</div>
          <p className="text-xs text-muted-foreground">100% zero-touch issuance</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Self-Service Portals</h3>
          <div className="space-y-2">
            {[
              { title: "Employee Self-Service (ESS)", href: "/ess", desc: "Profile, requests, documents, letters, wallet" },
              { title: "Manager Self-Service (MSS)", href: "/mss", desc: "Team roster, approvals, 1-on-1s, attendance" },
              { title: "Organizational Directory", href: "/directory", desc: "Enterprise employee lookup & org hierarchy" },
              { title: "Interactive Org Chart", href: "/org-chart", desc: "Visual management hierarchy tree" }
            ].map((item) => (
              <Link key={item.title} href={item.href as Route} className="block">
                <div className="p-3 border border-border rounded hover:bg-muted/40 transition-colors">
                  <p className="text-sm font-semibold text-primary">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Service Delivery & Helpdesk</h3>
          <div className="space-y-2">
            {[
              { title: "Helpdesk Operations", href: "/admin/helpdesk", desc: "Live ticket queue & technician assignments" },
              { title: "Shared Services Analytics", href: "/admin/service-delivery", desc: "SLA compliance, MTTR, category breakdowns" },
              { title: "Employee Support Tickets", href: "/ess/helpdesk", desc: "Inbound ticket tracking for employees" }
            ].map((item) => (
              <Link key={item.title} href={item.href as Route} className="block">
                <div className="p-3 border border-border rounded hover:bg-muted/40 transition-colors">
                  <p className="text-sm font-semibold text-primary">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Communications & Policies</h3>
          <div className="space-y-2">
            {[
              { title: "Broadcast Publisher", href: "/admin/communications", desc: "Publish pinned announcements & alerts" },
              { title: "Company Broadcast Hub", href: "/communications", desc: "Employee news, circulars & announcements" },
              { title: "Corporate Policies & SOPs", href: "/communications/policies", desc: "Compliance documentation & guidelines" }
            ].map((item) => (
              <Link key={item.title} href={item.href as Route} className="block">
                <div className="p-3 border border-border rounded hover:bg-muted/40 transition-colors">
                  <p className="text-sm font-semibold text-primary">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
