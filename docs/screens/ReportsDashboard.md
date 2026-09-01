# Reports Dashboard

## Purpose

Generate, filter, view, and export tenant reports.

## Target User

Tenant Owner, Tenant Admin, HR Admin, Manager with scope.

## Route

`/reports`

## Permissions

`reports.read`, export permissions by report type.

## Information Hierarchy

Report categories, saved views, filters, recent exports, scheduled reports future.

## Layout

Report category grid plus recent export list and preview panel.

## Component Tree

Report header, category list, filter builder, preview table/chart, export drawer, recent exports.

## Primary CTA

Create report.

## Secondary Actions

Export CSV, export Excel, export PDF, save view.

## Data Requirements

Report metadata, saved filters, export jobs, tenant permissions.

## API Dependencies

- `GET /api/v1/reports/attendance`
- `GET /api/v1/reports/employees`
- `GET /api/v1/reports/leaves`
- `GET /api/v1/reports/salary`
- `POST /api/v1/reports/exports`
- `GET /api/v1/reports/exports/:id`

## States

- Loading: report skeleton.
- Empty: no data for filters.
- Error: query or export failure.
- Success: report loaded or export queued.
- Disabled: export disabled by plan, permission, or empty result.
- Permission denied: no report access.

## Responsive Behavior

Mobile uses report picker and cards. Desktop uses preview table and filters.

## Keyboard Behavior

Filters and report list keyboard navigable.

## Accessibility Notes

Charts include text summary and table equivalent.

## Motion Behavior

Filter changes are calm; export status updates visibly.

## Analytics Events

`reports_viewed`, `report_run`, `report_export_requested`, `report_export_downloaded`.

## Security Considerations

Reports are tenant-scoped; manager exports are team-scoped.

