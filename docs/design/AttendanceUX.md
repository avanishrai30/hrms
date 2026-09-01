# Attendance UX

## Goal

Employee check-in or check-out must complete in under 10 seconds on normal mobile networks when permissions, GPS, and camera are available.

## Principles

- Mobile-first.
- One primary action at a time.
- No bypass for face verification.
- No bypass for geo-fence verification.
- Failure messages explain the next step.
- Outdoor readability matters.
- Tenant location and employee identity are always scoped server-side.

## Primary Flow

1. Employee opens dashboard.
2. Attendance action is visible immediately.
3. Employee taps Check in or Check out.
4. App requests location.
5. API verifies tenant geo-fence.
6. App opens camera.
7. Employee captures face.
8. API and face service verify liveness and match.
9. Success screen shows time, location, and status.

## Time Budget

Target total: under 10 seconds.

Recommended budget:

- Tap response: under 100ms.
- GPS acquisition: under 3 seconds.
- Geo-fence API check: under 1 second.
- Camera readiness: under 1 second.
- Face capture: user dependent, target under 2 seconds.
- Face verification: under 3 seconds.
- Success write and response: under 1 second.

## Screen States

### Ready

Show:

- Current status.
- Primary check-in or check-out action.
- Current tenant.
- Last attendance time if available.

### Requesting Location

Show:

- Progress message.
- Permission guidance if blocked.
- No long animation.

### Outside Geo-Fence

Show:

- Clear reason.
- Nearest assigned location when permitted.
- Distance from allowed location.
- Retry action.
- Contact HR action if policy permits.

### Camera Permission Needed

Show:

- Why camera is required.
- System permission guidance.
- Retry action.

### Face Capture

Show:

- Camera preview.
- Face alignment guidance.
- Lighting guidance only when needed.
- Capture button.

### Verifying

Show:

- Short progress state.
- Do not allow duplicate submissions.

### Success

Show:

- Check-in or check-out status.
- Timestamp.
- Location.
- Verification success.
- Optional working hours summary.

### Failed

Show:

- Failure reason.
- Retry action when safe.
- HR contact or review state when repeated failures occur.

## Anti-Fraud UX

Suspicious events should be clear without being accusatory.

Examples:

- "Location accuracy is too low. Move to an open area and try again."
- "This device appears different from your usual device. HR may review this attempt."
- "Face verification did not match your profile. Try again in better lighting."

## Offline And Poor Network

Attendance requires server verification. Offline check-in is not accepted in Phase 1.

Poor network state:

- Keep captured state only temporarily.
- Explain that attendance needs a connection.
- Allow retry.
- Avoid presenting unverified attendance as successful.

## Accessibility

- All camera controls have labels.
- Status is announced to screen readers.
- Color is not the only status indicator.
- Buttons are large enough for thumb use.
- Failure states use readable copy and clear next actions.

