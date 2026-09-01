"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface SearchResultItem {
  id: string;
  category: "EMPLOYEES" | "VENDORS" | "CONTRACTORS" | "ASSETS" | "POLICIES" | "KNOWLEDGE" | "DOCUMENTS";
  title: string;
  subtitle?: string;
  url: string;
  relevanceScore: number;
}

interface SearchResponse {
  query: string;
  category: string;
  totalResults: number;
  results: SearchResultItem[];
}

export default function GlobalEnterpriseSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const categories = [
    { label: "All Records", value: "ALL" },
    { label: "Employees", value: "EMPLOYEES" },
    { label: "Vendors", value: "VENDORS" },
    { label: "Contractors", value: "CONTRACTORS" },
    { label: "Assets & IT", value: "ASSETS" },
    { label: "Policies & SOPs", value: "POLICIES" },
    { label: "Knowledge Base", value: "KNOWLEDGE" }
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const res = await apiRequest<SearchResponse>(
        `/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
      );
      setResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTone = (cat: string): "neutral" | "success" | "warning" | "danger" => {
    switch (cat) {
      case "EMPLOYEES":
        return "success";
      case "VENDORS":
        return "warning";
      case "CONTRACTORS":
        return "neutral";
      case "ASSETS":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Global Enterprise Search</h1>
        <p className="text-sm text-muted-foreground">
          Instant multi-entity search across employees, vendors, contractors, IT assets, company policies, and knowledge articles.
        </p>
      </div>

      <Panel className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, code, designation, asset tag, vendor, policy..."
            className="flex-1 p-3 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:border-primary"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setCategory(c.value);
                if (query.trim()) {
                  apiRequest<SearchResponse>(
                    `/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(c.value)}`
                  ).then((res) => setResults(res.results || []));
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                category === c.value
                  ? "bg-primary text-white"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold">
            {searched ? `Search Results (${results.length})` : "Recent Search Directory"}
          </h2>
          {results.length > 0 && (
            <span className="text-xs text-muted-foreground">Sorted by relevance match</span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Searching enterprise index...</div>
        ) : results.length > 0 ? (
          <div className="divide-y divide-border">
            {results.map((r) => (
              <div key={`${r.category}-${r.id}`} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={getCategoryTone(r.category)}>{r.category}</Badge>
                    <h3 className="text-sm font-bold text-foreground">{r.title}</h3>
                  </div>
                  {r.subtitle && <p className="text-xs text-muted-foreground">{r.subtitle}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={r.url as Route}>
                    <Button variant="secondary">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : searched ? (
          <div className="p-8 text-center text-muted-foreground">
            No records matched your search query "{query}".
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Enter search keywords above to query across all HRMS records and entities.
          </div>
        )}
      </Panel>
    </div>
  );
}
