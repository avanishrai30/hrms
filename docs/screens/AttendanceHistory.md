# Attendance History

## Purpose

Show an employee's tenant-scoped attendance history.

## Target User

Employee for self; HR Admin, Manager, Tenant Admin according to scope.

## Route

`/attendance/history`

## Permissions

`attendance.self.read` or `attendance.read`.

## Information Hierarchy

Date filters, attendance records, status, hours, exceptions, export.

## Layout

Mobile timeline/list. Desktop table with filters.

## Component Tree

Header, date filter, status filters, attendance list/table, detail sheet, export action.

## Primary CTA

Filter history.

## Secondary Actions

Export, open record, request correction if permitted.

## Data Requirements

Attendance records, attempts when permitted, locations.

## API Dependencies

- `GET /api/v1/attendance/me/history`
- `GET /api/v1/attendance`
- `POST /api/v1/reports/exports`

## States

- Loading: list skeleton.
- Empty: no records for selected period.
- Error: failed to load.
- Success: history loaded.
- Disabled: export disabled when no records or no permission.
- Permission denied: no attendance read scope.

## Responsive Behavior

Mobile cards. Desktop sortable table.

## Keyboard Behavior

Filter controls and rows keyboard accessible.

## Accessibility Notes

Statuses include labels and dates use readable format.

## Motion Behavior

Filter update under 220ms.

## Analytics Events

`attendance_history_viewed`, `attendance_history_filtered`, `attendance_export_clicked`.

## Security Considerations

Self route returns own records only. Admin route enforces tenant and team scope.

