# DESIGN.md

## Purpose

This is the canonical visual contract for VC-WMS design and build agents.

VC-WMS is a brand-neutral, white-label, multi-tenant workforce management SaaS platform. VC Organics is Tenant #1 and may use `hr.vcorganics.com`, but the core product must never become VC Organics-only.

## Visual Theme And Atmosphere

The product should feel calm, premium, precise, intelligent, trustworthy, contemporary, operationally efficient, and visually quiet.

Reference quality:

- Linear: crisp hierarchy and fast interactions.
- Stripe: commercial polish and confident surfaces.
- Vercel: technical clarity and restraint.
- Notion: calm structure.
- Rippling: operational completeness.
- Ramp: financial trust and clean density.

Do not copy those brands. Build an original workforce SaaS language.

## Core Design Read

This is a B2B SaaS operations product for HR teams, managers, platform operators, and mobile employees. The interface should be information-dense without feeling crowded, with stronger simplicity for employees and higher density for admins.

## Color Palette And Semantic Roles

Use neutral-first surfaces with a single fresh mineral-green product accent by default.

Light theme:

- Canvas: warm white.
- Surface: white.
- Muted surface: soft green-gray.
- Raised surface: white with fine border.
- Primary text: graphite near-black.
- Secondary text: cool gray.
- Muted text: medium gray.
- Subtle border: pale gray.
- Strong border: medium gray.

Dark theme:

- Canvas: deep graphite.
- Surface: charcoal.
- Muted surface: dark green-gray.
- Raised surface: dark neutral.
- Primary text: near-white.
- Secondary text: soft gray.
- Muted text: medium gray.
- Subtle border: dark gray.
- Strong border: gray.

Semantic colors:

- Success: verified attendance, approved leave, completed payroll.
- Warning: late, pending, approaching limit, incomplete setup.
- Danger: failed verification, suspended tenant, destructive action.
- Info: queued export, draft payroll, neutral system guidance.
- Review: fraud review, suspicious activity, manual attendance review.

Rules:

- Tenant brand color can drive primary actions and active navigation.
- Semantic colors cannot be replaced by tenant branding.
- Color never communicates status alone.
- Avoid rainbow gradients, generic AI purple, and broad saturated palettes.

## Typography Rules

Use a modern sans family such as Geist or Satoshi. Use a mono family such as Geist Mono for codes, IDs, timestamps, and aligned numeric data.

Type roles:

- Display: login brand panel and rare onboarding moments only.
- Page title: one per page.
- Section title: grouped content and form sections.
- Card title: compact summaries.
- Body: readable operational copy.
- Label: above form controls.
- Caption: metadata and secondary context.
- Numeric: tabular values for time, money, counts, usage, and trends.

Rules:

- Do not use decorative display fonts in operational screens.
- Do not use placeholder text as labels.
- Use tabular numbers for payroll, attendance time, usage, and counts.
- Keep employee-facing copy plain and non-technical.

## Component Styling

Base component shape:

- Inputs: 8px radius.
- Buttons: 8px radius or pill only when selection semantics require it.
- Cards and panels: 8px radius.
- Modals and drawers: 12px radius.
- Status pills: full radius.

Component states:

- Default.
- Hover.
- Active.
- Focus visible.
- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Selected.
- Permission denied.

Core components:

- Button.
- Icon button.
- Input.
- Select.
- Combobox.
- Checkbox.
- Radio.
- Toggle.
- Tabs.
- Badge.
- Toast.
- Modal.
- Drawer.
- Sheet.
- Table.
- Data card.
- Timeline.
- File upload.
- Command palette.
- Tenant switcher.
- Attendance action.

Rules:

- Primary CTAs use 1 to 3 words.
- Button labels do not wrap on desktop.
- Icon buttons require accessible labels.
- Long mobile forms use routes or sheets, not cramped modals.
- Tables need sorting, filtering, column visibility, pagination, row actions, bulk actions, export, and complete states.

## Layout Principles

App shell:

- Desktop uses sidebar plus top context bar.
- Mobile uses bottom navigation for frequent employee/admin tasks.
- Platform console is visually distinct through navigation content, not a separate brand.

Page layout:

- Mobile padding: 16px.
- Tablet padding: 24px.
- Desktop padding: 32px.
- Dense admin max width: 1440px.
- Header height: 64px to 72px desktop, 56px to 64px mobile.
- Bottom nav: 64px to 72px.

Hierarchy:

- Dashboards answer: what is happening, what needs attention, what changed, and what action should be taken.
- Avoid random metric-card grids.
- Use cards only when they carry real grouped information.
- Prefer dividers, spacing, and alignment over excessive borders.

## Depth And Elevation

Use subtle elevation.

- Default surfaces are flat.
- Raised panels use fine border plus very soft shadow.
- Modals, sheets, menus, and command palette receive stronger overlay depth.
- Avoid heavy black shadows.
- Avoid glassmorphism as a default material.

## Responsive Behavior

Mobile:

- Employee flows are task-first.
- Attendance appears above the fold.
- Tables transform into cards, sheets, and detail routes.
- Filters open in bottom sheets.
- Primary actions can use sticky bottom bars.

Tablet:

- Two-column forms where useful.
- Dashboard cards use 2-column grids.
- Side panels may become full-height drawers.

Desktop:

- Admin workflows can use data tables, saved views, side panels, command palette, keyboard shortcuts, and inline editing.
- Keep navigation one line and below 80px height.

## Motion

Motion communicates state and hierarchy.

Durations:

- Press feedback: 80ms to 120ms.
- Hover: 120ms to 160ms.
- Component transition: 160ms to 220ms.
- Drawer or modal: 220ms to 280ms.
- Route transition: 180ms to 260ms.
- Success confirmation: 300ms to 500ms.

Rules:

- Attendance motion must never block action for more than 300ms.
- Do not animate large tables or audit streams.
- Use transform and opacity where possible.
- Respect reduced motion.

## Attendance Experience

Attendance is the flagship employee flow.

Preferred flow:

1. Open app.
2. Determine current attendance state.
3. Validate location.
4. Validate geofence.
5. Open camera.
6. Run liveness.
7. Run face verification.
8. Submit attendance.
9. Show confirmation.

Trust indicators:

- Location: Verified.
- Face: Verified.
- Device: Recognized.
- Time: Recorded.

Employee copy should be understandable:

- Use "You're at your assigned workplace."
- Avoid "GPS accuracy: 14.7m / threshold: 100m" except in expandable diagnostics.

Required attendance states:

- Loading location.
- Location permission request.
- Location denied.
- Location unavailable.
- GPS inaccurate.
- Geofence loading.
- Inside geofence.
- Outside geofence.
- Camera permission request.
- Camera denied.
- Camera loading.
- Face detection.
- Liveness check.
- Face mismatch.
- Spoof suspected.
- Verification retry.
- Successful verification.
- Attendance submission.
- Attendance success.
- Attendance submission failure.
- Network offline.
- Duplicate attendance.
- Already checked in.
- Already checked out.

## White-Label Rules

Tenant can customize:

- Logo.
- Tenant name.
- Favicon.
- Primary brand color.
- Secondary brand color.
- Accent color.
- Light and dark theme accents.
- Custom domain.
- PWA name.
- Email branding.
- PDF branding.

Tenant cannot customize:

- Accessibility thresholds.
- Semantic danger, warning, success, info, and review meanings.
- Security-critical states.
- Attendance flow order.
- Tap target minimums.
- Core layout density.
- Component behavior.

Fallbacks:

- If tenant logo is missing, use initials in a fixed logo container.
- If tenant brand color fails contrast, generate an accessible shade.
- If custom domain is invalid, fall back to tenant subdomain.

## Do's

- Design for speed and clarity.
- Keep employee screens radically simple.
- Keep admin screens dense but quiet.
- Make tenant identity visible without dominating operations.
- Use explicit loading, empty, error, success, disabled, and permission states.
- Make every screen keyboard and screen-reader accessible.

## Don'ts

- Do not build VC Organics-only UI.
- Do not use Bootstrap-like dashboard patterns.
- Do not use excessive cards or borders.
- Do not use rainbow gradients.
- Do not use decorative illustrations as primary UI.
- Do not use low-contrast muted text.
- Do not hide errors in toasts only.
- Do not force desktop tables onto mobile.
- Do not fake offline attendance success.

## Agent Prompt Guide

When building UI, agents must:

1. Read this `DESIGN.md`.
2. Read the relevant `docs/screens/*.md`.
3. Read supporting docs in `docs/design/` only when more detail is needed.
4. Preserve tenant-neutral product language.
5. Treat VC Organics only as a tenant example.
6. Implement all documented states.
7. Enforce accessibility and responsive behavior.
8. Avoid inventing business rules in components.

