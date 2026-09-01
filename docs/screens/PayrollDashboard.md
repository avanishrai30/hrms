# Payroll Dashboard

## Purpose

Manage tenant payroll readiness, runs, exceptions, and approvals.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/payroll`

## Permissions

`payroll.read`, `payroll.run.create`, `payroll.approve`.

## Information Hierarchy

Current cycle, payroll status, attendance exceptions, salary rules, previous runs.

## Layout

Payroll summary with exception-first workflow.

## Component Tree

Cycle header, payroll KPI cards, readiness checklist, exceptions, payroll runs table.

## Primary CTA

Generate payroll.

## Secondary Actions

Review exceptions, configure rules, export, approve.

## Data Requirements

Payroll runs, salary rules, attendance summary, leave summary.

## API Dependencies

- `GET /api/v1/payroll-runs`
- `POST /api/v1/payroll-runs`
- `GET /api/v1/salary-rules`

## States

- Loading: payroll skeleton.
- Empty: no payroll runs.
- Error: failed load or generation.
- Success: payroll generated or dashboard loaded.
- Disabled: generate disabled until readiness passes.
- Permission denied: no payroll access.

## Responsive Behavior

Mobile checklist and latest run first. Desktop summary plus table.

## Keyboard Behavior

Table navigation and command menu actions.

## Accessibility Notes

Currency values use readable labels and tabular numbers.

## Motion Behavior

Job status updates without distracting animation.

## Analytics Events

`payroll_dashboard_viewed`, `payroll_generate_clicked`, `payroll_exception_opened`.

## Security Considerations

Payroll is tenant-scoped and salary visibility is permission-gated.

