# Employee UX

## Principles

- Employee profiles must be complete but not overwhelming.
- HR Admins need fast scanning and precise editing.
- Employees need confidence about attendance, leave, salary, and documents.
- Sensitive fields require clear permissions.

## Employee List

Desktop:

- Search.
- Department filter.
- Designation filter.
- Status filter.
- Attendance status today.
- Bulk actions when permitted.
- Export when permitted.

Mobile:

- Search first.
- Filter sheet.
- Employee cards.
- Tap to detail.

Employee row or card shows:

- Photo or initials.
- Full name.
- Employee code.
- Department.
- Designation.
- Status.
- Today attendance indicator.

## Employee Profile

Sections:

- Overview.
- Personal details.
- Employment.
- Attendance.
- Leave.
- Salary.
- Documents.
- Audit history where permitted.

Overview should show:

- Profile completeness.
- Current status.
- Manager.
- Department.
- Joining date.
- Today's attendance.

## Employee Create/Edit

Use stepped or sectioned forms:

1. Basic details.
2. Employment details.
3. Emergency contact.
4. Bank details.
5. Government IDs.
6. Documents.
7. Face enrollment.

Rules:

- Save progress for long admin forms where possible.
- Validate inline.
- Do not hide required fields in collapsed sections.
- Sensitive fields show masked values after save.

## Documents UX

Document list shows:

- Type.
- File name.
- Upload date.
- Verification state when applicable.
- Actions based on permission.

Upload:

- Drag and drop on desktop.
- Native picker on mobile.
- Show accepted types and size limit.
- Show progress.
- Show row-level errors.

## Face Enrollment UX

Face enrollment should feel secure and simple.

Steps:

- Explain camera requirement briefly.
- Capture face.
- Run quality check.
- Confirm enrollment success.

Do not present face enrollment as optional when tenant policy requires it for attendance.

## Salary View

Employee salary view shows:

- Current salary profile.
- Estimated salary for month.
- Attendance impact.
- Payslip or payroll history when available.

Sensitive salary information must require permission and tenant scope.

## Empty States

Employee list empty:

- Show create employee action for permitted HR users.
- Show import action when available.

Documents empty:

- Show upload action for permitted users.

Attendance empty:

- Explain no attendance records in selected period.

