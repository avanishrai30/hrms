# Audit Logs

## Purpose

Review tenant or platform audit history.

## Target User

Platform Super Admin, Tenant Owner, Tenant Admin, HR Admin with audit permission.

## Route

`/audit-logs` and `/platform/audit-logs`

## Permissions

`audit.read` or `platform.audit.read`.

## Information Hierarchy

Time, actor, action, resource, outcome, filters, details.

## Layout

Dense immutable event table with detail drawer.

## Component Tree

Filter bar, audit table, severity/status badges, detail drawer, metadata viewer, export action.

## Primary CTA

Filter logs.

## Secondary Actions

Export, open detail, copy audit ID.

## Data Requirements

Audit logs, actors, resource metadata.

## API Dependencies

- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/platform/audit-logs`

## States

- Loading: table skeleton.
- Empty: no logs for selected filters.
- Error: failed to load.
- Success: logs loaded.
- Disabled: export disabled by permission or plan.
- Permission denied: no audit access.

## Responsive Behavior

Mobile event cards and detail route. Desktop sticky-header table.

## Keyboard Behavior

Table rows keyboard navigable. Copy action accessible.

## Accessibility Notes

Audit metadata is structured and readable without color.

## Motion Behavior

No animated streams; detail drawer under 280ms.

## Analytics Events

`audit_logs_viewed`, `audit_filtered`, `audit_detail_opened`, `audit_exported`.

## Security Considerations

Tenant audit logs cannot include another tenant. Platform logs require platform role.

