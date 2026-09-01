# Component Library

## Principles

- Components are white-label capable.
- Components support light and dark mode.
- Components expose loading, empty, error, disabled, focus, hover, active, and selected states.
- Components use semantic state colors.
- Components are mobile-first and accessible.

## Foundation Components

### Button

Variants:

- Primary.
- Secondary.
- Ghost.
- Destructive.
- Success.
- Icon.

States:

- Default.
- Hover.
- Active.
- Focus visible.
- Disabled.
- Loading.

Rules:

- Primary label should be 1 to 3 words.
- Button text must not wrap on desktop.
- Icon buttons require accessible labels and tooltips for unfamiliar actions.
- Destructive buttons require confirmation for high-risk actions.

### Input

Types:

- Text.
- Email.
- Phone.
- Password.
- Number.
- Date.
- Time.
- Currency.

Rules:

- Label above input.
- Helper text below when needed.
- Error text below input.
- Placeholder is an example, never a label.
- Currency and numeric inputs use tabular numbers.

### Select And Combobox

Use select for short fixed options.

Use combobox for:

- Employees.
- Departments.
- Designations.
- Locations.
- Managers.

### Checkbox, Radio, Toggle

Use:

- Checkbox for multiple selections.
- Radio for mutually exclusive options.
- Toggle for immediate binary settings.

High-risk settings require confirmation after toggle.

### Tabs

Use for peer views within one page:

- Employee profile sections.
- Payroll run details.
- Tenant settings sections.

Do not use tabs for primary navigation.

### Badge

Status badges:

- Active.
- Suspended.
- Pending.
- Approved.
- Rejected.
- Needs review.
- Paid.
- Draft.

Badges use semantic colors and text, not color alone.

### Toast

Use for transient confirmation.

Do not use toast as the only error location for forms.

### Modal

Use for:

- Confirmation.
- Focused short forms.
- Critical warnings.

Do not use modal for long employee forms on mobile; use full-screen route or sheet.

### Drawer And Sheet

Use for:

- Filters.
- Row details.
- Mobile actions.
- Quick edit.

### Table

Use for desktop reports and payroll.

Required features:

- Sort.
- Filter.
- Search.
- Pagination.
- Column visibility.
- Loading skeleton.
- Empty state.
- Export action when permitted.

Mobile table alternative:

- List cards with key fields.
- Detail sheet.
- Filter sheet.

### Data Card

Used for dashboard metrics.

Required:

- Label.
- Value.
- Period or context.
- Trend where meaningful.
- Loading state.

### Timeline

Used for:

- Leave approval history.
- Attendance event history.
- Audit detail view.

### File Upload

Used for:

- Employee documents.
- Tenant logo.
- Attendance photos through controlled capture flow.

Required:

- File type validation.
- Size messaging.
- Upload progress.
- Error recovery.

## Domain Components

### Attendance Action

Primary mobile component for check-in and check-out.

Required states:

- Ready.
- Requesting location.
- Outside geo-fence.
- Camera permission needed.
- Capturing face.
- Verifying face.
- Success.
- Failed.
- Needs review.

### Employee Summary

Displays:

- Photo or initials.
- Name.
- Employee code.
- Department.
- Designation.
- Status.
- Attendance status today.

### Leave Request Card

Displays:

- Leave type.
- Dates.
- Total days.
- Current status.
- Current approver.
- Next action.

### Payroll Summary

Displays:

- Gross salary.
- Deductions.
- Net salary.
- Attendance impact.
- Status.

### Tenant Switcher

Only shown to users with multiple tenant memberships or Platform Super Admin support workflows.

Must make active tenant unmistakable.

