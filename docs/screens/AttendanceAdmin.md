# Attendance Admin

## Purpose

Manage tenant attendance records, manual attendance, and corrections.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/admin/attendance`

## Permissions

`attendance.read`, `attendance.manual.create`, `attendance.update`.

## Information Hierarchy

Today overview, records table, exceptions, manual action, filters.

## Layout

Desktop data grid with side panel. Mobile admin list with filter sheet.

## Component Tree

Header, KPI summary, filters, attendance table, bulk actions, manual attendance modal, detail panel.

## Primary CTA

Manual attendance.

## Secondary Actions

Export, review exceptions, correct record.

## Data Requirements

Attendance records, employees, locations, approval policies.

## API Dependencies

- `GET /api/v1/attendance`
- `POST /api/v1/attendance/manual`
- `GET /api/v1/attendance/attempts`

## States

- Loading: table skeleton.
- Empty: no attendance records.
- Error: load or mutation error.
- Success: records loaded or manual entry saved.
- Disabled: manual entry disabled without reason or approver.
- Permission denied: no attendance admin permission.

## Responsive Behavior

Mobile prioritizes exceptions and search; desktop supports grid density.

## Keyboard Behavior

Command menu, table navigation, manual form keyboard accessible.

## Accessibility Notes

Manual attendance confirmation names employee, date, status, and reason.

## Motion Behavior

Side panel and modal transitions under 280ms.

## Analytics Events

`attendance_admin_viewed`, `manual_attendance_started`, `manual_attendance_created`.

## Security Considerations

Manual attendance requires reason, approver, tenant audit, and permission.

