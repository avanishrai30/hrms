"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface PolicyItem {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  version: string;
  effectiveDate: string;
  acknowledgementRequired: boolean;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    async function loadPolicies() {
      try {
        setLoading(true);
        const res = await apiRequest<PolicyItem[]>("/policies");
        setPolicies(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  const categories = ["ALL", "HR_GENERAL", "CODE_OF_CONDUCT", "LEAVE_ATTENDANCE", "IT_SECURITY", "TRAVEL_EXPENSE", "POSH"];

  const filtered = policies.filter((p) => selectedCategory === "ALL" || p.category === selectedCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Policies & Compliance SOPs</h1>
          <p className="text-sm text-muted-foreground">
            Official policy documentation, Code of Conduct guidelines, and statutory employee rights.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/communications" as Route}>
            <Button variant="secondary">Back to Broadcasts</Button>
          </Link>
          <Link href={"/knowledge" as Route}>
            <Button>Knowledge Center</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading compliance policies...</div>
      ) : filtered.length === 0 ? (
        <Panel className="p-8 text-center text-muted-foreground">No policies listed under this category.</Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pol) => (
            <Panel key={pol.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-primary">{pol.code}</span>
                <Badge tone="neutral">v{pol.version}</Badge>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{pol.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{pol.description}</p>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border flex justify-between items-center">
                <span>Effective: {new Date(pol.effectiveDate).toLocaleDateString()}</span>
                <button
                  onClick={() => alert(`Viewing policy ${pol.title}`)}
                  className="text-primary font-medium hover:underline"
                >
                  Read Policy →
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
