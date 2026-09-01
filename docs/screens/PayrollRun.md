# Payroll Run

## Purpose

Review, approve, export, and mark a tenant payroll run paid.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/payroll/runs/:id`

## Permissions

`payroll.read`; approve/pay actions require `payroll.approve` or `payroll.markPaid`.

## Information Hierarchy

Run status, totals, exceptions, employee line items, approval history.

## Layout

Header summary, tabs for line items/exceptions/audit, sticky actions.

## Component Tree

Run header, status badge, totals, tabs, payroll table, exception panel, approval timeline.

## Primary CTA

Approve payroll.

## Secondary Actions

Export, regenerate draft, mark paid, cancel.

## Data Requirements

Payroll run, items, calculation snapshots, approvals, audit logs.

## API Dependencies

- `GET /api/v1/payroll-runs/:id`
- `POST /api/v1/payroll-runs/:id/approve`
- `POST /api/v1/payroll-runs/:id/mark-paid`

## States

- Loading: run skeleton.
- Empty: run has no items due to generation failure.
- Error: stale run, failed action.
- Success: action recorded.
- Disabled: approve disabled for unresolved exceptions or wrong status.
- Permission denied: no payroll run access.

## Responsive Behavior

Mobile uses summary and line-item cards. Desktop uses dense table.

## Keyboard Behavior

Payroll table supports keyboard row navigation.

## Accessibility Notes

Approval confirmation reads total amount and employee count.

## Motion Behavior

Status badge updates quickly; no table row animation.

## Analytics Events

`payroll_run_viewed`, `payroll_approved`, `payroll_marked_paid`, `payroll_exported`.

## Security Considerations

Approved and paid payroll cannot be silently mutated.

