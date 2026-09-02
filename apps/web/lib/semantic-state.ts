export const EMPTY_STATE = "—";
export const SHIFT_NOT_ASSIGNED = "Shift not assigned";

export interface ShiftLike {
  name?: string | null;
}

export interface AttendanceRulesLike {
  requireGeofence?: boolean | null;
}

export function formatShiftName(
  shift: ShiftLike | null | undefined,
  options: { isSuccess?: boolean | undefined } = {}
): string {
  const name = shift?.name?.trim();
  if (name) return name;
  if (options.isSuccess && shift === null) return SHIFT_NOT_ASSIGNED;
  return EMPTY_STATE;
}

export function formatLeaveDaysMetric(
  totalDays: number | null | undefined,
  queryState: { isLoading?: boolean | undefined; isSuccess?: boolean | undefined }
): string {
  if (queryState.isLoading) return EMPTY_STATE;
  if (!queryState.isSuccess || typeof totalDays !== "number") return EMPTY_STATE;
  return `${totalDays} d`;
}

export function formatPendingRequestsMetric(
  count: number | null | undefined,
  queryState: { isLoading?: boolean | undefined; isSuccess?: boolean | undefined }
): string {
  if (queryState.isLoading) return EMPTY_STATE;
  if (!queryState.isSuccess || typeof count !== "number") return EMPTY_STATE;
  return String(count);
}

export function getPendingRequestsBadge(
  count: number | null | undefined,
  queryState: { isSuccess?: boolean | undefined }
): string | null {
  if (!queryState.isSuccess || typeof count !== "number") return null;
  return count > 0 ? "Pending" : "No pending requests";
}

export function formatLocationType(type: string | null | undefined): string {
  const value = type?.trim();
  return value ? value.replace(/_/g, " ") : EMPTY_STATE;
}

export function formatOptionalLabel(value: string | null | undefined): string {
  const label = value?.trim();
  return label || EMPTY_STATE;
}

export function formatLocationRadius(radiusMeters: number | null | undefined): string {
  return typeof radiusMeters === "number" && Number.isFinite(radiusMeters) && radiusMeters > 0
    ? `${radiusMeters} m`
    : EMPTY_STATE;
}

export function buildPunchPayload(input: {
  action: "check-in" | "check-out";
  notes?: string | undefined;
  coords?: { latitude: number; longitude: number; accuracy?: number | null | undefined } | null | undefined;
}) {
  return {
    action: input.action,
    notes: input.notes,
    latitude: input.coords?.latitude,
    longitude: input.coords?.longitude,
    accuracy: input.coords?.accuracy ?? undefined
  };
}

export function getGpsFailureMessageForAttendance(
  rules: AttendanceRulesLike | null | undefined,
  reason: "denied" | "unavailable" | "timeout" | "unsupported" | "unknown"
): string | null {
  if (rules?.requireGeofence !== true) return null;

  if (reason === "denied") {
    return "Location permission is required by your tenant geofence policy before attendance can be recorded.";
  }
  if (reason === "timeout") {
    return "Location capture timed out. Your tenant geofence policy requires GPS before attendance can be recorded.";
  }
  if (reason === "unsupported") {
    return "This browser does not support GPS location capture required by your tenant geofence policy.";
  }
  return "GPS location is required by your tenant geofence policy before attendance can be recorded.";
}

export function shouldRenderUnreadNotificationDot(unreadCount: number | null | undefined): boolean {
  return typeof unreadCount === "number" && unreadCount > 0;
}

export function shouldRenderReleaseBadge(enabled: boolean | null | undefined): boolean {
  return enabled === true;
}
