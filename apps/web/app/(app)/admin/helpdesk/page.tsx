"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface AdminTicket {
  id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  isSlaBreached: boolean;
  createdAt: string;
}

export default function AdminHelpdeskPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const res = await apiRequest<AdminTicket[]>("/helpdesk/tickets");
        setTickets(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Helpdesk Operations & SLA Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage inbound employee tickets, assign technicians, monitor escalations, and track SLA performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/service-delivery" as Route}>
            <Button variant="secondary">Service Delivery Analytics</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Inbound</span>
          <div className="text-3xl font-extrabold text-foreground">{tickets.length}</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Open / In Progress</span>
          <div className="text-3xl font-extrabold text-warning">
            {tickets.filter((t) => !["RESOLVED", "CLOSED"].includes(t.status)).length}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">SLA Breached</span>
          <div className="text-3xl font-extrabold text-danger">
            {tickets.filter((t) => t.isSlaBreached).length}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Resolved Rate</span>
          <div className="text-3xl font-extrabold text-success">
            {tickets.length > 0
              ? `${Math.round((tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length / tickets.length) * 100)}%`
              : "100%"}
          </div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Ticket Queue</h3>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading ticket queue...</div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((t) => (
              <div key={t.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary">{t.ticketNumber}</span>
                    <Badge tone="neutral">{t.category}</Badge>
                    {t.isSlaBreached && <Badge tone="danger">SLA Breached</Badge>}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mt-1">{t.subject}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created on {new Date(t.createdAt).toLocaleString()} • Priority: {t.priority}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => alert(`Assigned ticket ${t.ticketNumber}`)} variant="secondary">
                    Assign Agent
                  </Button>
                  <Button onClick={() => alert(`Resolved ticket ${t.ticketNumber}`)}>Resolve</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
