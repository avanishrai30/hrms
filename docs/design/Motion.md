# Motion

AIavro motion is restrained and functional.

## Tokens

- Instant: 80ms for focus and pressed states
- Fast: 120ms for hover and active feedback
- Standard: 180ms for navigation state changes
- Emphasized: 240ms for drawers, command palette, and modal entry

## Easing

- Enter: ease-out
- Exit: ease-in
- Movement: cubic-bezier(0.2, 0.8, 0.2, 1)

## Rules

- Respect `prefers-reduced-motion`.
- Use motion to preserve state continuity, not to decorate.
- Avoid long-running background animation in operational screens.
- Loading states should match final layout geometry.
