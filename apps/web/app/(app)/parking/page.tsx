"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface ParkingSlotItem {
  id: string;
  slotNumber: string;
  vehicleType: string;
  isAssigned: boolean;
  assignedToName?: string;
  assignedVehicleNo?: string;
}

export default function ParkingSlotsPage() {
  const [slots, setSlots] = useState<ParkingSlotItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlots() {
      try {
        setLoading(true);
        const res = await apiRequest<ParkingSlotItem[]>("/facilities/parking-slots");
        setSlots(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, []);

  const sampleSlots: ParkingSlotItem[] = [
    { id: "1", slotNumber: "P-4W-01", vehicleType: "FOUR_WHEELER", isAssigned: true, assignedToName: "Avanish Rai", assignedVehicleNo: "KA-01-MJ-9999" },
    { id: "2", slotNumber: "P-4W-02", vehicleType: "FOUR_WHEELER", isAssigned: true, assignedToName: "Priya Sharma", assignedVehicleNo: "KA-03-AB-1234" },
    { id: "3", slotNumber: "P-EV-01", vehicleType: "EV_CHARGING", isAssigned: false },
    { id: "4", slotNumber: "P-2W-01", vehicleType: "TWO_WHEELER", isAssigned: true, assignedToName: "Rohit Verma", assignedVehicleNo: "KA-05-XY-5678" },
    { id: "5", slotNumber: "P-2W-02", vehicleType: "TWO_WHEELER", isAssigned: false }
  ];

  const data = slots.length > 0 ? slots : sampleSlots;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Parking & EV Charging Bays</h1>
          <p className="text-sm text-muted-foreground">
            Manage two-wheeler, four-wheeler, visitor parking, and dedicated EV charging stations.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/facilities" as Route}>
            <Button variant="secondary">Facilities Hub</Button>
          </Link>
          <Button onClick={() => alert("Open Apply for Parking Pass Modal")}>+ Apply for Parking Slot</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Designated Slots</span>
          <div className="text-3xl font-extrabold text-foreground">{data.length}</div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Allocated Passes</span>
          <div className="text-3xl font-extrabold text-primary">
            {data.filter((s) => s.isAssigned).length}
          </div>
        </Panel>
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Available Open Slots</span>
          <div className="text-3xl font-extrabold text-success">
            {data.filter((s) => !s.isAssigned).length}
          </div>
        </Panel>
      </div>

      <Panel className="space-y-4">
        <h3 className="text-base font-bold">Parking Bays Roster</h3>
        {loading && slots.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Loading parking bay layout...</div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((s) => (
              <div key={s.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-primary">{s.slotNumber}</span>
                    <Badge tone={s.isAssigned ? "neutral" : "success"}>
                      {s.isAssigned ? "OCCUPIED" : "AVAILABLE"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({s.vehicleType.replace(/_/g, " ")})</span>
                  </div>
                  {s.isAssigned && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Assigned To: <strong className="text-foreground">{s.assignedToName}</strong> • Vehicle: {s.assignedVehicleNo || "Registered Vehicle"}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!s.isAssigned ? (
                    <Button onClick={() => alert(`Allocated parking slot ${s.slotNumber}`)}>
                      Reserve Slot
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => alert(`Showing pass for ${s.slotNumber}`)}>
                      View Pass
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
