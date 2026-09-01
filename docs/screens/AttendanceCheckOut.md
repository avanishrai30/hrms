# Attendance Check Out

## Purpose

Guide employee through verified check-out and working-hours confirmation.

## Target User

Employee.

## Route

`/attendance/check-out`

## Permissions

`attendance.self.create`.

## Information Hierarchy

Current check-in, check-out verification, trust indicators, working hours.

## Layout

Single-task flow mirroring check-in with additional hours summary.

## Component Tree

Step header, current shift summary, location status, camera capture, trust indicators, submit bar.

## Primary CTA

Check out.

## Secondary Actions

Retry, diagnostics, contact HR, cancel.

## Data Requirements

Today check-in, tenant location, face profile, device metadata.

## API Dependencies

- `GET /api/v1/attendance/me/today`
- `POST /api/v1/attendance/check-out`

## States

- Loading: resolve current attendance.
- Empty: no active check-in.
- Error: check-out submission failure.
- Success: check-out recorded with working hours.
- Disabled: already checked out, no check-in, inactive employee, missing face profile.
- Permission denied: no self-attendance permission.
- Interaction states: loading location, location denied, GPS inaccurate, outside geofence, camera denied, face mismatch, spoof suspected, network offline, duplicate attendance.

## Responsive Behavior

Mobile full-screen. Desktop constrained task panel with shift summary aside.

## Keyboard Behavior

All non-camera controls keyboard accessible.

## Accessibility Notes

Working hours summary is text, not chart-only.

## Motion Behavior

Same as check-in.

## Analytics Events

`check_out_started`, `check_out_succeeded`, `check_out_failed`.

## Security Considerations

Server validates check-in exists in same tenant before accepting check-out.

