# Face Verification

## Purpose

Verify liveness and face match during attendance or HR review.

## Target User

Employee; HR Admin for review where permitted.

## Route

`/attendance/face-verification`

## Permissions

`attendance.self.create` or `face.review`.

## Information Hierarchy

Camera preview, face detected state, liveness state, match result, retry.

## Layout

Focused verification state panel.

## Component Tree

Camera preview, alignment guide, liveness status, match status, retry/continue actions.

## Primary CTA

Verify face.

## Secondary Actions

Retake, cancel, view guidance.

## Data Requirements

Face profile status, temporary upload, verification result.

## API Dependencies

- Internal through attendance endpoints.
- `POST /internal/v1/face/verify` via API only.

## States

- Loading: camera or verification loading.
- Empty: no active face profile.
- Error: camera denied, face mismatch, liveness failed, spoof suspected.
- Success: face verified.
- Disabled: continue disabled until verification passes.
- Permission denied: invalid membership or tenant.

## Responsive Behavior

Mobile full-screen camera. Desktop centered panel.

## Keyboard Behavior

All actions keyboard reachable; camera permission remains browser-controlled.

## Accessibility Notes

Verification status announced. Visual alignment guidance has text alternative.

## Motion Behavior

No decorative camera motion. Status changes under 220ms.

## Analytics Events

`face_verification_started`, `face_verification_passed`, `face_verification_failed`.

## Security Considerations

Face service must reject object keys outside tenant prefix.

