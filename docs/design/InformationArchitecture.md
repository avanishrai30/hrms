# Information Architecture

The product is organized around workforce jobs-to-be-done, not a flat inventory of routes.

## Primary Groups

- Home: role-aware workspace entry point
- People: employees, directory, organization, documents, profile, requests
- Time: attendance, corrections, leave, calendar, locations
- Payroll: payroll, compensation, payslips, compliance, finance, expenses, travel
- Talent: hiring, pipeline, performance, goals, reviews, succession, learning
- Workplace: assets, helpdesk, facilities, visitors, gate passes, fleet, clearance
- Analytics: analytics hub, executive insights, workforce, attendance, payroll, reports
- AI: copilot, assistant, insights, policy intelligence, history, automations
- Admin: tenant settings, branding, roles, users, integrations, SSO, audit, system health, security

## Role Awareness

Navigation visibility is derived from the existing `PermissionCode` model. Hiding navigation is not security; backend RBAC remains authoritative. The UI may expose broad employee-safe routes without permissions, but admin and sensitive operational routes require explicit permissions.

## Tenant Context

AIavro product identity stays stable across tenants. The active tenant appears as workspace context in the shell header and sidebar. VC Organics is Tenant #1 and should not replace the product name.
