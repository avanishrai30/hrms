# Forgot Access

## Purpose

Recover account access inside a resolved tenant context.

## Target User

Tenant users and platform users through separated flows.

## Route

`/forgot-access`

## Permissions

Public before authentication. Recovery is tenant-scoped.

## Information Hierarchy

Tenant identity, recovery identifier, confirmation message, return to login.

## Layout

Single focused form with minimal copy.

## Component Tree

Tenant brand header, identifier input, submit button, return link, status message.

## Primary CTA

Send recovery link.

## Secondary Actions

Back to sign in, choose tenant.

## Data Requirements

Tenant resolution, identifier.

## API Dependencies

- `GET /api/v1/public/tenants/resolve`
- `POST /api/v1/auth/forgot-access` future endpoint.

## States

- Loading: tenant resolving or request submitting.
- Empty: no tenant found.
- Error: invalid tenant, rate limit, delivery unavailable.
- Success: neutral confirmation regardless of account existence.
- Disabled: identifier missing or invalid.
- Permission denied: suspended tenant recovery blocked unless policy allows.

## Responsive Behavior

Mobile-first centered form. Desktop may include brand side panel.

## Keyboard Behavior

Enter submits. Links are keyboard reachable.

## Accessibility Notes

Neutral success copy prevents account enumeration and remains understandable.

## Motion Behavior

Simple status fade under 220ms.

## Analytics Events

`forgot_access_viewed`, `forgot_access_submitted`, `forgot_access_completed`.

## Security Considerations

Never confirm account existence. Rate limit heavily.

