# Leave Dashboard

## Purpose

Show leave balances, requests, approvals, and policy context.

## Target User

Employee, Manager, HR Admin, Tenant Admin.

## Route

`/leaves`

## Permissions

`leaves.self.read`, `leaves.read`, or approval permissions by role.

## Information Hierarchy

Balance, upcoming leave, pending requests, approvals, policy.

## Layout

Employee view is simple cards. Admin view includes queue and filters.

## Component Tree

Balance cards, request list, approval queue, policy summary, filter controls.

## Primary CTA

Request leave.

## Secondary Actions

Approve, reject, cancel, export.

## Data Requirements

Leave balances, requests, policies, approvers.

## API Dependencies

- `GET /api/v1/leaves/me`
- `GET /api/v1/leaves`

## States

- Loading: balance and list skeleton.
- Empty: no leave requests.
- Error: failed to load.
- Success: leave dashboard loaded.
- Disabled: request disabled by policy or inactive employee.
- Permission denied: no leave access.

## Responsive Behavior

Mobile balances and request CTA first. Desktop queue/table for admins.

## Keyboard Behavior

Approval queue navigable by keyboard.

## Accessibility Notes

Balance values include units and policy labels.

## Motion Behavior

Approval updates fade quickly.

## Analytics Events

`leave_dashboard_viewed`, `leave_request_clicked`, `leave_approval_opened`.

## Security Considerations

Employees see own leave; managers see team scope.

