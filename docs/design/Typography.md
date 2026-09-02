# Typography

## Principles

- Quietly premium.
- Highly readable on mobile.
- Dense enough for operations.
- Consistent across tenants.
- Numeric data must scan quickly.

## Recommended Font Direction

Primary sans:

- Geist, Satoshi, or similar modern grotesk.

Numeric and code-like text:

- Geist Mono or similar mono family.

Do not use decorative display fonts in operational screens.

## Type Roles

### Display

Used sparingly:

- Login brand panel.
- Empty state title.
- Major tenant onboarding milestone.

Tone:

- Confident.
- Not oversized inside dashboard surfaces.

### Page Title

Used for:

- Dashboard.
- Employees.
- Attendance.
- Payroll.
- Reports.
- Tenant settings.

Behavior:

- One line on desktop when possible.
- Wrap cleanly on mobile.

### Section Title

Used for grouped controls, report areas, and form sections.

### Card Title

Used for metric cards, employee cards, leave cards, mobile summaries.

Must be smaller and tighter than page titles.

### Body

Used for descriptions, helper text, and details.

Maximum line length:

- 65 characters for paragraph content.
- Shorter inside cards and mobile panels.

### Label

Used above form fields, filter controls, and settings rows.

Rules:

- Never rely on placeholder as label.
- Keep labels concise.
- Pair with helper text only when needed.

### Numeric

Used for:

- Attendance counts.
- Salary amounts.
- Time values.
- Usage limits.
- Plan metrics.

Rules:

- Use tabular numbers.
- Align decimals and currency values.
- Avoid oversized numbers in compact panels.

## Scale

Recommended scale names:

- `display`
- `title-1`
- `title-2`
- `title-3`
- `body`
- `body-sm`
- `label`
- `caption`
- `numeric-lg`
- `numeric`
- `mono-sm`

## Mobile Rules

- Page titles should remain readable without forcing horizontal scroll.
- Dashboard labels must not truncate critical state.
- Attendance action labels must be instantly readable outdoors.
- Minimum practical body size is 14px.
- Tap target labels should avoid two-line wrapping where possible.

## Tone In Copy

Good:

- "You are outside the assigned location."
- "Face verification needs another photo."
- "Payroll draft is ready for review."
- "Leave request sent to manager."

Avoid:

- "Oops."
- "Something went wrong" without a next step.
- "Invalid biometric data."
- "Unauthorized" as user-facing copy.
# AIavro Typography Alignment

AIavro product chrome uses a modern sans-serif system stack through `--font-sans`. Product labels should use `AIavro`; tenant names such as `VC Organics` appear as workspace context. Avoid legacy `VC-WMS` naming in typography examples, metadata, notifications, and login copy.

