# Attendance Home

## Purpose

Show current attendance state and route the user to the correct attendance action.

## Target User

Employee, Manager, HR Admin for self-attendance.

## Route

`/attendance`

## Permissions

`attendance.self.read`, `attendance.self.create`.

## Information Hierarchy

Current status, next action, trust indicators, history preview, policy messages.

## Layout

Mobile-first action surface with trust row and recent history.

## Component Tree

Attendance action, status card, trust indicators, last record, history link, policy note.

## Primary CTA

Check in or Check out.

## Secondary Actions

View history, view diagnostics, contact HR.

## Data Requirements

Today attendance, employee status, face profile status, tenant attendance policy.

## API Dependencies

- `GET /api/v1/attendance/me/today`
- `GET /api/v1/employees/:id/face-profile`

## States

- Loading: current attendance state loading.
- Empty: no attendance today.
- Error: cannot load status.
- Success: next action known.
- Disabled: missing face profile, inactive employee, duplicate state, suspended tenant.
- Permission denied: no self-attendance permission.

## Responsive Behavior

Mobile CTA above fold. Tablet and desktop add history preview beside action.

## Keyboard Behavior

Primary action first, Enter activates, diagnostics expandable by keyboard.

## Accessibility Notes

Attendance state announced and not color-only.

## Motion Behavior

Fast state transitions; no decorative loops.

## Analytics Events

`attendance_home_viewed`, `attendance_next_action_clicked`, `attendance_diagnostics_opened`.

## Security Considerations

Status comes from server; client cannot infer or override attendance eligibility.

