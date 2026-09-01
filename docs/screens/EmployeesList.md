# Employees List

## Purpose

Find, filter, review, and manage tenant employees.

## Target User

Tenant Owner, Tenant Admin, HR Admin, Manager with team scope.

## Route

`/employees`

## Permissions

`employees.read`; create/edit actions require specific write permissions.

## Information Hierarchy

Search, filters, saved views, employee table/list, bulk actions, export.

## Layout

Desktop data table. Mobile searchable cards with filter sheet.

## Component Tree

Header, search, filters, saved views, employee table, bulk action bar, pagination, detail side panel.

## Primary CTA

Add employee.

## Secondary Actions

Import, export, filter, save view.

## Data Requirements

Employees, departments, designations, today attendance status.

## API Dependencies

- `GET /api/v1/employees`
- `GET /api/v1/reports/employees`
- `POST /api/v1/reports/exports`

## States

- Loading: table skeleton.
- Empty: no employees with add/import actions.
- Error: retry and preserve filters.
- Success: tenant employee list.
- Disabled: bulk actions disabled until rows selected.
- Permission denied: no employee read access.

## Responsive Behavior

Mobile cards with key fields and detail sheet. Desktop sticky table header.

## Keyboard Behavior

Search shortcut, table row navigation, multi-select with keyboard.

## Accessibility Notes

Table headers, sort state, and filters are announced.

## Motion Behavior

Filter changes transition without row-by-row animation.

## Analytics Events

`employees_list_viewed`, `employee_search_used`, `employee_export_clicked`.

## Security Considerations

Manager views are team-scoped; salary fields hidden unless permitted.

