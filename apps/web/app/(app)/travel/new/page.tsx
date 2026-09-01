"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Field, Input, Panel } from "../../../../components/ui";
import { financeApi } from "../../../../lib/finance-api";
import { isOnline, queueOfflineAction } from "../../../../lib/offline-storage";

export default function NewTravelPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("0");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const createTravel = useMutation({ mutationFn: financeApi.createTravel, onSuccess: () => setMessage("Travel request saved.") });
  const payload = {
    employeeId,
    title,
    purpose: title || "Business travel",
    travelType: "DOMESTIC",
    estimatedBudget: Number(budget || 0),
    currency: "INR",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    segments: [{ origin, destination, departureDate: new Date().toISOString(), travelMode: "FLIGHT", travelClass: "ECONOMY", estimatedCost: Number(budget || 0) }]
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 p-4 md:p-6 lg:p-8">
      <header><h1 className="text-2xl font-semibold tracking-tight text-zinc-950">New travel request</h1><p className="mt-1 text-sm text-zinc-600">Create trip itinerary, estimated budget, advance request, and settlement plan.</p></header>
      <Panel>
        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
            <Field label="Employee ID"><Input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} /></Field>
            <Field label="Travel type"><Input value="DOMESTIC" readOnly /></Field>
            <Field label="Estimated budget"><Input value={budget} onChange={(event) => setBudget(event.target.value)} type="number" /></Field>
            <Field label="Start date"><Input type="date" /></Field>
            <Field label="End date"><Input type="date" /></Field>
          </div>
          <div className="grid gap-4 rounded-panel border border-border p-4 md:grid-cols-3">
            <Field label="Origin"><Input value={origin} onChange={(event) => setOrigin(event.target.value)} /></Field>
            <Field label="Destination"><Input value={destination} onChange={(event) => setDestination(event.target.value)} /></Field>
            <Field label="Travel class"><Input value="ECONOMY" readOnly /></Field>
          </div>
          {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
          <div className="flex justify-end"><Button type="button" disabled={createTravel.isPending} onClick={() => {
            if (isOnline()) createTravel.mutate(payload);
            else {
              queueOfflineAction("/finance/travel", "POST", payload);
              setMessage("Travel request queued offline.");
            }
          }}>Submit request</Button></div>
        </form>
      </Panel>
    </div>
  );
}
