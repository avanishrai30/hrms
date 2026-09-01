# Color System

## Principles

- Neutral-first enterprise palette.
- One primary accent.
- Semantic colors are consistent across tenants.
- Dark mode is first-class.
- Tenant branding can override accent tokens within accessibility rules.
- Avoid one-note palettes and broad hue saturation.

## Base Palette

### Light Mode

- Canvas: warm white.
- Surface: white.
- Surface muted: soft green-gray.
- Surface raised: white with fine border.
- Text primary: near-black graphite.
- Text secondary: cool gray.
- Text muted: medium gray.
- Border subtle: pale gray.
- Border strong: medium gray.

### Dark Mode

- Canvas: deep graphite.
- Surface: charcoal.
- Surface muted: dark green-gray.
- Surface raised: dark neutral.
- Text primary: near-white.
- Text secondary: soft gray.
- Text muted: medium gray.
- Border subtle: dark gray.
- Border strong: gray.

## Core Accent

Primary accent direction:

- Fresh mineral green.
- Not neon.
- Not forest-heavy.
- Not beige or rustic.

Use primary accent for:

- Primary actions.
- Active navigation.
- Selected controls.
- Progress highlights.
- Key dashboard trend emphasis.

Do not use primary accent for:

- Destructive actions.
- Payroll errors.
- Attendance rejection.
- Warning states.

## Semantic Colors

### Success

Use for successful check-in, approved leave, completed payroll, verified face match.

Tone:

- Clear green.
- Higher contrast than brand accent.

### Warning

Use for late attendance, pending approval, quota approaching limit, incomplete profile.

Tone:

- Amber.
- Must remain legible on light and dark surfaces.

### Danger

Use for attendance rejection, failed verification, suspended tenant, destructive actions.

Tone:

- Red.
- Strong enough for immediate recognition.

### Info

Use for neutral system guidance, queued exports, payroll draft state, plan information.

Tone:

- Blue.
- Quiet, not promotional.

### Review

Use for fraud review, manual attendance approval, suspicious activity.

Tone:

- Violet or magenta-gray.
- Reserved so it does not compete with primary status colors.

## Tenant Brand Overrides

Tenant primary color may override:

- Primary button background.
- Active nav indicator.
- Focus accent.
- Selected tab indicator.
- Brand strip.

Tenant color may not override:

- Error.
- Warning.
- Success.
- Critical fraud state.
- Disabled state.
- Text contrast tokens.

## Contrast Rules

- Body text: WCAG AA minimum.
- Small labels: WCAG AA minimum.
- Icon-only buttons: visible affordance with hover and focus states.
- Primary button text: strong contrast in every tenant theme.
- Tenant colors failing contrast are adjusted by system-generated accessible variants.

## Data Visualization Colors

Charts use a restrained categorical palette:

- Primary accent.
- Blue.
- Amber.
- Red.
- Gray.
- Violet.

Rules:

- Attendance status colors match semantic state.
- Payroll charts use calm financial colors.
- Never encode critical information with color alone.
- Use labels, legends, patterns, or icons where needed.

