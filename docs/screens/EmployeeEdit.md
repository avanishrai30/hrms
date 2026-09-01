# Employee Edit

## Purpose

Update tenant employee information safely with audit visibility.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/employees/:id/edit`

## Permissions

`employees.update`.

## Information Hierarchy

Editable profile sections, unsaved changes, validation, audit-impacting fields.

## Layout

Sectioned form with sticky save bar.

## Component Tree

Header, section nav, editable fields, sensitive field controls, save bar, confirmation dialogs.

## Primary CTA

Save changes.

## Secondary Actions

Cancel, reset section, change status.

## Data Requirements

Employee, departments, designations, managers, salary rules.

## API Dependencies

- `GET /api/v1/employees/:id`
- `PATCH /api/v1/employees/:id`
- `PATCH /api/v1/employees/:id/status`

## States

- Loading: form skeleton.
- Empty: target employee not found.
- Error: validation, conflict, failed save.
- Success: changes saved.
- Disabled: save disabled when unchanged or invalid.
- Permission denied: no update permission.

## Responsive Behavior

Mobile uses full-screen sections. Desktop supports side navigation.

## Keyboard Behavior

Ctrl/Cmd+S saves when valid. Escape prompts if unsaved changes.

## Accessibility Notes

Unsaved and saved states announced.

## Motion Behavior

Save confirmation subtle, under 300ms.

## Analytics Events

`employee_edit_viewed`, `employee_update_submitted`, `employee_updated`.

## Security Considerations

Audit before/after snapshots for sensitive changes.

