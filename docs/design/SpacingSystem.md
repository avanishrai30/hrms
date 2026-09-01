# Spacing System

## Principles

- Mobile-first rhythm.
- Compact operational density.
- Clear separation without excessive cards.
- Predictable dashboard scanning.
- Stable layouts that do not shift when data loads.

## Spacing Scale

Use an 8px base rhythm with smaller 4px increments for dense controls.

Named spacing:

- `0`: none.
- `1`: 4px.
- `2`: 8px.
- `3`: 12px.
- `4`: 16px.
- `5`: 20px.
- `6`: 24px.
- `8`: 32px.
- `10`: 40px.
- `12`: 48px.
- `16`: 64px.
- `20`: 80px.

## Layout Rhythm

### App Shell

- Desktop sidebar width: stable and not content-dependent.
- Desktop header height: 64px to 72px.
- Mobile top bar: 56px to 64px.
- Bottom navigation: 64px to 72px.

### Page

- Mobile page padding: 16px.
- Tablet page padding: 24px.
- Desktop page padding: 32px.
- Maximum content width for dense admin pages: 1440px.

### Forms

- Field stack gap: 16px.
- Label to input gap: 6px to 8px.
- Input to helper text gap: 6px.
- Section gap: 32px to 48px.

### Cards And Panels

- Compact card padding: 16px.
- Standard panel padding: 20px to 24px.
- Dashboard grid gap: 16px to 24px.
- Repeated list row padding: 12px to 16px.

## Radius System

Use a restrained radius system:

- Small controls: 6px.
- Inputs and selects: 8px.
- Cards and panels: 8px.
- Modals and drawers: 12px.
- Pills and chips: full radius only when the shape communicates selection or status.

Cards should not exceed 8px radius unless used for modal-level surfaces.

## Density Modes

### Comfortable

Used for:

- Employee self-service.
- Mobile attendance.
- Onboarding.

### Standard

Used for:

- Most admin screens.
- Employee profile.
- Leave management.

### Dense

Used for:

- Reports.
- Payroll tables.
- Audit logs.

Dense mode must preserve tap target sizes on touch devices.

## Responsive Behavior

- Multi-column desktop layouts collapse to single-column mobile layouts.
- Primary actions stay visible near the top or bottom action bar on mobile.
- Filters collapse into sheets or drawers on mobile.
- Tables become list/detail or horizontally managed report views.
- Content must never require horizontal scrolling except controlled data grids.

