# SaaS Metrics

## Purpose

Define SaaS operating metrics for VC-WMS across product, reliability, security, usage, and commercial readiness.

## Tenant Metrics

Track per tenant:

- Active employees.
- Active users.
- Active Tenant Admins.
- Locations.
- Attendance records per day.
- Attendance attempts per day.
- Failed attendance attempts.
- Face verification failure rate.
- Geo-fence rejection rate.
- Leave requests.
- Payroll runs.
- Report exports.
- Storage usage.
- API request volume.
- Background job volume.
- Last active date.

## Platform Metrics

Track platform-wide:

- Total tenants.
- Active tenants.
- Trial tenants.
- Suspended tenants.
- Monthly active tenants.
- Daily active users.
- Monthly active users.
- API latency.
- Error rate.
- Worker job failure rate.
- Database query latency.
- Redis cache hit rate.
- MinIO storage growth.
- Face-service latency and error rate.

## Commercial Metrics

Prepare for future billing integration:

- Plan distribution.
- Trial conversion.
- Tenant expansion by employee count.
- Tenant contraction by employee count.
- Churned tenants.
- Monthly recurring revenue placeholder.
- Usage over limit.
- Add-on eligibility.
- Billing status.

## Product Health Metrics

Measure:

- Attendance completion time.
- Attendance success rate.
- Leave approval time.
- Payroll generation time.
- Report export completion time.
- Profile completion rate.
- Face enrollment completion rate.
- Mobile PWA usage.

## Security Metrics

Measure:

- Login failures by tenant.
- Suspicious IP activity.
- VPN detection events.
- Mock location events.
- Multiple device warnings.
- Repeated face mismatch attempts.
- Cross-tenant access denied events.
- Permission denied events.
- Support access events.

## SLOs

Initial targets:

- API availability: 99.5 percent.
- Attendance check-in API p95: under 2 seconds excluding face-service image processing.
- Face verification p95: under 6 seconds.
- Report export job success: 99 percent.
- Payroll generation job success: 99 percent.
- Tenant login p95: under 1 second.

## Metrics Isolation

Tenant dashboards show only tenant-scoped metrics. Platform dashboards may aggregate across tenants but must not expose tenant-sensitive details unless the viewer has Platform Super Admin permissions.

Metrics tags:

- `tenant_id`
- `plan`
- `environment`
- `service`
- `route`
- `job_type`
- `status`

## Alerting

Alert on:

- API error rate spike.
- Face-service failures.
- Attendance failure anomaly by tenant.
- Cross-tenant access denial spikes.
- Payroll job failures.
- Report export backlog.
- Storage quota breaches.
- Suspended tenant login attempts.
- Database latency.
- Worker queue backlog.

