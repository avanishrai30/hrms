# Design Tokens

## Purpose

Define implementation-agnostic design tokens for consistent UI across tenants, light mode, dark mode, and white-label themes.

Do not treat these as code. UI engineers should map these tokens into the chosen implementation stack later.

## Token Categories

- Color.
- Typography.
- Spacing.
- Radius.
- Shadow.
- Border.
- Motion.
- Z-index.
- Breakpoint.
- Component state.

## Color Tokens

Base:

- `color.canvas`
- `color.surface`
- `color.surface.muted`
- `color.surface.raised`
- `color.text.primary`
- `color.text.secondary`
- `color.text.muted`
- `color.border.subtle`
- `color.border.strong`

Brand:

- `color.brand.primary`
- `color.brand.secondary`
- `color.brand.accent`
- `color.brand.onPrimary`

Semantic:

- `color.success`
- `color.success.surface`
- `color.warning`
- `color.warning.surface`
- `color.danger`
- `color.danger.surface`
- `color.info`
- `color.info.surface`
- `color.review`
- `color.review.surface`

## Typography Tokens

- `font.family.sans`
- `font.family.mono`
- `font.size.display`
- `font.size.title1`
- `font.size.title2`
- `font.size.title3`
- `font.size.body`
- `font.size.bodySm`
- `font.size.label`
- `font.size.caption`
- `font.weight.regular`
- `font.weight.medium`
- `font.weight.semibold`
- `font.lineHeight.tight`
- `font.lineHeight.normal`
- `font.lineHeight.relaxed`

## Spacing Tokens

- `space.0`
- `space.1`
- `space.2`
- `space.3`
- `space.4`
- `space.5`
- `space.6`
- `space.8`
- `space.10`
- `space.12`
- `space.16`
- `space.20`

## Radius Tokens

- `radius.none`
- `radius.xs`
- `radius.sm`
- `radius.md`
- `radius.lg`
- `radius.full`

Recommended mapping:

- Inputs: `radius.md`.
- Buttons: `radius.md` or `radius.full` by variant.
- Cards: `radius.md`.
- Modals: `radius.lg`.

## Shadow Tokens

- `shadow.none`
- `shadow.focus`
- `shadow.raised`
- `shadow.overlay`

Shadows must be subtle and background-aware.

## Motion Tokens

- `motion.duration.instant`
- `motion.duration.fast`
- `motion.duration.normal`
- `motion.duration.slow`
- `motion.easing.enter`
- `motion.easing.exit`
- `motion.easing.standard`

## Z-Index Tokens

- `z.base`
- `z.dropdown`
- `z.sticky`
- `z.drawer`
- `z.modal`
- `z.toast`
- `z.tooltip`

## Breakpoint Tokens

- `breakpoint.sm`
- `breakpoint.md`
- `breakpoint.lg`
- `breakpoint.xl`
- `breakpoint.2xl`

## Tenant Override Rules

Tenant can override:

- Brand colors.
- Logo.
- PWA name.
- Favicon.
- Login brand image if enabled.

Tenant cannot override:

- Semantic danger, warning, and success meaning.
- Minimum contrast.
- Tap target size.
- Component state semantics.
- Attendance flow order.

