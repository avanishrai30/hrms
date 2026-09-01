"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";

export default function FinanceTravelPage() {
  const { data: trips = [] } = useQuery({ queryKey: ["finance", "travel"], queryFn: financeApi.travel });
  const openAdvances = trips.flatMap((trip) => trip.advances ?? []).filter((advance) => advance.status !== "SETTLED" && advance.status !== "CLOSED");
  const pendingSettlements = trips.filter((trip) => trip.status === "COMPLETED" && !(trip.settlements?.length));
  const internationalTrips = trips.filter((trip) => trip.segments?.some((segment) => segment.travelMode.toUpperCase().includes("FLIGHT")) && trip.estimatedBudget > 100000);

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Finance travel</h1><p className="mt-1 text-sm text-zinc-600">Monitor advances, settlements, travel budgets, and approval SLA.</p></header>
      <div className="grid gap-4 md:grid-cols-3"><Panel><p className="text-sm text-zinc-600">Open advances</p><p className="mt-2 text-2xl font-semibold">INR {openAdvances.reduce((sum, advance) => sum + advance.amount, 0).toLocaleString("en-IN")}</p></Panel><Panel><p className="text-sm text-zinc-600">Pending settlements</p><p className="mt-2 text-2xl font-semibold">{pendingSettlements.length}</p></Panel><Panel><p className="text-sm text-zinc-600">High-value trips</p><p className="mt-2 text-2xl font-semibold">{internationalTrips.length}</p></Panel></div>
      <Panel><div className="grid gap-3">{trips.slice(0, 8).map((trip) => <div className="flex items-center justify-between rounded-control border border-border p-3" key={trip.id}><p className="font-medium text-zinc-950">{trip.title}</p><Badge tone={trip.status === "APPROVED" || trip.status === "COMPLETED" ? "success" : "warning"}>{trip.status.replaceAll("_", " ")}</Badge></div>)}</div></Panel>
    </div>
  );
}
