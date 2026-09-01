# Payslip

## Purpose

Show employee salary breakdown for an approved payroll item.

## Target User

Employee for own payslip; HR Admin for permitted tenant employees.

## Route

`/salary/payslips/:id`

## Permissions

`payroll.self.read` or `payroll.read`.

## Information Hierarchy

Net salary, gross salary, attendance impact, deductions, payroll period, download.

## Layout

Document-like view with tenant branding for PDF/export.

## Component Tree

Payslip header, employee summary, salary totals, attendance breakdown, deductions, download action.

## Primary CTA

Download PDF.

## Secondary Actions

Print, view payroll history.

## Data Requirements

Payroll item, employee, tenant branding, salary snapshot.

## API Dependencies

- `GET /api/v1/payroll/me`
- Future `GET /api/v1/payroll/payslips/:id`

## States

- Loading: payslip skeleton.
- Empty: no payslip for selected period.
- Error: unavailable or not approved.
- Success: payslip rendered.
- Disabled: download disabled until approved/generated.
- Permission denied: no salary access.

## Responsive Behavior

Mobile readable stacked breakdown. Desktop document preview.

## Keyboard Behavior

Download and print accessible.

## Accessibility Notes

Tables have headers; currency values have labels.

## Motion Behavior

No decorative motion.

## Analytics Events

`payslip_viewed`, `payslip_downloaded`, `payslip_printed`.

## Security Considerations

Payslip access is highly sensitive and tenant/user scoped.

