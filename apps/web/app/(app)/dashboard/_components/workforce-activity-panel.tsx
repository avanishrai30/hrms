"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "../../../../components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "../../../../components/ui/select";
import {
  useAttendanceToday,
  useAttendanceAnalytics,
  type AttendanceTodayResponse
} from "../../../../lib/queries/use-dashboard-queries";
import { usePunchMutation } from "../../../../lib/queries/use-ess-queries";
import { useSessionStore } from "../../../../lib/session-store";
import {
  buildPunchPayload,
  getGpsFailureMessageForAttendance
} from "../../../../lib/semantic-state";

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(var(--primary))"
  },
  late: {
    label: "Late Arrivals",
    color: "hsl(var(--destructive, 0 84.2% 60.2%))"
  },
  onLeave: {
    label: "On Leave",
    color: "hsl(var(--muted-foreground))"
  }
} satisfies ChartConfig;

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Isolated Attendance Action Strip with Live 1-Second Clock
// Keeping the ticking clock isolated prevents re-rendering the Recharts tree.
// ---------------------------------------------------------------------------
interface AttendanceActionStripProps {
  attendance: AttendanceTodayResponse | undefined;
  punchMutation: ReturnType<typeof usePunchMutation>;
  handlePunch: () => void;
  actionError: string | null;
  locationState: string | null;
}

const DashboardAttendanceStrip = React.memo(function DashboardAttendanceStrip({
  attendance,
  punchMutation,
  handlePunch,
  actionError,
  locationState
}: AttendanceActionStripProps) {
  const [currentTime, setCurrentTime] = React.useState("");

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const attendanceRecord = attendance?.record;
  const canPunchIn = attendance?.canCheckIn ?? false;
  const canPunchOut = attendance?.canCheckOut ?? false;
  const hasShift = Boolean(attendance?.shift?.name);

  const shiftDisplayText = hasShift
    ? attendance!.shift!.name!
    : "Shift not assigned";

  const attendanceStatusText = attendanceRecord?.checkInAt && attendanceRecord?.checkOutAt
    ? `Attendance completed · In ${new Date(attendanceRecord.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Out ${new Date(attendanceRecord.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : attendanceRecord?.checkInAt
    ? `In at ${new Date(attendanceRecord.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Not checked in yet";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-foreground shrink-0">
          <Clock className="size-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-foreground">Today's Shift</span>
            <span className="font-mono text-[11px] font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
              {currentTime || "00:00:00"}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {shiftDisplayText} · {attendanceStatusText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {actionError && (
          <span className="text-[11px] text-destructive truncate max-w-xs">
            {actionError}
          </span>
        )}
        {locationState && !actionError && (
          <span className="text-[11px] text-muted-foreground hidden lg:inline truncate max-w-xs">
            {locationState}
          </span>
        )}

        {canPunchIn ? (
          <Button
            onClick={handlePunch}
            disabled={punchMutation.isPending}
            size="sm"
            className="h-8 gap-1.5 w-full sm:w-auto"
          >
            <Clock className="size-3.5" />
            <span>{punchMutation.isPending ? "Recording…" : "Punch In"}</span>
          </Button>
        ) : canPunchOut ? (
          <Button
            onClick={handlePunch}
            disabled={punchMutation.isPending}
            variant="destructive"
            size="sm"
            className="h-8 gap-1.5 w-full sm:w-auto"
          >
            <Clock className="size-3.5" />
            <span>{punchMutation.isPending ? "Recording…" : "Punch Out"}</span>
          </Button>
        ) : (
          <Button variant="outline" disabled size="sm" className="h-8 gap-1.5 w-full sm:w-auto">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>Logged</span>
          </Button>
        )}

        <Button variant="ghost" size="sm" asChild className="h-8 gap-1 text-xs text-muted-foreground">
          <Link href={"/attendance" as Route}>
            <span>History</span>
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main WorkforceActivityPanel
// ---------------------------------------------------------------------------
export function WorkforceActivityPanel() {
  const [period, setPeriod] = React.useState<"7days" | "14days" | "30days">("14days");
  const dayCount = period === "7days" ? 7 : period === "30days" ? 30 : 14;

  const permissions = useSessionStore((state) => state.permissions) || [];
  const hasAnalyticsAccess = permissions.includes("analytics.view");

  const analyticsQuery = useAttendanceAnalytics(dayCount, hasAnalyticsAccess);
  const attendanceQuery = useAttendanceToday();
  const punchMutation = usePunchMutation();

  const [locationState, setLocationState] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const attendance = attendanceQuery.data;
  const canPunchOut = attendance?.canCheckOut ?? false;

  const handlePunch = React.useCallback(async () => {
    const action = canPunchOut ? "check-out" : "check-in";
    setActionError(null);

    const submitWithoutCoordinates = async (reason: "denied" | "unavailable" | "timeout" | "unsupported" | "unknown") => {
      const msg = getGpsFailureMessageForAttendance(attendance?.rules, reason);
      if (msg) {
        setLocationState(msg);
        return;
      }
      setLocationState("Recording punch without GPS.");
      await punchMutation.mutateAsync(buildPunchPayload({ action }));
    };

    const isLocationRequired = Boolean(attendance?.rules?.requireGeofence);
    if (!isLocationRequired) {
      try {
        setLocationState(null);
        await punchMutation.mutateAsync(buildPunchPayload({ action }));
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : "Punch failed.");
      }
      return;
    }

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      try {
        await submitWithoutCoordinates("unsupported");
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : "Punch failed.");
      }
      return;
    }

    setLocationState("Acquiring GPS location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setLocationState("Location verified.");
          await punchMutation.mutateAsync(
            buildPunchPayload({
              action,
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
              }
            })
          );
        } catch (err: unknown) {
          setActionError(err instanceof Error ? err.message : "Punch failed.");
        }
      },
      async (err) => {
        const reason =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
            ? "timeout"
            : "unavailable";
        try {
          await submitWithoutCoordinates(reason);
        } catch (e: unknown) {
          setActionError(e instanceof Error ? e.message : "Punch failed.");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [attendance, canPunchOut, punchMutation]);

  // Map real daily trends from the server
  const chartData = React.useMemo(() => {
    const daily = analyticsQuery.data?.dailyTrends;
    if (!Array.isArray(daily) || daily.length === 0) return [];
    return daily.map((item) => ({
      date: formatDateLabel(item.date),
      rawDate: item.date,
      present: item.present,
      late: item.late,
      onLeave: item.onLeave
    }));
  }, [analyticsQuery.data?.dailyTrends]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Workforce Activity</CardTitle>
        <CardDescription>
          Daily workforce presence, late arrival telemetry, and leave coverage.
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Select value={period} onValueChange={(val) => setPeriod(val as "7days" | "14days" | "30days")}>
            <SelectTrigger size="sm" className="w-28" aria-label="Select reporting period">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Period</SelectLabel>
                <SelectItem value="7days">7 days</SelectItem>
                <SelectItem value="14days">14 days</SelectItem>
                <SelectItem value="30days">30 days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" asChild className="h-8">
            <Link href={"/attendance" as Route}>View report</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Real Workforce Analytics Chart */}
        {!hasAnalyticsAccess ? (
          <div className="flex h-72 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
            <p className="text-xs text-muted-foreground">
              Workforce activity telemetry is restricted to authorized HR and administrative personnel.
            </p>
          </div>
        ) : analyticsQuery.isError ? (
          <div className="flex h-72 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
            <p className="text-xs text-destructive">Unable to load workforce activity.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void analyticsQuery.refetch()}
              className="h-7 text-xs"
            >
              Retry
            </Button>
          </div>
        ) : analyticsQuery.isLoading && chartData.length === 0 ? (
          <div className="flex h-72 w-full items-center justify-center rounded-lg border border-border bg-muted/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>Loading workforce analytics…</span>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-72 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
            <p className="text-xs text-muted-foreground">No workforce activity recorded for this period.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-present)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-present)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeOpacity={0.3} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                className="text-xs"
              />

              {/* Enforce hard 0 minimum domain - workforce count can never be negative */}
              <YAxis
                domain={[0, "auto"]}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tickMargin={4}
                className="text-xs"
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" className="w-44" />}
              />
              <ChartLegend
                verticalAlign="top"
                content={<ChartLegendContent className="mb-4 justify-end text-xs" />}
              />

              {/* Single subtle Area fill for present workforce */}
              <Area
                dataKey="present"
                type="monotoneX"
                fill="url(#fillPresent)"
                stroke="var(--color-present)"
                strokeWidth={1.5}
                dot={false}
                fillOpacity={1}
                connectNulls={false}
              />
              {/* Late arrivals as solid line */}
              <Line
                dataKey="late"
                type="monotoneX"
                stroke="var(--color-late)"
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
              />
              {/* On Leave as dashed line */}
              <Line
                dataKey="onLeave"
                type="monotoneX"
                stroke="var(--color-onLeave)"
                strokeWidth={1.25}
                strokeDasharray="4 4"
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ChartContainer>
        )}

        {/* Isolated Contextual Attendance Action Strip */}
        <DashboardAttendanceStrip
          attendance={attendance}
          punchMutation={punchMutation}
          handlePunch={handlePunch}
          actionError={actionError}
          locationState={locationState}
        />
      </CardContent>
    </Card>
  );
}
