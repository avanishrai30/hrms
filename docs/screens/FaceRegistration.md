# Face Registration

## Purpose

Enroll employee face profile for mandatory attendance verification.

## Target User

Employee for self-enrollment, HR Admin for assisted enrollment.

## Route

`/face/register` or `/employees/:id/face-profile/enroll`

## Permissions

`face.self.enroll` or `face.enroll`.

## Information Hierarchy

Requirement explanation, camera readiness, capture guidance, quality result, confirmation.

## Layout

Focused capture flow with minimal text and clear privacy signal.

## Component Tree

Header, camera permission panel, camera preview, capture button, quality feedback, success confirmation.

## Primary CTA

Capture face.

## Secondary Actions

Retry, cancel, contact HR.

## Data Requirements

Employee identity, tenant policy, camera stream, temporary upload key.

## API Dependencies

- `POST /api/v1/employees/:id/face-profile/enroll`

## States

- Loading: camera loading.
- Empty: no active employee profile.
- Error: camera denied, poor quality, service unavailable.
- Success: face profile enrolled.
- Disabled: capture disabled before camera ready.
- Permission denied: no enrollment permission.

## Responsive Behavior

Mobile full-screen capture. Desktop constrained secure capture panel.

## Keyboard Behavior

Capture and retry buttons keyboard accessible.

## Accessibility Notes

Camera guidance has text instructions and status announcements.

## Motion Behavior

Minimal motion; quality result appears quickly.

## Analytics Events

`face_registration_started`, `face_registration_failed`, `face_registered`.

## Security Considerations

Images and embeddings stored tenant-scoped and encrypted according to security architecture.

