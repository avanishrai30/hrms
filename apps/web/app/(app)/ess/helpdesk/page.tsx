"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface TicketItem {
  id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "WAITING_ON_EMPLOYEE" | "RESOLVED" | "CLOSED";
  subject: string;
  description: string;
  createdAt: string;
  isSlaBreached: boolean;
}

export default function EssHelpdeskPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState("PAYROLL");
  const [priority, setPriority] = useState("MEDIUM");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const res = await apiRequest<TicketItem[]>("/helpdesk/tickets");
        setTickets(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiRequest("/helpdesk/tickets", {
        method: "POST",
        body: JSON.stringify({ category, priority, subject, description })
      });
      setShowModal(false);
      setSubject("");
      setDescription("");
      const res = await apiRequest<TicketItem[]>("/helpdesk/tickets");
      setTickets(res || []);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTone = (status: string): "neutral" | "success" | "warning" | "danger" => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "success";
      case "IN_PROGRESS":
      case "ASSIGNED":
        return "warning";
      case "OPEN":
        return "neutral";
      default:
        return "danger";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Support & Helpdesk</h1>
          <p className="text-sm text-muted-foreground">
            Raise requests and inquiries for Payroll, Attendance, IT, HR Policies, and Employee Benefits.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Back to ESS</Button>
          </Link>
          <Button onClick={() => setShowModal(true)}>+ Raise Support Ticket</Button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading helpdesk tickets...</div>
      ) : tickets.length === 0 ? (
        <Panel className="p-12 text-center text-muted-foreground">
          You have no open helpdesk tickets. Everything is running smoothly!
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => (
            <Panel key={t.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-primary">{t.ticketNumber}</span>
                <div className="flex gap-1.5">
                  {t.isSlaBreached && <Badge tone="danger">SLA Breached</Badge>}
                  <Badge tone={getStatusTone(t.status)}>{t.status.replace(/_/g, " ")}</Badge>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.category}</span>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{t.subject}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border flex justify-between">
                <span>Priority: {t.priority}</span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Panel className="w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Raise Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                  >
                    <option value="PAYROLL">Payroll & Tax</option>
                    <option value="LEAVE">Leave & Attendance</option>
                    <option value="IT_SUPPORT">IT & Systems</option>
                    <option value="FACILITIES">Facilities & Desk</option>
                    <option value="TRAVEL">Travel & Expense</option>
                    <option value="BENEFITS">Benefits & Insurance</option>
                    <option value="OTHER">Other Query</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Summary of your issue..."
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Provide all relevant details to help resolve this quickly..."
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
