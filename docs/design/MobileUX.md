# Mobile UX

## Principles

- PWA-first.
- Thumb-friendly.
- Fast attendance access.
- Offline-aware but honest.
- Works outdoors.
- Dense admin screens become focused mobile tasks.

## Navigation

Employee mobile navigation:

- Home.
- Attendance.
- Leave.
- Salary.
- Profile.

Admin mobile navigation:

- Home.
- Employees.
- Attendance.
- Approvals.
- More.

Use bottom navigation for frequent modules. Use a More screen for lower-frequency admin tools.

## Touch Targets

- Minimum target: 44px.
- Preferred primary action height: 48px to 56px.
- Icon-only buttons need labels for assistive technology.
- Destructive actions need spacing from safe actions.

## Attendance Priority

On employee mobile home:

- Attendance action must be visible without scrolling.
- Current status must be visible.
- Failure state must include next step.
- Tenant identity should be clear but not dominant.

## Forms On Mobile

Rules:

- Single column.
- Labels above fields.
- Use native date/time pickers where appropriate.
- Long forms use sections or steps.
- Sticky bottom action bar for save/submit.
- Validation appears near the field.

## Tables On Mobile

Avoid full desktop tables on mobile.

Use:

- Search.
- Filter sheet.
- Sort menu.
- List cards.
- Detail sheet or detail route.

Payroll and reports may support controlled horizontal scrolling only when preserving tabular comparison is essential.

## PWA Behavior

PWA must support:

- Install prompt.
- Tenant-branded name and icon.
- Safe area handling.
- App-like navigation.
- Session restoration.
- Clear offline messaging.

Offline:

- Browsing cached non-sensitive shell can be allowed.
- Attendance success cannot be faked offline.
- Forms can preserve drafts locally only when security policy permits.

## Mobile Performance

Targets:

- First useful screen quickly on average 4G.
- Attendance action interactive as soon as session is valid.
- Avoid heavy dashboard charts above the fold.
- Lazy-load admin-heavy modules.
- Compress and validate images before upload where safe.

## Device Permissions

Permission prompts:

- Ask at the moment of need.
- Explain why permission is required.
- Provide recovery steps when blocked.

Required permissions:

- Location for attendance.
- Camera for face verification.

