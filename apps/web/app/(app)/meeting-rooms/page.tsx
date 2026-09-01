"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface MeetingRoomItem {
  id: string;
  name: string;
  capacity: number;
  floor?: string;
  building?: string;
  amenities?: string[];
  isActive: boolean;
}

export default function MeetingRoomsPage() {
  const [rooms, setRooms] = useState<MeetingRoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRooms() {
      try {
        setLoading(true);
        const res = await apiRequest<MeetingRoomItem[]>("/facilities/meeting-rooms");
        setRooms(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  const sampleRooms: MeetingRoomItem[] = [
    { id: "1", name: "Boardroom Alpha", capacity: 20, floor: "Floor 4", building: "Building 1", amenities: ["VIDEO_CONF", "4K_DISPLAY", "WHITEBOARD"], isActive: true },
    { id: "2", name: "Innovation Bay 1", capacity: 8, floor: "Floor 3", building: "Building 1", amenities: ["TV", "WHITEBOARD"], isActive: true },
    { id: "3", name: "Design Studio Hub", capacity: 12, floor: "Floor 3", building: "Building 1", amenities: ["DUAL_DISPLAYS", "SOUND_SYSTEM"], isActive: true },
    { id: "4", name: "Focus Pod 1", capacity: 4, floor: "Floor 2", building: "Building 1", amenities: ["TV"], isActive: true }
  ];

  const data = rooms.length > 0 ? rooms : sampleRooms;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meeting Rooms & Conference Spaces</h1>
          <p className="text-sm text-muted-foreground">
            Real-time meeting room calendar, video conference amenities, and instant reservations.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/facilities" as Route}>
            <Button variant="secondary">Facilities Hub</Button>
          </Link>
          <Button onClick={() => alert("Opening Book Room calendar view...")}>+ Reserve Room</Button>
        </div>
      </div>

      {loading && rooms.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">Loading meeting rooms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((r) => (
          <Panel key={r.id} className="p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-foreground">{r.name}</h3>
                <Badge tone="success">AVAILABLE</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Capacity: <strong>{r.capacity} People</strong> • {r.floor || "Main Floor"}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(r.amenities || ["VIDEO_CONFERENCING", "TV"]).map((a) => (
                  <span key={a} className="text-[10px] px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">
                    {a.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={() => alert(`Reserved ${r.name} for 1 hour.`)} className="w-full">
                Quick Book (1 Hr)
              </Button>
            </div>
          </Panel>
        ))}
      </div>
      )}
    </div>
  );
}
