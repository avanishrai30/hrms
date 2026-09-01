# Tenant Selection

## Purpose

Let users with multiple memberships or unresolved host context choose a tenant.

## Target User

Users with multiple tenant memberships; public users when tenant cannot be resolved.

## Route

`/tenants/select`

## Permissions

Authenticated for membership list. Public mode allows slug/domain entry only.

## Information Hierarchy

Current account, tenant list, tenant status, search, manual tenant entry.

## Layout

Centered selection list with search. Mobile uses full-screen list.

## Component Tree

Account header, search input, tenant list, tenant card, status badge, continue button.

## Primary CTA

Continue.

## Secondary Actions

Sign out, enter tenant domain.

## Data Requirements

Memberships, tenant branding summaries, tenant statuses.

## API Dependencies

- `GET /api/v1/auth/me`
- `GET /api/v1/public/tenants/resolve`

## States

- Loading: membership list skeleton.
- Empty: no active memberships.
- Error: failed to load tenants.
- Success: selected tenant context set.
- Disabled: tenant suspended or archived.
- Permission denied: membership removed.

## Responsive Behavior

Mobile list cards. Tablet two-column cards. Desktop constrained list or grid.

## Keyboard Behavior

Arrow navigation through tenant list. Enter selects. Search focused by shortcut.

## Accessibility Notes

Tenant status is text plus badge. Current selection is announced.

## Motion Behavior

List items fade quickly; no stagger over 80ms total.

## Analytics Events

`tenant_selection_viewed`, `tenant_selected`, `tenant_selection_failed`.

## Security Considerations

Do not expose tenants where user has no membership.

