# Permission Management

## Purpose

Inspect platform-defined permissions and tenant role mappings.

## Target User

Platform Super Admin for platform definitions; Tenant Owner/Admin for tenant mappings.

## Route

`/settings/permissions`

## Permissions

`permissions.read`; platform edit requires platform permission.

## Information Hierarchy

Permission resources, actions, role mappings, risk level.

## Layout

Permission matrix with resource grouping.

## Component Tree

Resource filter, permission matrix, role columns, risk badges, save bar.

## Primary CTA

Save mapping.

## Secondary Actions

Search, reset, export matrix.

## Data Requirements

Permissions, tenant roles, current mappings.

## API Dependencies

- `GET /api/v1/tenant/roles`
- `PATCH /api/v1/tenant/roles/:roleId/permissions`

## States

- Loading: matrix skeleton.
- Empty: no permissions available.
- Error: failed save.
- Success: mapping saved.
- Disabled: immutable permissions disabled.
- Permission denied: no permission management access.

## Responsive Behavior

Mobile uses resource group accordions. Desktop matrix.

## Keyboard Behavior

Matrix supports keyboard traversal and checkbox toggles.

## Accessibility Notes

Matrix cells expose role, permission, and state.

## Motion Behavior

No heavy matrix animation.

## Analytics Events

`permissions_viewed`, `permission_mapping_changed`, `permission_mapping_saved`.

## Security Considerations

High-risk permissions require confirmation and audit.

