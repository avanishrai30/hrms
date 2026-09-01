# Login

## Purpose

Authenticate a user into one tenant context.

## Target User

Platform Super Admin, Tenant Owner, Tenant Admin, HR Admin, Manager, Employee.

## Route

- `/login`
- Tenant domain example: `https://hr.vcorganics.com/login`

## Permissions

Public before authentication. Successful access requires active tenant, active user, active membership, and valid credentials.

## Information Hierarchy

Tenant identity, credential form, secure access messaging, forgot access, tenant selection when needed.

## Layout

Split desktop layout with brand panel and form panel. Single-column mobile layout with tenant logo above form.

## Component Tree

Tenant brand header, login form, identifier input, password input, submit button, forgot access link, tenant switch link, trust footer.

## Primary CTA

Sign in.

## Secondary Actions

Forgot access, choose tenant.

## Data Requirements

Tenant branding, tenant status, domain resolution result.

## API Dependencies

- `GET /api/v1/public/tenants/resolve`
- `GET /api/v1/public/tenants/:slug/branding`
- `POST /api/v1/auth/login`

## States

- Loading state: resolve tenant and branding with skeleton logo/form.
- Empty state: no tenant resolved, show tenant selection path.
- Error state: invalid credentials, suspended tenant, inactive membership, rate limit.
- Success state: redirect by role.
- Disabled state: submit disabled until required fields are valid.
- Permission-denied state: inactive tenant or removed membership.

## Responsive Behavior

- Mobile: tenant logo, form, recovery links; no decorative side panel.
- Tablet: centered form with compact brand summary.
- Desktop: split panel with tenant brand on left and form on right.

## Keyboard Behavior

Tab through fields and actions. Enter submits. Escape closes tenant selector if open.

## Accessibility Notes

Labels above fields, visible errors, password reveal has accessible label, tenant logo has text alternative.

## Motion Behavior

Fast form state transitions, no login animation delaying submission.

## Analytics Events

`login_viewed`, `login_submitted`, `login_succeeded`, `login_failed`, `tenant_resolved`.

## Security Considerations

Do not reveal whether email exists in another tenant. Rate limit by tenant, IP, and identifier.

