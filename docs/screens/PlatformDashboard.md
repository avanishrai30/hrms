# Platform Dashboard

## Purpose

Monitor and operate the SaaS platform across tenants.

## Target User

Platform Super Admin.

## Route

`/platform`

## Permissions

`platform.dashboard.read`.

## Information Hierarchy

Platform health, tenant counts, incidents, usage limits, queue health, recent platform audit.

## Layout

Dense dashboard with KPI strip, alert queue, tenant activity, system health panels.

## Component Tree

Platform shell, KPI row, incident list, tenant health table, usage chart, audit timeline.

## Primary CTA

Create tenant.

## Secondary Actions

View tenants, review audit, manage plans, open feature flags.

## Data Requirements

Tenant metrics, system health, plan distribution, recent audit logs.

## API Dependencies

- `GET /api/v1/platform/tenants`
- `GET /api/v1/platform/reports/tenant-usage`
- `GET /api/v1/platform/reports/system-health`
- `GET /api/v1/platform/audit-logs`

## States

- Loading: independent skeleton regions.
- Empty: no tenants yet, show onboarding CTA.
- Error: failed region remains isolated.
- Success: live platform summary.
- Disabled: actions disabled during incident lock.
- Permission denied: tenant users cannot access.

## Responsive Behavior

Mobile is read-first with alert and tenant list. Desktop uses full dashboard density.

## Keyboard Behavior

Command menu, table navigation, shortcuts for create tenant and search.

## Accessibility Notes

Charts include summaries. Alert severity is text and color.

## Motion Behavior

Metric updates are subtle. No animated audit streams.

## Analytics Events

`platform_dashboard_viewed`, `tenant_create_clicked`, `platform_alert_opened`.

## Security Considerations

Never show tenant-sensitive employee/payroll data in aggregate dashboard.

