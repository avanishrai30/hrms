# Accessibility

## Principles

- Accessibility is a product requirement, not a polish task.
- Tenant branding must pass accessibility checks.
- Mobile attendance must work for users with limited vision, motion sensitivity, and motor constraints.
- Color never carries meaning alone.

## Standards

Target:

- WCAG 2.2 AA.

Apply to:

- Web app.
- PWA install experience.
- Tenant login.
- Admin dashboards.
- Attendance flow.
- Employee self-service.
- Reports and exports where practical.

## Color And Contrast

Requirements:

- Body text passes AA contrast.
- Small labels pass AA contrast.
- Button text passes AA contrast.
- Focus indicators are visible in light and dark mode.
- Tenant brand colors are adjusted or rejected when contrast fails.
- Semantic statuses include text labels or icons.

## Keyboard Access

Required:

- All interactive elements reachable by keyboard.
- Logical tab order.
- Visible focus state.
- Escape closes modals, drawers, menus, and popovers.
- Enter and Space activate buttons where expected.
- Data grids provide documented keyboard behavior.

## Screen Readers

Required:

- Form fields have labels.
- Errors are associated with fields.
- Status changes are announced.
- Attendance progress states are announced.
- Icon-only buttons have accessible names.
- Modals announce title and purpose.

## Motion Accessibility

Respect reduced motion:

- Disable pulsing loops.
- Minimize page transitions.
- Avoid motion-only state changes.
- Keep attendance feedback immediate.

## Mobile Accessibility

Required:

- Minimum 44px tap targets.
- Safe area support.
- No critical action hidden behind tiny gestures.
- Camera controls have labels.
- Location and camera permission failures provide readable recovery steps.

## Forms

Rules:

- Label above input.
- Required fields are indicated with text or programmatic metadata.
- Error appears near field.
- Helper text is readable.
- Placeholder is not a label.
- Validation does not rely only on red color.

## Reports And Tables

Requirements:

- Clear table headers.
- Sort state announced.
- Filters have labels.
- Empty and loading states are identified.
- Export buttons name file type and report scope.

## Attendance Accessibility

Attendance flow must:

- Announce each state.
- Provide clear retry actions.
- Explain permission issues.
- Avoid time-limited interactions unless necessary.
- Keep success and failure states readable outdoors.

## Testing Checklist

- Keyboard-only navigation.
- Screen reader smoke test.
- Light and dark contrast checks.
- Tenant color contrast checks.
- Reduced motion mode.
- Mobile viewport tap target check.
- Attendance flow with denied location.
- Attendance flow with denied camera.

