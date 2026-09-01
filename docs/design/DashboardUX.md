# Dashboard UX

## Principles

- Dashboards are operational command centers, not marketing pages.
- Key actions must be visible without scrolling on desktop.
- Mobile dashboards prioritize today's tasks.
- Data must be tenant-scoped.
- Empty and loading states must be production-ready.

## Admin Dashboard

Primary jobs:

- Understand workforce status today.
- Review exceptions.
- Approve pending work.
- Generate or review payroll.
- Export reports.

Top content:

- Present today.
- Absent today.
- Late today.
- Pending leaves.
- Attendance review.
- Payroll status.

Layout:

- Header with date, tenant name, and primary action.
- Metric row with 4 to 6 key metrics on desktop.
- Exception queue.
- Attendance trend chart.
- Payroll summary.
- Pending approvals.

Mobile:

- Today summary first.
- Exception queue second.
- Approvals third.
- Charts move lower.
- Use bottom navigation for primary modules.

## Employee Dashboard

Primary jobs:

- Check in or check out.
- See today's attendance.
- See working hours.
- Request leave.
- View salary estimate.
- Complete profile tasks.

Top content:

- Attendance action.
- Current attendance status.
- Working hours.
- Leave balance.
- Estimated salary.

## Manager Dashboard

Primary jobs:

- See team attendance.
- Approve leave.
- Review exceptions.
- Understand team availability.

Top content:

- Team present today.
- Team late today.
- Pending leave approvals.
- Attendance exceptions.

## Platform Dashboard

Platform Super Admin only.

Primary jobs:

- Monitor tenants.
- View platform health.
- Manage tenant lifecycle.
- Review usage and plan limits.
- Investigate incidents.

Top content:

- Active tenants.
- Suspended tenants.
- Trial tenants.
- Usage over limit.
- Error rates.
- Queue backlog.

## Dashboard Components

Use:

- Metric cards.
- Exception list.
- Approval queue.
- Trend chart.
- Activity timeline.
- Quick filters.
- Segmented date range controls.

Avoid:

- Decorative hero sections.
- Oversized brand panels.
- Low-value charts above critical tasks.
- Too many equal cards with no hierarchy.

## States

Loading:

- Skeletons match final layout.
- Avoid generic center spinners.

Empty:

- Explain what is empty and the next useful action.

Error:

- Show the failed region.
- Preserve other dashboard regions when possible.

Permission:

- Hide actions users cannot perform.
- Show permission messaging only when user navigates directly to restricted areas.

