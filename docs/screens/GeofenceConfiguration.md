# Geofence Configuration

## Purpose

Configure and test geofence radius and attendance location rules.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/settings/geofence`

## Permissions

`locations.update`, `attendance.policy.update`.

## Information Hierarchy

Policy summary, location radius, accuracy thresholds, test tool, exception handling.

## Layout

Settings form plus visual preview and test result panel.

## Component Tree

Policy form, radius inputs, accuracy rules, map preview, test coordinate panel, save bar.

## Primary CTA

Save rules.

## Secondary Actions

Test location, reset changes.

## Data Requirements

Tenant attendance policy, locations, feature flags.

## API Dependencies

- `GET /api/v1/locations`
- `PATCH /api/v1/locations/:id`
- Future `GET/PATCH /api/v1/tenant/attendance-policy`

## States

- Loading: policy skeleton.
- Empty: no locations configured.
- Error: invalid radius or save failure.
- Success: rules saved.
- Disabled: save disabled when invalid or unchanged.
- Permission denied: no policy update permission.

## Responsive Behavior

Mobile form first, preview collapses below. Desktop side-by-side.

## Keyboard Behavior

Numeric inputs support keyboard editing. Test action reachable.

## Accessibility Notes

Geofence preview has text equivalent.

## Motion Behavior

Radius preview updates directly without animated distraction.

## Analytics Events

`geofence_config_viewed`, `geofence_test_run`, `geofence_rules_saved`.

## Security Considerations

Client preview is informational; server owns final geofence decision.

