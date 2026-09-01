# Attendance Check In

## Purpose

Guide employee through location, geofence, face, liveness, and attendance submission for check-in.

## Target User

Employee.

## Route

`/attendance/check-in`

## Permissions

`attendance.self.create`.

## Information Hierarchy

Step status, current instruction, trust indicators, primary action, failure reason.

## Layout

Single-task mobile flow with fixed progress region and bottom action.

## Component Tree

Step header, state panel, location status, camera capture, trust indicators, action bar, diagnostics.

## Primary CTA

Start check in.

## Secondary Actions

Retry, open diagnostics, contact HR, cancel.

## Data Requirements

Today attendance state, tenant locations, device metadata, face image object key.

## API Dependencies

- `GET /api/v1/attendance/me/today`
- `POST /api/v1/attendance/check-in`

## States

- Loading: resolve attendance eligibility.
- Empty: no prior check-in.
- Error: submission failure or service unavailable.
- Success: check-in recorded.
- Disabled: already checked in, already checked out, inactive employee, missing face profile.
- Permission denied: no attendance permission.
- Interaction states: loading location, location permission request, location denied, location unavailable, GPS inaccurate, geofence loading, inside geofence, outside geofence, camera permission request, camera denied, camera loading, face detection, liveness check, face mismatch, spoof suspected, verification retry, successful verification, attendance submission, network offline, duplicate attendance.

## Responsive Behavior

Mobile is full-screen task. Desktop keeps same flow in constrained panel.

## Keyboard Behavior

Keyboard can start, retry, cancel, and open diagnostics; camera capture needs accessible button.

## Accessibility Notes

Each step is announced. Failure messages include next action.

## Motion Behavior

Progress transitions under 220ms; success confirmation under 500ms.

## Analytics Events

`check_in_started`, `location_permission_denied`, `geofence_failed`, `face_mismatch`, `check_in_succeeded`, `check_in_failed`.

## Security Considerations

Server verifies tenant, geofence, liveness, face match, duplicate state, and device risk.

