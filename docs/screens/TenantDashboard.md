# Tenant Dashboard

## Purpose

Give Tenant Owners and Tenant Admins a tenant-wide operating overview.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/dashboard`

## Permissions

`tenant.dashboard.read`.

## Information Hierarchy

Today status, exceptions, approvals, payroll state, trends, recent activity.

## Layout

Operational dashboard with action-first hierarchy.

## Component Tree

Tenant shell, page header, KPI summary, exception queue, approvals, attendance trend, payroll summary.

## Primary CTA

Review exceptions.

## Secondary Actions

Add employee, export report, generate payroll, configure location.

## Data Requirements

Tenant KPIs, attendance summary, leave queue, payroll summary, audit activity.

## API Dependencies

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/attendance`
- `GET /api/v1/leaves`
- `GET /api/v1/payroll-runs`

## States

- Loading: dashboard skeleton by region.
- Empty: setup checklist when tenant has no employees or locations.
- Error: regional retry.
- Success: tenant-scoped dashboard.
- Disabled: actions disabled by plan or permission.
- Permission denied: no dashboard permission.

## Responsive Behavior

Mobile shows today summary and exceptions first. Charts move below approvals.

## Keyboard Behavior

Command menu, tab through widgets, Enter opens focused queue item.

## Accessibility Notes

KPI cards expose labels, values, and period. Charts have text summaries.

## Motion Behavior

Chart/filter transitions under 220ms.

## Analytics Events

`tenant_dashboard_viewed`, `exception_opened`, `dashboard_quick_action_clicked`.

## Security Considerations

Every metric and drilldown is tenant-scoped.

