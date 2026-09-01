# Employee Create

## Purpose

Create a tenant employee with required workforce, contact, salary, and compliance information.

## Target User

Tenant Owner, Tenant Admin, HR Admin.

## Route

`/employees/new`

## Permissions

`employees.create`.

## Information Hierarchy

Basic details, employment details, contacts, salary profile, documents, face enrollment prompt.

## Layout

Sectioned form with progress sidebar on desktop and steps on mobile.

## Component Tree

Header, progress nav, form sections, validation summary, sticky action bar.

## Primary CTA

Create employee.

## Secondary Actions

Save draft, cancel.

## Data Requirements

Departments, designations, managers, salary rules, tenant policies.

## API Dependencies

- `POST /api/v1/employees`
- `GET /api/v1/locations`
- `GET /api/v1/salary-rules`

## States

- Loading: form metadata skeleton.
- Empty: no departments or designations; prompt setup.
- Error: validation and submit errors inline.
- Success: employee created; prompt next step.
- Disabled: submit disabled until required fields valid.
- Permission denied: no create permission.

## Responsive Behavior

Mobile stepper with sticky bottom action. Desktop two-column sections where useful.

## Keyboard Behavior

Logical tab order, Enter does not accidentally submit multi-section form.

## Accessibility Notes

Errors tied to fields; required fields explicit.

## Motion Behavior

Step transitions under 220ms.

## Analytics Events

`employee_create_viewed`, `employee_create_submitted`, `employee_created`.

## Security Considerations

Tenant ID is server-derived. Sensitive fields encrypted server-side.

