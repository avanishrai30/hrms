# Leave Request

## Purpose

Submit or edit a leave request according to tenant policy.

## Target User

Employee.

## Route

`/leaves/request`

## Permissions

`leaves.self.create`.

## Information Hierarchy

Leave type, dates, balance impact, reason, submit.

## Layout

Simple mobile-first form.

## Component Tree

Leave type select, date range, balance preview, reason field, submit bar.

## Primary CTA

Submit request.

## Secondary Actions

Save draft, cancel.

## Data Requirements

Leave policies, balances, existing overlapping requests.

## API Dependencies

- `POST /api/v1/leaves`
- `GET /api/v1/leaves/me`

## States

- Loading: policy loading.
- Empty: no leave policies available.
- Error: validation, overlap, insufficient balance, submit failure.
- Success: request submitted.
- Disabled: submit disabled until valid.
- Permission denied: inactive employee or no leave permission.

## Responsive Behavior

Mobile single column with sticky submit. Desktop compact form.

## Keyboard Behavior

Date inputs and submit keyboard accessible.

## Accessibility Notes

Balance impact is text and announced after date changes.

## Motion Behavior

Validation appears inline without layout jump.

## Analytics Events

`leave_request_viewed`, `leave_request_submitted`, `leave_request_failed`.

## Security Considerations

Server validates policy, balances, tenant, and employee status.

