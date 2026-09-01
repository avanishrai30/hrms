"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function PreboardingPage() {
  const [tasks, setTasks] = useState([
    {
      id: "pb-1",
      candidateName: "Sneha Mukherjee",
      role: "Talent Acquisition Specialist",
      taskTitle: "Upload PAN & Aadhaar Identity Proofs",
      taskType: "IDENTITY_VERIFICATION",
      status: "SUBMITTED",
      submittedAt: "Today at 11:30 AM",
      details: "PAN: ABCDE1234F, Aadhaar: XXXX-XXXX-9012"
    },
    {
      id: "pb-2",
      candidateName: "Sneha Mukherjee",
      role: "Talent Acquisition Specialist",
      taskTitle: "Provide Bank Account Details for Salary Disbursal",
      taskType: "BANK_DETAILS",
      status: "VERIFIED",
      submittedAt: "Yesterday at 04:15 PM",
      details: "HDFC Bank, A/C: 50100987654321, IFSC: HDFC0001234"
    },
    {
      id: "pb-3",
      candidateName: "Aakash Sharma",
      role: "Senior Full Stack Engineer",
      taskTitle: "Sign Company Code of Conduct & NDA",
      taskType: "POLICY_SIGN",
      status: "PENDING",
      submittedAt: "Awaiting Candidate Action",
      details: "Digital Signature link dispatched"
    },
    {
      id: "pb-4",
      candidateName: "Aakash Sharma",
      role: "Senior Full Stack Engineer",
      taskTitle: "Select Work Equipment & Laptop Preferences",
      taskType: "EQUIPMENT_PREFERENCE",
      status: "SUBMITTED",
      submittedAt: "Today at 09:00 AM",
      details: "Apple MacBook Pro M3 Max 16-inch, 32GB RAM"
    }
  ]);

  const handleVerify = (id: string, newStatus: "VERIFIED" | "REJECTED") => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Preboarding Verification Center</h1>
          <p className="text-sm text-zinc-500">Review prospective employee document submissions, statutory proofs, and bank details before day 1.</p>
        </div>
        <Link href={"/ats/offers" as Route}>
          <Button variant="secondary">📄 View Offer Letters</Button>
        </Link>
      </div>

      {/* Verification Table */}
      <Panel className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
              <tr>
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Preboarding Task & Type</th>
                <th className="py-2.5 px-3">Submitted Information</th>
                <th className="py-2.5 px-3">Submission Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-zinc-900">{task.candidateName}</p>
                    <p className="text-xs text-zinc-400">{task.role}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-zinc-800">{task.taskTitle}</p>
                    <span className="text-[10px] font-mono text-zinc-400">{task.taskType}</span>
                  </td>
                  <td className="py-3 px-3 text-xs font-mono text-zinc-700 bg-zinc-50/50 p-2 rounded">
                    {task.details}
                  </td>
                  <td className="py-3 px-3 text-xs text-zinc-500">{task.submittedAt}</td>
                  <td className="py-3 px-3">
                    <Badge
                      tone={
                        task.status === "VERIFIED"
                          ? "success"
                          : task.status === "SUBMITTED"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {task.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {task.status === "SUBMITTED" && (
                      <>
                        <Button variant="primary" onClick={() => handleVerify(task.id, "VERIFIED")}>
                          ✓ Approve
                        </Button>
                        <Button variant="danger" onClick={() => handleVerify(task.id, "REJECTED")}>
                          ✕ Reject
                        </Button>
                      </>
                    )}
                    {task.status === "VERIFIED" && <span className="text-xs text-emerald-600 font-semibold">Verified by HR</span>}
                    {task.status === "PENDING" && <span className="text-xs text-zinc-400">Waiting submission</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
