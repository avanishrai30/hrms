"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Panel } from "../../../components/ui";
import { financeApi } from "../../../lib/finance-api";

export default function TravelPage() {
  const { data: trips = [], isLoading, error } = useQuery({ queryKey: ["finance", "travel"], queryFn: financeApi.travel });
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Travel</h1><p className="mt-1 text-sm text-zinc-600">Plan domestic, international, and multi-city travel with advances and settlement.</p></div>
        <Link href={"/travel/new" as Route}><Button>New trip</Button></Link>
      </header>
      <Panel>
        <div className="grid gap-3">
          {error ? <p className="text-sm text-danger">Unable to load travel requests.</p> : null}
          {isLoading ? <p className="text-sm text-zinc-500">Loading travel requests...</p> : null}
          {trips.map((trip) => <div className="flex items-center justify-between rounded-control border border-border p-4" key={trip.id}><div><p className="font-medium text-zinc-950">{trip.title}</p><p className="text-sm text-zinc-600">{trip.requestNumber} - {trip.purpose} - {trip.currency} {trip.estimatedBudget.toLocaleString("en-IN")}</p></div><Badge tone={trip.status === "APPROVED" || trip.status === "COMPLETED" ? "success" : "warning"}>{trip.status.replaceAll("_", " ")}</Badge></div>)}
          {!isLoading && trips.length === 0 ? <p className="text-sm text-zinc-500">No travel requests yet.</p> : null}
        </div>
      </Panel>
    </div>
  );
}
