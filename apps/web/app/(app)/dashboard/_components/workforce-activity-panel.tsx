"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Area, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";
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
  useAttendanceToday
} from "../../../../lib/queries/use-dashboard-queries";
import { usePunchMutation } from "../../../../lib/queries/use-ess-queries";
import {
  buildPunchPayload,
  formatShiftName,
  getGpsFailureMessageForAttendance
} from "../../../../lib/semantic-state";

// Generate last 14 days of realistic activity points anchored to today
function generateActivityData() {
  const days = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    days.push({
      date: dateStr,
      present: isWeekend ? 0 : 3,
      scheduled: isWeekend ? 0 : 3,
      checkIns: isWeekend ? 0 : i === 0 ? 1 : 3
    });
  }
  return days;
}

const chartConfig = {
  present: {
    label: "Present Workforce",
    color: "hsl(var(--primary))"
  },
  scheduled: {
    label: "Scheduled Shifts",
    color: "hsl(var(--muted-foreground))"
  },
  checkIns: {
    label: "Punched Check-Ins",
    color: "hsl(var(--ring))"
  }
} satisfies ChartConfig;

export function WorkforceActivityPanel() {
  const [period, setPeriod] = React.useState("14days");
  const [segment, setSegment] = React.useState("all");

  const attendanceQuery = useAttendanceToday();
  const punchMutation = usePunchMutation();

  const [currentTime, setCurrentTime] = React.useState("");
  const [locationState, setLocationState] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

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

  const chartData = React.useMemo(() => generateActivityData(), []);

  const attendance = attendanceQuery.data;
  const attendanceRecord = attendance?.record;
  const canPunchIn = attendance?.canCheckIn ?? false;
  const canPunchOut = attendance?.canCheckOut ?? false;
  const shiftLabel = formatShiftName(attendance?.shift, { isSuccess: attendanceQuery.isSuccess });

  const handlePunch = async () => {
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
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Workforce Activity</CardTitle>
        <CardDescription>
          Daily workforce presence, check-in telemetry, and shift coverage.
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger size="sm" className="w-28">
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

          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger size="sm" className="w-32 hidden sm:flex">
              <SelectValue placeholder="Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Segments</SelectLabel>
                <SelectItem value="all">All shifts</SelectItem>
                <SelectItem value="hq">Bangalore HQ</SelectItem>
                <SelectItem value="mum">Mumbai Hub</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" asChild className="h-8">
            <Link href={"/attendance" as Route}>View report</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Recharts Area + Line Chart */}
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
              minTickGap={32}
              className="text-xs"
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" className="w-44" />}
            />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-4 justify-end text-xs" />} />

            <Area
              dataKey="present"
              type="natural"
              fill="url(#fillPresent)"
              stroke="var(--color-present)"
              strokeWidth={1.5}
              dot={false}
              fillOpacity={1}
            />
            <Line
              dataKey="scheduled"
              type="natural"
              stroke="var(--color-scheduled)"
              strokeWidth={1.25}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              dataKey="checkIns"
              type="natural"
              stroke="var(--color-checkIns)"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>

        {/* Compact Contextual Attendance Action Strip */}
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
                {shiftLabel !== "—" ? shiftLabel : "Standard Work Shift"} · {attendanceRecord?.checkInAt ? `In at ${new Date(attendanceRecord.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Not checked in yet"}
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
      </CardContent>
    </Card>
  );
}
