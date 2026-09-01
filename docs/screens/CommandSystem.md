# Command System

## Purpose

Provide a fast global command palette for navigation, search, lookup, tenant switching, and permitted actions.

## Target User

Platform Super Admin, Tenant Owner, Tenant Admin, HR Admin, Manager, Employee.

## Route

Global overlay available from authenticated app shell.

## Permissions

Command results and actions are filtered by tenant context, membership, role, feature flags, and plan.

## Information Hierarchy

Recent actions, search input, grouped results, keyboard hints, action confirmation.

## Layout

Centered desktop command palette. Mobile full-screen command sheet.

## Component Tree

Command trigger, overlay, search input, result groups, result row, action confirmation, empty state.

## Primary CTA

Run selected command.

## Secondary Actions

Open result, switch tenant, refine search, close.

## Data Requirements

Navigation registry, employee lookup, attendance lookup, settings registry, tenant memberships, permitted actions.

## API Dependencies

- `GET /api/v1/auth/me`
- `GET /api/v1/employees`
- `GET /api/v1/attendance`
- `GET /api/v1/tenant/settings`

## Search Scope

Tenant users can search:

- Navigation.
- Employees within scope.
- Attendance records within scope.
- Leave requests within scope.
- Settings they can access.
- Reports they can access.

Platform Super Admins can search:

- Platform navigation.
- Tenant registry.
- Platform audit.
- Platform health.

## Actions

Supported actions:

- Add employee.
- Check in or check out for self.
- Request leave.
- Approve leave where permitted.
- Create report.
- Generate payroll where permitted.
- Open tenant settings.
- Switch tenant where permitted.

## Keyboard Shortcuts

Recommended:

- Open command palette: `Cmd/Ctrl+K`.
- Close: `Escape`.
- Navigate results: Arrow keys.
- Run command: `Enter`.
- Open in new context where supported: `Cmd/Ctrl+Enter`.

## States

- Loading: search in progress with stable result shell.
- Empty: no results for query.
- Error: search unavailable; local navigation results remain.
- Success: command executed or result opened.
- Disabled: command unavailable by permission, state, plan, or feature flag.
- Permission denied: hidden from default results; direct command attempt shows safe denial.

## Responsive Behavior

Mobile uses full-screen sheet with large rows. Desktop uses compact palette.

## Keyboard Behavior

Keyboard-first on desktop. Touch-first on mobile.

## Accessibility Notes

Use combobox semantics. Announce result count and selected result.

## Motion Behavior

Overlay opens under 180ms. Reduced motion uses instant open.

## Analytics Events

`command_opened`, `command_searched`, `command_executed`, `command_permission_denied`, `tenant_switched`.

## Security Considerations

Search APIs enforce tenant and role scope. Hidden commands cannot be invoked by guessing IDs.

