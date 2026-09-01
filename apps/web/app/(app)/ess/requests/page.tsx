"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface EmployeeRequestItem {
  id: string;
  requestType: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  submittedAt: string;
  reason?: string;
  comments?: string;
}

export default function EssRequestsHubPage() {
  const [requests, setRequests] = useState<EmployeeRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState("LEAVE");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        const res = await apiRequest<EmployeeRequestItem[]>("/requests");
        setRequests(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiRequest("/requests", {
        method: "POST",
        body: JSON.stringify({
          requestType: newType,
          reason,
          payload: { submittedVia: "ESS_PORTAL" }
        })
      });
      setShowModal(false);
      setReason("");
      const res = await apiRequest<EmployeeRequestItem[]>("/requests");
      setRequests(res || []);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => filterType === "ALL" || r.requestType === filterType);

  const getTone = (status: string): "neutral" | "success" | "warning" | "danger" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Requests Hub</h1>
          <p className="text-sm text-muted-foreground">
            Centralized self-service portal for leaves, attendance adjustments, overtime, and letters.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Back to ESS</Button>
          </Link>
          <Button onClick={() => setShowModal(true)}>+ New Request</Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
        {["ALL", "LEAVE", "ATTENDANCE_CORRECTION", "SHIFT_CHANGE", "OVERTIME", "LETTER_REQUEST"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              filterType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading requests...</div>
      ) : filtered.length === 0 ? (
        <Panel className="p-8 text-center text-muted-foreground">
          No employee requests found for the selected filter.
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((req) => (
            <Panel key={req.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-primary tracking-wider">
                  {req.requestType.replace(/_/g, " ")}
                </span>
                <Badge tone={getTone(req.status)}>{req.status}</Badge>
              </div>
              <p className="text-sm font-medium line-clamp-2">{req.reason || "No specific reason provided."}</p>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border flex justify-between">
                <span>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</span>
                {req.comments && <span className="text-primary">Has Manager Note</span>}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Panel className="w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Submit New Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Request Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                >
                  <option value="LEAVE">Leave Request</option>
                  <option value="ATTENDANCE_CORRECTION">Attendance Correction</option>
                  <option value="SHIFT_CHANGE">Shift Change Request</option>
                  <option value="OVERTIME">Overtime Approval</option>
                  <option value="LETTER_REQUEST">HR Letter Request</option>
                  <option value="EXPENSE_REIMBURSEMENT">Expense Claim</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Reason & Details</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                  placeholder="Provide justification or context for this request..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
