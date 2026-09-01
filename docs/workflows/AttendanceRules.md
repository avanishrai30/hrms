# Attendance Rules

## Employee Self-Attendance

Employee attendance must pass both tenant geo-fence verification and tenant face verification.

Flow:

1. Employee logs in inside a resolved tenant context.
2. Client captures GPS coordinates and device metadata.
3. API validates tenant, membership, employee, session, and device risk.
4. API checks coordinates against active locations for the authenticated tenant only.
5. Client opens camera and captures attendance photo to a tenant-scoped temporary object path.
6. Face service verifies liveness and employee match within the same tenant only.
7. API creates attendance record with `tenant_id` if all mandatory checks pass.
8. API stores failed attempts and fraud signals with `tenant_id` when checks fail.

## Geo-Fence Decision

Each active location has:

- Tenant ID
- Name
- Latitude
- Longitude
- Radius in meters

Decision:

- Inside radius: allow geo-fence step.
- Outside radius: reject self-attendance and record attempt.

Distance must be calculated server-side from submitted coordinates and stored in meters. Location lookup must include tenant scope.

## Face Verification Decision

Required checks:

- Employee has active face profile.
- Submitted image passes liveness threshold.
- Submitted image matches employee face profile threshold.
- Verification result comes from the internal face service for the same tenant.

Failure must prevent attendance creation for employee self-attendance.

## Manual Attendance

Allowed roles:

- HR Admin
- Tenant Owner

Mandatory fields:

- Employee
- Attendance date
- Status
- Reason
- Approver

Manual entries must create:

- Attendance record
- Audit log
- Modifier user reference
- Tenant ID
- Timestamp

## Attendance Statuses

- Present
- Absent
- Half Day
- Late
- Leave
- Holiday
- Week Off
- Work From Home

## Fraud Signals

Detect and log:

- GPS spoofing indicators
- Mock location flag when provided by device APIs
- VPN or suspicious IP signal
- Multiple device usage
- Face mismatch
- Repeated failed attempts
- Unusual location accuracy
- Impossible travel between attempts

Fraud signals should move a tenant-scoped attempt to `REVIEW_REQUIRED` when risk exceeds configured thresholds.

## Audit Events

Audit these events:

- Attendance created
- Attendance rejected
- Manual attendance created
- Attendance corrected
- Face enrollment created
- Face verification failed
- Geo-fence failed
- Fraud signal detected

All audit events include tenant ID.
