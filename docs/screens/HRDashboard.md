# HR Dashboard

## Purpose

Support daily HR operations for employees, attendance, leave, payroll, and reports.

## Target User

HR Admin, Tenant Owner, Tenant Admin.

## Route

`/hr`

## Permissions

`hr.dashboard.read`.

## Information Hierarchy

Attendance today, pending leave, employee exceptions, payroll tasks, recent HR activity.

## Layout

KPI strip, priority queue, workforce list preview, payroll checkpoint.

## Component Tree

Tenant shell, HR header, KPI cards, action queue, employee exceptions, payroll panel, activity timeline.

## Primary CTA

Resolve today.

## Secondary Actions

Add employee, approve leave, manual attendance, export report.

## Data Requirements

Attendance counts, pending approvals, employee status, payroll readiness.

## API Dependencies

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/attendance/attempts`
- `GET /api/v1/leaves`
- `GET /api/v1/employees`

## States

- Loading: KPI and queue skeletons.
- Empty: no HR tasks due.
- Error: per-widget retry.
- Success: tenant HR overview.
- Disabled: actions blocked by permission or plan.
- Permission denied: no HR dashboard access.

## Responsive Behavior

Mobile prioritizes exceptions and approvals. Desktop supports denser panels.

## Keyboard Behavior

Command menu and list keyboard navigation.

## Accessibility Notes

Queue items expose status, age, and required action.

## Motion Behavior

No decorative motion; queue changes fade under 160ms.

## Analytics Events

`hr_dashboard_viewed`, `hr_task_opened`, `manual_attendance_clicked`.

## Security Considerations

Sensitive salary widgets hidden unless payroll permission exists.

