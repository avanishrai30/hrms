# Motion System

## Principles

- Motion supports speed, confidence, and state clarity.
- Attendance flow motion must be fast and reassuring.
- Enterprise dashboards use restrained transitions.
- Respect reduced motion preferences.
- Motion never hides system latency.

## Motion Personality

Reference feel:

- Linear for crisp transitions.
- Vercel for fast interface response.
- Stripe for polished but purposeful reveal.

Avoid:

- Bouncy consumer motion.
- Long cinematic transitions.
- Infinite decorative animation.
- Motion that delays attendance completion.

## Duration Scale

- Instant feedback: 80ms to 120ms.
- Hover and press states: 120ms to 160ms.
- Small component transitions: 160ms to 220ms.
- Sheet, drawer, modal: 220ms to 280ms.
- Page transition: 180ms to 260ms.
- Success confirmation: 300ms to 500ms.

## Easing

Use:

- Standard ease-out for entrance.
- Standard ease-in for exit.
- Smooth ease-in-out for layout changes.

Avoid elastic easing for serious workflows.

## Attendance Motion

Attendance flow target: under 10 seconds.

Motion states:

- GPS acquiring: subtle pulsing location ring, max 1 second before showing progress copy.
- Geo-fence passed: immediate check confirmation.
- Camera ready: no decorative transition; prioritize speed.
- Face verifying: short progress state with clear feedback.
- Success: compact confirmation with timestamp and location.
- Failure: direct state change with reason and next step.

No attendance animation should block user action for more than 300ms.

## Dashboard Motion

Use motion for:

- Loading skeleton fade.
- Metric value update.
- Chart transition on filter change.
- Row hover affordance.
- Drawer open and close.

Do not animate:

- Every table row on initial load.
- Large report grids.
- Audit log streams.

## Mobile Motion

Mobile motion must feel native:

- Bottom sheets slide from bottom.
- Drawers use scrim and direct movement.
- Primary buttons show press feedback.
- Toasts enter from bottom above navigation.
- Camera and GPS states avoid large layout jumps.

## Reduced Motion

When reduced motion is enabled:

- Replace movement with opacity or instant state changes.
- Disable pulsing loops.
- Keep loading skeletons subtle.
- Preserve all information and state changes.

## Performance Rules

- Animate transform and opacity where possible.
- Avoid animating layout-heavy properties.
- Do not animate large tables.
- Motion must not reduce attendance flow reliability on low-end devices.

