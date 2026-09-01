# Attendance Verification

## Purpose

Represent the combined verification step for location, face, device, and time.

## Target User

Employee.

## Route

`/attendance/verification`

## Permissions

`attendance.self.create`.

## Information Hierarchy

Verification progress, trust indicators, failure reason, retry.

## Layout

Focused verification panel with four trust indicators.

## Component Tree

Progress header, location indicator, face indicator, device indicator, time indicator, retry panel.

## Primary CTA

Continue.

## Secondary Actions

Retry verification, view details, cancel.

## Data Requirements

Verification attempt, geofence result, face result, device risk result.

## API Dependencies

- `POST /api/v1/attendance/check-in`
- `POST /api/v1/attendance/check-out`

## States

- Loading: verification in progress.
- Empty: no verification attempt.
- Error: verification service unavailable.
- Success: all required checks passed.
- Disabled: continue disabled until required checks pass.
- Permission denied: invalid tenant membership.
- Interaction states: geofence loading, inside geofence, outside geofence, face detection, liveness check, face mismatch, spoof suspected, verification retry, successful verification.

## Responsive Behavior

Mobile vertical indicators. Desktop compact grid.

## Keyboard Behavior

Retry and details are reachable. Status updates announced.

## Accessibility Notes

Each trust indicator has text status.

## Motion Behavior

Short progress transitions; reduced motion uses instant status changes.

## Analytics Events

`attendance_verification_started`, `attendance_verification_passed`, `attendance_verification_failed`.

## Security Considerations

Verification result must come from API, not client-only checks.

