# Tenant Settings

## Purpose

Configure tenant profile, locale, timezone, currency, payroll defaults, and policy basics.

## Target User

Tenant Owner, Tenant Admin.

## Route

`/settings/tenant`

## Permissions

`tenant.settings.read`, `tenant.settings.update`.

## Information Hierarchy

Company identity, timezone/locale, payroll defaults, attendance defaults, save state.

## Layout

Sectioned settings form.

## Component Tree

Header, company fields, regional settings, payroll defaults, attendance defaults, save bar.

## Primary CTA

Save settings.

## Secondary Actions

Cancel, view audit.

## Data Requirements

Tenant settings, tenant metadata, policies.

## API Dependencies

- `GET /api/v1/tenant/settings`
- `PATCH /api/v1/tenant/settings`

## States

- Loading: form skeleton.
- Empty: settings not provisioned.
- Error: validation or save failure.
- Success: settings saved.
- Disabled: save disabled until valid changes exist.
- Permission denied: no tenant settings permission.

## Responsive Behavior

Mobile single-column. Desktop sectioned form with sticky save.

## Keyboard Behavior

Ctrl/Cmd+S saves when valid.

## Accessibility Notes

Timezone and currency controls have clear labels.

## Motion Behavior

Save success subtle.

## Analytics Events

`tenant_settings_viewed`, `tenant_settings_saved`.

## Security Considerations

Tenant context is server-derived; changes audited.

