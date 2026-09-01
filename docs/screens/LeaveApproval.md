# Leave Approval

## Purpose

Review, approve, or reject leave requests.

## Target User

Manager, HR Admin, Tenant Admin.

## Route

`/leaves/approvals`

## Permissions

`leaves.approve.manager`, `leaves.approve.hr`.

## Information Hierarchy

Request details, balance, team coverage, approval history, decision.

## Layout

Queue with detail panel.

## Component Tree

Approval queue, request detail, employee context, history timeline, decision controls.

## Primary CTA

Approve.

## Secondary Actions

Reject, comment, request changes.

## Data Requirements

Leave requests, employee balances, team calendar, approval history.

## API Dependencies

- `GET /api/v1/leaves`
- `POST /api/v1/leaves/:id/manager-approve`
- `POST /api/v1/leaves/:id/manager-reject`
- `POST /api/v1/leaves/:id/hr-approve`
- `POST /api/v1/leaves/:id/hr-reject`

## States

- Loading: queue skeleton.
- Empty: no approvals pending.
- Error: stale request or decision failure.
- Success: decision saved.
- Disabled: decision disabled until required comment for rejection.
- Permission denied: no approval permission or outside team scope.

## Responsive Behavior

Mobile detail full-screen. Desktop queue and side panel.

## Keyboard Behavior

Decision buttons reachable; destructive rejection requires confirmation.

## Accessibility Notes

Approval history is a semantic timeline.

## Motion Behavior

Queue update under 220ms.

## Analytics Events

`leave_approval_viewed`, `leave_approved`, `leave_rejected`.

## Security Considerations

Approval transition enforced server-side by role and workflow step.

