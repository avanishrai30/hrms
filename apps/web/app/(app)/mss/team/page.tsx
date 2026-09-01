"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface TeamEmployee {
  id: string;
  fullName: string;
  employeeCode: string;
  email: string;
  phone?: string;
  department: { name: string };
  designation: { name: string };
  status: string;
  joiningDate: string;
}

export default function MssTeamRosterPage() {
  const [team, setTeam] = useState<TeamEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        const res = await apiRequest<TeamEmployee[]>("/mss/team");
        setTeam(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  const filtered = team.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Direct Reports & Team Roster</h1>
          <p className="text-sm text-muted-foreground">
            Complete team visibility, reporting relationships, and direct report profiles.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/mss" as Route}>
            <Button variant="secondary">Back to MSS</Button>
          </Link>
          <Link href={"/directory/org-chart" as Route}>
            <Button>View Org Hierarchy</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search direct reports by name, ID, or title..."
          className="w-full max-w-md p-2 border border-border rounded bg-background text-foreground text-sm"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading team roster...</div>
      ) : filtered.length === 0 ? (
        <Panel className="p-8 text-center text-muted-foreground">No direct reports found.</Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((emp) => (
            <Panel key={emp.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                  {emp.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{emp.fullName}</h3>
                  <p className="text-xs text-muted-foreground">{emp.designation.name}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span>Employee ID:</span>
                  <span className="font-semibold text-foreground">{emp.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="text-foreground">{emp.department.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-foreground">{emp.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Joined:</span>
                  <span className="text-foreground">{new Date(emp.joiningDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <Badge tone="success">{emp.status}</Badge>
                <div className="flex gap-2">
                  <Link href={`/performance/1on1` as Route}>
                    <Button variant="secondary">1-on-1</Button>
                  </Link>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
