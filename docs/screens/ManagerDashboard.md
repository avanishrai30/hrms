# Manager Dashboard

## Purpose

Give managers a focused view of team availability, attendance exceptions, and leave approvals.

## Target User

Manager.

## Route

`/manager`

## Permissions

`team.dashboard.read`.

## Information Hierarchy

Team present, team late, absent employees, pending approvals, upcoming leave.

## Layout

Team summary, approvals queue, attendance exceptions, team calendar preview.

## Component Tree

Tenant shell, team KPI cards, approval list, exception list, calendar strip.

## Primary CTA

Review approvals.

## Secondary Actions

View team, view attendance, export team report if permitted.

## Data Requirements

Manager team employees, attendance status, leave requests.

## API Dependencies

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/leaves`
- `GET /api/v1/attendance`

## States

- Loading: team skeleton.
- Empty: no team assigned.
- Error: retry.
- Success: team overview.
- Disabled: approval actions disabled for stale requests.
- Permission denied: user is not manager or lacks team scope.

## Responsive Behavior

Mobile shows approvals before charts. Desktop shows side-by-side team panels.

## Keyboard Behavior

Arrow through approvals. Enter opens detail. A approves only after confirmation shortcut pattern.

## Accessibility Notes

Approval decisions require explicit labels and confirmation.

## Motion Behavior

Approval removal collapses quickly with reduced-motion fallback.

## Analytics Events

`manager_dashboard_viewed`, `leave_approval_opened`, `team_exception_opened`.

## Security Considerations

Managers see only assigned team scope.

