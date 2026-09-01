"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CameraCapture } from "../../../components/camera-capture";
import { MapPreview } from "../../../components/map-preview";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface TodayAttendanceResponse {
  date: string;
  record: {
    id: string;
    status: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    workedMinutes: number;
    lateMinutes: number;
    earlyDepartureMinutes: number;
    overtimeMinutes: number;
    notes: string | null;
    locationId?: string | null;
    distanceMeters?: number | null;
    accuracyMeters?: number | null;
    locationVerificationStatus?: string | null;
    locationVerificationReason?: string | null;
    faceVerificationStatus?: string | null;
    livenessVerificationStatus?: string | null;
    biometricTrustScore?: number | null;
    biometricVerificationReason?: string | null;
  } | null;
  shift: {
    id: string;
    name: string;
    code: string;
    startsAtMinute: number;
    endsAtMinute: number;
  } | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

interface DashboardResponse {
  today: {
    date: string;
    workedHours: string;
    status: string;
  };
  monthSummary: {
    presentCount: number;
    lateCount: number;
    halfDayCount: number;
    totalWorkedHours: string;
  };
  recentEvents: Array<{
    id: string;
    eventType: string;
    timestamp: string;
    source: string;
  }>;
}

interface GpsVerificationResponse {
  verified: boolean;
  status: string;
  distanceMeters: number | null;
  accuracyMeters: number;
  matchedLocationId: string | null;
  matchedLocationName: string | null;
  reason: string;
}

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedH = h % 12 || 12;
  return `${String(formattedH).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AttendanceHomePage() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionDate, setCorrectionDate] = useState(new Date().toISOString().split("T")[0]);

  // GPS State
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [acquiringGps, setAcquiringGps] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Biometrics & Camera State
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setAcquiringGps(true);
    setGpsError(null);
    setActionError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setAcquiringGps(false);
      },
      (err) => {
        setGpsError(`Location acquisition failed: ${err.message}`);
        setAcquiringGps(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  useEffect(() => {
    acquireLocation();
  }, []);

  const todayQuery = useQuery({
    queryKey: ["attendance-today"],
    queryFn: () => apiRequest<TodayAttendanceResponse>("/attendance/me/today")
  });

  const dashboardQuery = useQuery({
    queryKey: ["attendance-dashboard-employee"],
    queryFn: () => apiRequest<DashboardResponse>("/attendance/dashboard/employee")
  });

  const gpsVerificationQuery = useQuery({
    queryKey: ["attendance-gps-verify", userCoords?.latitude, userCoords?.longitude, userCoords?.accuracy],
    queryFn: () => {
      if (!userCoords) return null;
      return apiRequest<GpsVerificationResponse>("/locations/verify-gps", {
        method: "POST",
        body: JSON.stringify(userCoords)
      });
    },
    enabled: Boolean(userCoords)
  });

  const checkInMutation = useMutation({
    mutationFn: (capturedFace?: string | null) =>
      apiRequest("/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({
          notes: "Web check-in with biometrics",
          latitude: userCoords?.latitude,
          longitude: userCoords?.longitude,
          accuracy: userCoords?.accuracy,
          faceImageBase64: capturedFace ?? faceImageBase64 ?? undefined,
          overrideReason: showOverrideInput && overrideReason ? overrideReason : undefined
        })
      }),
    onSuccess: () => {
      setActionError(null);
      setShowOverrideInput(false);
      setFaceModalOpen(false);
      setFaceImageBase64(null);
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-dashboard-employee"] });
    },
    onError: (err: Error) => {
      setActionError(err.message);
      if (
        err.message.toLowerCase().includes("geofence") ||
        err.message.toLowerCase().includes("radius") ||
        err.message.toLowerCase().includes("face")
      ) {
        setShowOverrideInput(true);
      }
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: () =>
      apiRequest("/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({
          notes: "Web check-out",
          latitude: userCoords?.latitude,
          longitude: userCoords?.longitude,
          accuracy: userCoords?.accuracy
        })
      }),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-dashboard-employee"] });
    },
    onError: (err: Error) => {
      setActionError(err.message);
    }
  });

  const requestCorrectionMutation = useMutation({
    mutationFn: () =>
      apiRequest("/attendance/corrections", {
        method: "POST",
        body: JSON.stringify({
          reason: correctionReason,
          requestedChange: { date: correctionDate, status: "PRESENT" }
        })
      }),
    onSuccess: () => {
      setCorrectionModalOpen(false);
      setCorrectionReason("");
      queryClient.invalidateQueries({ queryKey: ["attendance-dashboard-employee"] });
    }
  });

  const record = todayQuery.data?.record;
  const shift = todayQuery.data?.shift;
  const isCheckedIn = Boolean(record?.checkInAt);
  const isCheckedOut = Boolean(record?.checkOutAt);

  const getStatusTone = (status?: string): "neutral" | "success" | "warning" | "danger" => {
    if (status === "PRESENT") return "success";
    if (status === "LATE") return "warning";
    if (status === "HALF_DAY") return "warning";
    if (status === "ABSENT") return "danger";
    return "neutral";
  };

  const gpsRes = gpsVerificationQuery.data;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Attendance</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Log GPS & biometric-verified check-ins, view schedules, and monitor monthly summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={"/face" as Route}>
            <Button variant="secondary">Biometric Profile</Button>
          </Link>
          <Button variant="secondary" onClick={() => setCorrectionModalOpen(true)}>
            Request Correction
          </Button>
          <Link href={"/attendance/history" as Route}>
            <Button variant="secondary">View History</Button>
          </Link>
        </div>
      </header>

      {/* Geofence & Trust Banner */}
      <div className="flex flex-col gap-3 rounded-panel border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
              gpsRes?.verified
                ? "bg-emerald-100 text-emerald-800"
                : userCoords
                ? "bg-amber-100 text-amber-800"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            GPS
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-950">
                {gpsRes?.verified
                  ? `Location Verified: ${gpsRes.matchedLocationName}`
                  : gpsRes
                  ? gpsRes.reason
                  : acquiringGps
                  ? "Acquiring GPS Satellite Signal..."
                  : "GPS Coordinates Not Acquired"}
              </span>
              {gpsRes && (
                <Badge tone={gpsRes.verified ? "success" : "warning"}>
                  {gpsRes.verified ? "Inside Perimeter" : "Check-in Advisory"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {userCoords
                ? `Coordinates: ${userCoords.latitude.toFixed(4)}, ${userCoords.longitude.toFixed(4)} (±${Math.round(userCoords.accuracy)}m accuracy)`
                : gpsError ?? "Enable browser location access to verify your work perimeter."}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          className="h-8 px-3 text-xs"
          disabled={acquiringGps}
          onClick={acquireLocation}
        >
          {acquiringGps ? "Acquiring..." : "Refresh Location"}
        </Button>
      </div>

      {actionError && (
        <div className="rounded-control border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Check-in Rejected</p>
          <p className="mt-0.5 text-xs">{actionError}</p>
        </div>
      )}

      {/* Main Check-In Action Surface */}
      <div className="grid gap-6 md:grid-cols-3">
        <Panel className="flex flex-col items-center justify-center p-8 text-center md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Live Clock</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            {!isCheckedIn ? (
              <>
                <Button
                  className="h-14 text-base font-semibold shadow-md"
                  disabled={checkInMutation.isPending}
                  onClick={() => setFaceModalOpen(true)}
                >
                  {checkInMutation.isPending ? "Verifying Trust Factors..." : "Check In with Face & GPS"}
                </Button>

                {showOverrideInput && (
                  <div className="rounded-control border border-amber-200 bg-amber-50 p-3 text-left">
                    <Field label="Manual Override Reason (Required)">
                      <Input
                        placeholder="e.g. Working remotely from approved client site"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                      />
                    </Field>
                    <Button
                      className="mt-2 w-full text-xs"
                      onClick={() => checkInMutation.mutate(null)}
                    >
                      Submit Check-in with Override
                    </Button>
                  </div>
                )}
              </>
            ) : !isCheckedOut ? (
              <Button
                variant="primary"
                className="h-14 bg-amber-600 text-base font-semibold shadow-md hover:bg-amber-700"
                disabled={checkOutMutation.isPending}
                onClick={() => checkOutMutation.mutate()}
              >
                {checkOutMutation.isPending ? "Checking out..." : "Check Out Now"}
              </Button>
            ) : (
              <div className="rounded-control border border-border bg-emerald-50 p-4 text-emerald-800">
                <p className="font-semibold">Workday Completed</p>
                <p className="text-xs text-emerald-600">
                  Checked in at {record?.checkInAt ? new Date(record.checkInAt).toLocaleTimeString() : "-"} • Checked out at{" "}
                  {record?.checkOutAt ? new Date(record.checkOutAt).toLocaleTimeString() : "-"}
                </p>
              </div>
            )}

            {record && (
              <div className="mt-2 space-y-1 text-xs text-zinc-500 text-left">
                {record.locationVerificationReason && (
                  <p>📍 Location: {record.locationVerificationReason}</p>
                )}
                {record.faceVerificationStatus && (
                  <p>👤 Face Match: {record.faceVerificationStatus} ({Math.round((record.biometricTrustScore ?? 0) * 100)}% score)</p>
                )}
              </div>
            )}
          </div>

          {/* Unified Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Geofence Verification
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Anti-Spoof Liveness
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Face Biometric Match
            </span>
          </div>
        </Panel>

        {/* Today's Shift & Geofence Map Card */}
        <Panel className="flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Workplace Geofence</h2>

            {userCoords && gpsRes ? (
              <div className="mt-3">
                <MapPreview
                  locationName={gpsRes.matchedLocationName ?? "Assigned Workplace"}
                  latitude={userCoords.latitude}
                  longitude={userCoords.longitude}
                  radiusMeters={100}
                  userLatitude={userCoords.latitude}
                  userLongitude={userCoords.longitude}
                  userAccuracy={userCoords.accuracy}
                  distanceMeters={gpsRes.distanceMeters}
                  isVerified={gpsRes.verified}
                />
              </div>
            ) : (
              <div className="mt-3 rounded-control border border-border bg-muted/40 p-4 text-center text-xs text-zinc-500">
                Awaiting GPS coordinate stream for live perimeter visualization.
              </div>
            )}

            {shift && (
              <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shift</span>
                  <span className="font-medium text-zinc-900">{shift.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timing</span>
                  <span className="font-medium text-zinc-900">
                    {formatMinutesToTime(shift.startsAtMinute)} – {formatMinutesToTime(shift.endsAtMinute)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Today&apos;s Status</span>
                  <Badge tone={getStatusTone(record?.status)}>{record?.status ?? "NOT_MARKED"}</Badge>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-control border border-border bg-muted/40 p-3 text-xs text-zinc-600">
            <p className="font-medium text-zinc-900">Biometric & Geofence Trust Model</p>
            <p className="mt-0.5">Every check-in is verified across GPS, anti-spoof liveness, and face match.</p>
          </div>
        </Panel>
      </div>

      {/* Month Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Present Days (Month)</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950">
            {dashboardQuery.data?.monthSummary.presentCount ?? 0}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Late Days (Month)</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {dashboardQuery.data?.monthSummary.lateCount ?? 0}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Half Days (Month)</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950">
            {dashboardQuery.data?.monthSummary.halfDayCount ?? 0}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Total Hours (Month)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {dashboardQuery.data?.monthSummary.totalWorkedHours ?? "0.0"} hrs
          </p>
        </Panel>
      </section>

      {/* Recent Activity Timeline */}
      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">Recent Attendance Activity</h2>
          <Link href={"/attendance/history" as Route} className="text-xs font-medium text-primary hover:underline">
            View all history →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border">
          {dashboardQuery.data?.recentEvents && dashboardQuery.data.recentEvents.length > 0 ? (
            dashboardQuery.data.recentEvents.map((evt) => (
              <div key={evt.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-bold text-zinc-600">
                    {evt.eventType.startsWith("CHECK_IN") ? "IN" : evt.eventType.startsWith("CHECK_OUT") ? "OUT" : "EV"}
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900">{evt.eventType.replace(/_/g, " ")}</p>
                    <p className="text-xs text-zinc-500">Source: {evt.source}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">{new Date(evt.timestamp).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-zinc-500">No recent events recorded.</p>
          )}
        </div>
      </Panel>

      {/* Camera Capture Modal for Check-In */}
      {faceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Panel className="w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-zinc-950">Biometric Check-In</h3>
                <p className="text-xs text-zinc-500">Align face inside guide and take snapshot</p>
              </div>
              <Button
                variant="secondary"
                className="h-7 px-2 text-xs"
                onClick={() => setFaceModalOpen(false)}
              >
                Cancel
              </Button>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <CameraCapture
                onCapture={(img) => {
                  setFaceImageBase64(img);
                }}
                disabled={checkInMutation.isPending}
                aspectRatio="square"
              />

              {faceImageBase64 && (
                <div className="mt-4 w-full border-t border-border pt-4">
                  <Button
                    className="w-full font-semibold shadow-md"
                    disabled={checkInMutation.isPending}
                    onClick={() => checkInMutation.mutate(faceImageBase64)}
                  >
                    {checkInMutation.isPending ? "Verifying GPS + Liveness + Face..." : "Confirm & Check In"}
                  </Button>
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* Correction Request Modal */}
      {correctionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-950">Request Attendance Correction</h2>
            <p className="mt-1 text-xs text-zinc-500">Submit a correction request to HR for missing check-ins or errors.</p>

            <div className="mt-4 space-y-4">
              <Field label="Attendance Date">
                <Input
                  type="date"
                  value={correctionDate}
                  onChange={(e) => setCorrectionDate(e.target.value)}
                />
              </Field>

              <Field label="Reason (Min 8 characters)">
                <Input
                  placeholder="e.g. Forgot to checkout due to client meeting"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                />
              </Field>

              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="secondary" onClick={() => setCorrectionModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={correctionReason.length < 8 || requestCorrectionMutation.isPending}
                  onClick={() => requestCorrectionMutation.mutate()}
                >
                  {requestCorrectionMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
