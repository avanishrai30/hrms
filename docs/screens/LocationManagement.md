# Location Management

## Purpose

Manage tenant workplace locations used for geo-fenced attendance.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/settings/locations`

## Permissions

`locations.read`, `locations.create`, `locations.update`.

## Information Hierarchy

Locations, active status, radius, assigned employees or policy, map preview.

## Layout

Desktop table with map/detail panel. Mobile cards with edit sheet.

## Component Tree

Header, location list, map preview, create/edit form, status toggle, audit timeline.

## Primary CTA

Add location.

## Secondary Actions

Edit, deactivate, test geofence.

## Data Requirements

Locations, tenant attendance settings, related attendance usage.

## API Dependencies

- `GET /api/v1/locations`
- `POST /api/v1/locations`
- `PATCH /api/v1/locations/:id`
- `PATCH /api/v1/locations/:id/status`

## States

- Loading: list/map skeleton.
- Empty: no locations; attendance setup blocked.
- Error: map or API failure.
- Success: location saved.
- Disabled: deactivate disabled when policy prevents it.
- Permission denied: no location management access.

## Responsive Behavior

Mobile edit as sheet. Desktop map and table side-by-side.

## Keyboard Behavior

Forms and toggles keyboard accessible.

## Accessibility Notes

Map cannot be the only representation; coordinates and radius are text fields.

## Motion Behavior

Map panel does not animate heavily.

## Analytics Events

`locations_viewed`, `location_created`, `location_status_changed`.

## Security Considerations

All locations are tenant-scoped; changes audited.

