"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface VendorItem {
  id: string;
  code: string;
  name: string;
  gstin?: string;
  pan?: string;
  isActive: boolean;
  contracts?: Array<{ id: string; valueInInr: number }>;
  complianceRecords?: Array<{ id: string; status: string; isVerified: boolean }>;
}

export default function VendorsDirectoryPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        const res = await apiRequest<VendorItem[]>("/vendors");
        setVendors(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await apiRequest("/vendors", {
        method: "POST",
        body: JSON.stringify({ code, name, gstin, pan })
      });
      setShowCreateModal(false);
      setCode("");
      setName("");
      setGstin("");
      setPan("");
      const res = await apiRequest<VendorItem[]>("/vendors");
      setVendors(res || []);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to register vendor");
    } finally {
      setCreating(false);
    }
  };

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor & Supplier Ecosystem</h1>
          <p className="text-sm text-muted-foreground">
            Manage vendor masters, contracts, compliance certifications, and procurement relationships.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/vendors/contracts" as Route}>
            <Button variant="secondary">Contracts Hub</Button>
          </Link>
          <Link href={"/vendors/compliance" as Route}>
            <Button variant="secondary">Compliance Center</Button>
          </Link>
          <Link href={"/vendors/analytics" as Route}>
            <Button variant="secondary">Vendor Analytics</Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)}>+ Onboard Vendor</Button>
        </div>
      </div>

      <Panel className="space-y-4">
        <div className="flex justify-between items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by name or code..."
            className="p-2 border border-border rounded bg-background text-foreground text-sm w-72"
          />
          <span className="text-xs text-muted-foreground">Showing {filtered.length} vendors</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading vendor registry...</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((v) => (
              <div key={v.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{v.name}</h3>
                    <Badge tone={v.isActive ? "success" : "neutral"}>
                      {v.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Code: {v.code} • GSTIN: {v.gstin || "N/A"} • PAN: {v.pan || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contracts: {v.contracts?.length || 0} • Compliance Verified:{" "}
                    {v.complianceRecords?.filter((c) => c.isVerified).length || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/vendors/contracts?vendorId=${v.id}` as Route}>
                    <Button variant="secondary">Contracts</Button>
                  </Link>
                  <Link href={`/vendors/compliance?vendorId=${v.id}` as Route}>
                    <Button variant="secondary">Audit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Panel className="w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Onboard New Vendor</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Vendor Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="e.g. VND-2026-001"
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Legal Entity / Vendor Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Apex Logistics & Tech Pvt Ltd"
                  className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">PAN</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Onboarding..." : "Register Vendor"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
