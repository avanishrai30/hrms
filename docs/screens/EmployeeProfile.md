# Employee Profile

## Purpose

Review a complete tenant employee record and related operational history.

## Target User

Tenant Owner, Tenant Admin, HR Admin, Manager with team scope, Employee for own profile.

## Route

`/employees/:id`

## Permissions

`employees.read`; sections require salary, document, audit, or attendance permissions.

## Information Hierarchy

Identity, status, profile completion, employment, attendance, leave, salary, documents, audit.

## Layout

Header summary with section tabs and detail panels.

## Component Tree

Profile header, status badge, section tabs, overview panels, timeline, document list.

## Primary CTA

Edit employee.

## Secondary Actions

Upload document, enroll face, change status, view audit.

## Data Requirements

Employee, membership, attendance, leave, salary profile, documents.

## API Dependencies

- `GET /api/v1/employees/:id`
- `GET /api/v1/attendance`
- `GET /api/v1/leaves`
- `GET /api/v1/employees/:id/documents`

## States

- Loading: profile skeleton.
- Empty: missing optional sections.
- Error: not found or failed load.
- Success: scoped employee profile.
- Disabled: actions disabled by status or permission.
- Permission denied: no employee or section access.

## Responsive Behavior

Mobile uses stacked sections. Desktop supports side panel details.

## Keyboard Behavior

Tabs keyboard accessible. Actions reachable from header menu.

## Accessibility Notes

Profile photo has useful alternative or initials.

## Motion Behavior

Section switch is instant or subtle fade.

## Analytics Events

`employee_profile_viewed`, `employee_section_opened`, `employee_action_clicked`.

## Security Considerations

Lookup by ID plus tenant ID. Mask sensitive fields without permission.

