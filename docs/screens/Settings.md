# Settings

## Purpose

Provide entry point to tenant and user settings.

## Target User

Tenant users according to permissions.

## Route

`/settings`

## Permissions

Any authenticated tenant user; sections permission-gated.

## Information Hierarchy

Profile settings, tenant settings, branding, roles, locations, policies, security.

## Layout

Settings index with section list and detail area.

## Component Tree

Settings shell, section navigation, detail panel, permission-gated cards.

## Primary CTA

Open selected setting.

## Secondary Actions

Search settings, command menu.

## Data Requirements

User permissions, tenant settings summary.

## API Dependencies

- `GET /api/v1/auth/me`
- `GET /api/v1/tenant/settings`

## States

- Loading: settings skeleton.
- Empty: no configurable sections for user.
- Error: failed to load.
- Success: settings index.
- Disabled: restricted cards disabled with reason.
- Permission denied: inactive membership.

## Responsive Behavior

Mobile list to detail route. Desktop two-column settings layout.

## Keyboard Behavior

Search settings and navigate list with arrows.

## Accessibility Notes

Restricted sections explain permission requirements when directly opened.

## Motion Behavior

Detail transitions under 220ms.

## Analytics Events

`settings_viewed`, `settings_section_opened`.

## Security Considerations

Do not expose hidden settings data in client payloads.

