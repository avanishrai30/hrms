# Role Management

## Purpose

Manage tenant-level roles and assigned permissions.

## Target User

Tenant Owner, Tenant Admin.

## Route

`/settings/roles`

## Permissions

`roles.read`, `roles.create`, `roles.update`.

## Information Hierarchy

System roles, custom roles, assigned users, permission summary.

## Layout

Role list with detail permission panel.

## Component Tree

Role list, role detail, permission groups, assigned users, save controls.

## Primary CTA

Create role.

## Secondary Actions

Duplicate role, edit permissions, assign users.

## Data Requirements

Tenant roles, permissions, memberships.

## API Dependencies

- `GET /api/v1/tenant/roles`
- `POST /api/v1/tenant/roles`
- `PATCH /api/v1/tenant/roles/:roleId`
- `PATCH /api/v1/tenant/roles/:roleId/permissions`

## States

- Loading: role skeleton.
- Empty: no custom roles.
- Error: save or load failure.
- Success: role saved.
- Disabled: system role destructive edits disabled.
- Permission denied: no role management access.

## Responsive Behavior

Mobile role list to detail route. Desktop side-by-side.

## Keyboard Behavior

Permission checkboxes keyboard accessible.

## Accessibility Notes

Permission groups have legends and clear descriptions.

## Motion Behavior

Panel transitions under 220ms.

## Analytics Events

`roles_viewed`, `role_created`, `role_permissions_saved`.

## Security Considerations

Prevent self-lockout and privilege escalation.

