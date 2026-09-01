# Attendance Exceptions

## Purpose

Review failed, suspicious, late, duplicate, and manual attendance cases.

## Target User

Tenant Owner, Tenant Admin, HR Admin, Manager for team scope.

## Route

`/attendance/exceptions`

## Permissions

`attendance.exceptions.read`, actions require review permissions.

## Information Hierarchy

Severity, exception type, employee, evidence, recommended action, audit trail.

## Layout

Queue-based list with detail side panel.

## Component Tree

Filter bar, severity tabs, exception queue, evidence panel, action buttons, timeline.

## Primary CTA

Review selected.

## Secondary Actions

Approve correction, reject, request retry, export.

## Data Requirements

Attendance attempts, fraud signals, employees, locations, audit trail.

## API Dependencies

- `GET /api/v1/attendance/attempts`
- `GET /api/v1/attendance/:id`
- `POST /api/v1/attendance/manual`

## States

- Loading: queue skeleton.
- Empty: no exceptions.
- Error: failed to load evidence.
- Success: decision recorded.
- Disabled: action disabled until reason entered.
- Permission denied: no exception review access.

## Responsive Behavior

Mobile queue first, detail full-screen. Desktop side-by-side queue and evidence.

## Keyboard Behavior

Queue navigation, decision shortcuts require confirmation.

## Accessibility Notes

Severity is text plus icon, not color alone.

## Motion Behavior

Reviewed item removal is subtle and reversible through undo if policy permits.

## Analytics Events

`attendance_exceptions_viewed`, `exception_reviewed`, `exception_decision_submitted`.

## Security Considerations

Evidence access is tenant-scoped and audited.

