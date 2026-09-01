# Employee Dashboard

## Purpose

Give employees immediate access to attendance, leave, salary, profile, and notifications.

## Target User

Employee.

## Route

`/home`

## Permissions

`employee.dashboard.read`.

## Information Hierarchy

Attendance action, current status, work hours, leave balance, salary estimate, profile tasks.

## Layout

Mobile-first single column. Desktop may show compact summary panels.

## Component Tree

Mobile shell, attendance action, trust indicators, leave balance card, salary card, profile completion, notifications.

## Primary CTA

Check in or Check out.

## Secondary Actions

Request leave, view salary, complete profile.

## Data Requirements

Today attendance, employee profile, leave balance, salary estimate, notifications.

## API Dependencies

- `GET /api/v1/attendance/me/today`
- `GET /api/v1/payroll/me`
- `GET /api/v1/leaves/me`
- `GET /api/v1/auth/me`

## States

- Loading: attendance action loads first, secondary skeletons below.
- Empty: missing face profile or no attendance today.
- Error: attendance unavailable with retry.
- Success: current day summary.
- Disabled: check-in blocked by missing enrollment, policy, or duplicate state.
- Permission denied: inactive employee or membership.

## Responsive Behavior

Mobile attendance above fold. Tablet two-column summaries. Desktop compact employee portal.

## Keyboard Behavior

Primary CTA first in tab order. Enter triggers when focused.

## Accessibility Notes

Attendance status announced. Large tap targets for outdoor use.

## Motion Behavior

Fast state changes; no delay before attendance interaction.

## Analytics Events

`employee_dashboard_viewed`, `attendance_cta_clicked`, `leave_request_clicked`.

## Security Considerations

Employee sees only own tenant-scoped data.

