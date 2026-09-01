# API Specification

## Standards

- REST API under `/api/v1`.
- OpenAPI generated from NestJS decorators.
- JSON request and response bodies.
- DTO validation on every write endpoint.
- JWT access token for API authorization.
- Refresh token stored in secure, HTTP-only cookie.
- Tenant context required for all tenant APIs.
- Rate limiting on authentication, attendance, upload, and export endpoints.
- Audit logging for sensitive reads and all mutations.

## Tenant Resolution

Tenant context is resolved server-side from one of:

- Tenant subdomain.
- Verified custom domain.
- Login route slug.
- Existing authenticated session.

Clients must not submit `tenantId` in business request bodies. If a platform endpoint requires a tenant ID, it appears in the URL and requires Platform Super Admin permission.

## Error Shape

```json
{
  "error": {
    "code": "TENANT_ACCESS_DENIED",
    "message": "You do not have access to this tenant resource.",
    "requestId": "uuid",
    "tenantId": "uuid",
    "details": {}
  }
}
```

## Platform Tenant Management

Platform Super Admin only:

- `GET /api/v1/platform/tenants`
- `POST /api/v1/platform/tenants`
- `GET /api/v1/platform/tenants/:tenantId`
- `PATCH /api/v1/platform/tenants/:tenantId`
- `PATCH /api/v1/platform/tenants/:tenantId/status`
- `GET /api/v1/platform/tenants/:tenantId/health`
- `GET /api/v1/platform/audit-logs`

## Tenant Settings And Branding

Tenant Owner and permitted HR Admins:

- `GET /api/v1/tenant/settings`
- `PATCH /api/v1/tenant/settings`
- `GET /api/v1/tenant/branding`
- `PATCH /api/v1/tenant/branding`
- `POST /api/v1/tenant/branding/logo`
- `GET /api/v1/tenant/roles`
- `POST /api/v1/tenant/roles`
- `PATCH /api/v1/tenant/roles/:roleId`
- `PATCH /api/v1/tenant/roles/:roleId/permissions`

Public tenant bootstrap:

- `GET /api/v1/public/tenants/resolve?host=example.com`
- `GET /api/v1/public/tenants/:slug/branding`

## Authentication

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/admin/reset-password`

Login request includes tenant slug or is resolved from domain:

```json
{
  "tenantSlug": "vc-organics",
  "identifier": "employee@example.com",
  "password": "string",
  "deviceFingerprint": "string"
}
```

## Employees

Tenant-scoped:

- `GET /api/v1/employees`
- `POST /api/v1/employees`
- `GET /api/v1/employees/:id`
- `PATCH /api/v1/employees/:id`
- `PATCH /api/v1/employees/:id/status`
- `POST /api/v1/employees/:id/documents`
- `GET /api/v1/employees/:id/documents`
- `DELETE /api/v1/employees/:id/documents/:documentId`
- `POST /api/v1/employees/:id/face-profile/enroll`
- `GET /api/v1/employees/:id/face-profile`

## Locations

Tenant-scoped:

- `GET /api/v1/locations`
- `POST /api/v1/locations`
- `GET /api/v1/locations/:id`
- `PATCH /api/v1/locations/:id`
- `PATCH /api/v1/locations/:id/status`

## Attendance

Tenant-scoped:

- `POST /api/v1/attendance/check-in`
- `POST /api/v1/attendance/check-out`
- `POST /api/v1/attendance/manual`
- `GET /api/v1/attendance/me/today`
- `GET /api/v1/attendance/me/history`
- `GET /api/v1/attendance`
- `GET /api/v1/attendance/:id`
- `GET /api/v1/attendance/attempts`

### Check-In Request

```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracyMeters": 20,
  "deviceFingerprint": "string",
  "capturedAt": "2026-08-31T09:00:00.000Z",
  "faceImageObjectKey": "tenants/{tenant_id}/temporary-uploads/{upload_id}"
}
```

### Check-In Response

```json
{
  "attendanceId": "uuid",
  "tenantId": "uuid",
  "status": "PRESENT",
  "verificationStatus": "PASSED",
  "distanceMeters": 42,
  "faceScore": 0.86,
  "livenessScore": 0.91
}
```

## Leave

Tenant-scoped:

- `GET /api/v1/leaves/me`
- `POST /api/v1/leaves`
- `GET /api/v1/leaves/:id`
- `PATCH /api/v1/leaves/:id/cancel`
- `GET /api/v1/leaves`
- `POST /api/v1/leaves/:id/manager-approve`
- `POST /api/v1/leaves/:id/manager-reject`
- `POST /api/v1/leaves/:id/hr-approve`
- `POST /api/v1/leaves/:id/hr-reject`

## Payroll

Tenant-scoped:

- `GET /api/v1/salary-rules`
- `POST /api/v1/salary-rules`
- `PATCH /api/v1/salary-rules/:id`
- `GET /api/v1/payroll-runs`
- `POST /api/v1/payroll-runs`
- `GET /api/v1/payroll-runs/:id`
- `POST /api/v1/payroll-runs/:id/approve`
- `POST /api/v1/payroll-runs/:id/mark-paid`
- `GET /api/v1/payroll/me`

## Reports

Tenant-scoped:

- `GET /api/v1/reports/attendance`
- `GET /api/v1/reports/employees`
- `GET /api/v1/reports/leaves`
- `GET /api/v1/reports/salary`
- `GET /api/v1/reports/departments`
- `GET /api/v1/reports/late-arrivals`
- `POST /api/v1/reports/exports`
- `GET /api/v1/reports/exports/:id`

Platform analytics, separated from tenant APIs:

- `GET /api/v1/platform/reports/tenant-usage`
- `GET /api/v1/platform/reports/system-health`

## Admin

Tenant-scoped:

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/roles`
- `PATCH /api/v1/admin/users/:id/status`

## Internal Face Service API

Internal network only. Every request includes signed service auth and `tenantId`.

- `POST /internal/v1/face/enroll`
- `POST /internal/v1/face/verify`
- `GET /internal/v1/health`

Verification request:

```json
{
  "tenantId": "uuid",
  "employeeId": "uuid",
  "faceImageObjectKey": "tenants/{tenant_id}/attendance/{attendance_attempt_id}",
  "modelName": "insightface",
  "modelVersion": "string"
}
```

