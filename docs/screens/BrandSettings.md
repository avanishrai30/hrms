# Brand Settings

## Purpose

Configure tenant white-label branding for web, PWA, email, and PDF surfaces.

## Target User

Tenant Owner, Tenant Admin.

## Route

`/settings/branding`

## Permissions

`tenant.branding.read`, `tenant.branding.update`.

## Information Hierarchy

Logo, favicon, tenant name, colors, theme preview, custom domain status.

## Layout

Brand form with live preview and accessibility checks.

## Component Tree

Upload controls, color inputs, preview panels, contrast status, save bar.

## Primary CTA

Save branding.

## Secondary Actions

Preview dark mode, reset to default, verify domain.

## Data Requirements

Tenant branding, domain status, plan entitlement.

## API Dependencies

- `GET /api/v1/tenant/branding`
- `PATCH /api/v1/tenant/branding`
- `POST /api/v1/tenant/branding/logo`

## States

- Loading: preview skeleton.
- Empty: default branding.
- Error: invalid color, upload failure, contrast failure.
- Success: branding saved.
- Disabled: save disabled when contrast fails or plan blocks feature.
- Permission denied: no branding permission.

## Responsive Behavior

Mobile form first, preview below. Desktop preview beside controls.

## Keyboard Behavior

Color controls and uploads keyboard accessible.

## Accessibility Notes

Contrast checks are text and status, not color only.

## Motion Behavior

Preview updates instantly or under 160ms.

## Analytics Events

`brand_settings_viewed`, `branding_saved`, `branding_contrast_failed`.

## Security Considerations

Reject unsafe uploads and arbitrary CSS/script.

