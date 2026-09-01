# RBAC Matrix

## Scope

This matrix documents the Foundation, Employee Completion, Attendance Engine Core, GPS/Geofence Verification Layer, Face Biometric Trust Layer, and Leave Management System scope. Authorization is enforced server-side by permission codes on API endpoints. Frontend screens may hide actions for usability, but the client is never trusted as an authorization boundary.

## Roles

| Role | Purpose |
| --- | --- |
| Platform Super Admin | Operates SaaS tenant lifecycle and platform-level administration. |
| Tenant Owner | Highest tenant authority, including settings, branding, roles, users, employees, attendance, locations, biometrics, leave policies, exports, and audit review. |
| Tenant Admin | Tenant operator with broad administrative access except owner-only commercial controls reserved for later billing integration. |
| HR Admin | HR operator for users, employees, departments, designations, documents, attendance, locations, biometrics enrollment review, leave management, approvals, corrections, imports, exports, and audit review. |
| Manager | Manager view access for dashboard, employees, departments, designations, team attendance, location overrides, attendance corrections, and team leave approvals. |
| Employee | Employee self-service read/create access for dashboard, own employee context, documents, self check-in/out, face enrollment, attendance corrections, and leave requests. |

## Permission Catalog

| Permission | Resource | Action |
| --- | --- | --- |
| tenant.dashboard.read | Tenant Dashboard | View |
| tenant.settings.read | Tenant Settings | View |
| tenant.settings.update | Tenant Settings | Update |
| tenant.branding.read | Tenant Branding | View |
| tenant.branding.update | Tenant Branding | Update |
| tenant.features.read | Feature Flags | View |
| tenant.features.update | Feature Flags | Update |
| tenant.domains.read | Tenant Domains | View |
| tenant.domains.update | Tenant Domains | Create/Update |
| roles.read | Roles | View |
| roles.create | Roles | Create |
| roles.update | Roles | Update |
| permissions.read | Permissions | View |
| users.read | Users | View |
| users.invite | Users | Invite |
| users.update | Users | Update / Assign Roles |
| users.deactivate | Users | Deactivate / Suspend |
| users.reset_access | Sessions | Revoke Sessions |
| employees.read | Employees | View / Search / Timeline |
| employees.create | Employees | Create |
| employees.update | Employees | Update Profile |
| employees.status.update | Employee Status | Transition |
| employees.archive | Employees | Archive |
| employees.import | Employee Import | Preview / Commit |
| employees.export | Employee Export | Export |
| employees.bulk.update | Employee Bulk Actions | Assign / Archive / Status |
| departments.read | Departments | View |
| departments.create | Departments | Create |
| departments.update | Departments | Update |
| designations.read | Designations | View |
| designations.create | Designations | Create |
| designations.update | Designations | Update |
| documents.read | Documents | View Metadata |
| documents.metadata.create | Documents | Create Metadata |
| documents.metadata.update | Documents | Update Metadata |
| documents.archive | Documents | Archive Metadata |
| attendance.view | Attendance | View Records / History / Timeline / Dashboards |
| attendance.create | Attendance | Check-in / Check-out / Manual Attendance |
| attendance.update | Attendance | Adjust Attendance Records / Rules |
| attendance.correct | Attendance Corrections | Submit Correction Requests |
| attendance.approve | Attendance Corrections | Approve / Reject Correction Requests |
| attendance.export | Attendance Export | Export Attendance Records |
| location.view | Locations | View Locations, Assignments & Verification Logs |
| location.create | Locations | Create New Work Location |
| location.update | Locations | Update Location Details & Perimeter Radius |
| location.assign | Locations | Assign Employees / Departments to Locations |
| location.override | Locations | Authorize Geofence Manual Override |
| location.audit | Locations | View Location Verification Audits |
| face.view | Biometrics | View Face Profile Status & Verification History |
| face.enroll | Biometrics | Submit Face Image for Enrollment / Re-enrollment |
| face.verify | Biometrics | Perform Liveness & Face Match Verification |
| face.manage | Biometrics | Review / Approve / Reject Enrollments & Disable Profiles |
| face.audit | Biometrics | View Biometric Verification & Spoof Audits |
| leave.view | Leaves | View Leave Balances, Requests, Calendar & Policies |
| leave.create | Leaves | Submit Leave Request |
| leave.approve | Leaves | Approve / Reject Leave Requests (Manager & HR) |
| leave.cancel | Leaves | Cancel Own / Employee Leave Requests |
| leave.manage | Leaves | Configure Leave Types, Policies, Accrual Rules & Balances |
| leave.audit | Leaves | View Complete Leave Audit Trail & Approvals Queue |
| audit.read | Audit Logs | View Tenant Audit |
| platform.tenants.read | Platform Tenants | View |
| platform.tenants.create | Platform Tenants | Create |
| platform.tenants.update | Platform Tenants | Update |
| platform.tenants.status | Platform Tenants | Suspend / Activate / Archive |
| platform.audit.read | Platform Audit | View |

## Role Permission Matrix

| Permission | Owner | Tenant Admin | HR Admin | Manager | Employee |
| --- | --- | --- | --- | --- | --- |
| tenant.dashboard.read | Yes | Yes | Yes | Yes | Yes |
| tenant.settings.read | Yes | Yes | No | No | No |
| tenant.settings.update | Yes | Yes | No | No | No |
| tenant.branding.read | Yes | Yes | No | No | No |
| tenant.branding.update | Yes | Yes | No | No | No |
| tenant.features.read | Yes | Yes | No | No | No |
| tenant.features.update | Yes | No | No | No | No |
| tenant.domains.read | Yes | Yes | No | No | No |
| tenant.domains.update | Yes | No | No | No | No |
| roles.read | Yes | Yes | No | No | No |
| roles.create | Yes | No | No | No | No |
| roles.update | Yes | No | No | No | No |
| permissions.read | Yes | Yes | No | No | No |
| users.read | Yes | Yes | Yes | No | No |
| users.invite | Yes | Yes | Yes | No | No |
| users.update | Yes | Yes | No | No | No |
| users.deactivate | Yes | Yes | No | No | No |
| users.reset_access | Yes | Yes | No | No | No |
| employees.read | Yes | Yes | Yes | Yes | Yes |
| employees.create | Yes | Yes | Yes | No | No |
| employees.update | Yes | Yes | Yes | No | No |
| employees.status.update | Yes | Yes | Yes | No | No |
| employees.archive | Yes | Yes | Yes | No | No |
| employees.import | Yes | Yes | Yes | No | No |
| employees.export | Yes | Yes | Yes | No | No |
| employees.bulk.update | Yes | Yes | Yes | No | No |
| departments.read | Yes | Yes | Yes | Yes | No |
| departments.create | Yes | Yes | Yes | No | No |
| departments.update | Yes | Yes | Yes | No | No |
| designations.read | Yes | Yes | Yes | Yes | No |
| designations.create | Yes | Yes | Yes | No | No |
| designations.update | Yes | Yes | Yes | No | No |
| documents.read | Yes | Yes | Yes | No | Yes |
| documents.metadata.create | Yes | Yes | Yes | No | No |
| documents.metadata.update | Yes | Yes | Yes | No | No |
| documents.archive | Yes | Yes | Yes | No | No |
| attendance.view | Yes | Yes | Yes | Yes | Yes |
| attendance.create | Yes | Yes | Yes | No | Yes |
| attendance.update | Yes | Yes | Yes | No | No |
| attendance.correct | Yes | Yes | Yes | Yes | Yes |
| attendance.approve | Yes | Yes | Yes | Yes | No |
| attendance.export | Yes | Yes | Yes | No | No |
| location.view | Yes | Yes | Yes | Yes | Yes |
| location.create | Yes | Yes | Yes | No | No |
| location.update | Yes | Yes | Yes | No | No |
| location.assign | Yes | Yes | Yes | No | No |
| location.override | Yes | Yes | Yes | Yes | No |
| location.audit | Yes | Yes | Yes | No | No |
| face.view | Yes | Yes | Yes | Yes | Yes |
| face.enroll | Yes | Yes | Yes | No | Yes |
| face.verify | Yes | Yes | Yes | Yes | Yes |
| face.manage | Yes | Yes | Yes | No | No |
| face.audit | Yes | Yes | Yes | No | No |
| leave.view | Yes | Yes | Yes | Yes | Yes |
| leave.create | Yes | Yes | Yes | Yes | Yes |
| leave.approve | Yes | Yes | Yes | Yes | No |
| leave.cancel | Yes | Yes | Yes | Yes | Yes |
| leave.manage | Yes | Yes | Yes | No | No |
| leave.audit | Yes | Yes | Yes | No | No |
| compensation.view | Yes | Yes | Yes | Yes | Yes |
| compensation.manage | Yes | Yes | Yes | No | No |
| compensation.audit | Yes | Yes | Yes | No | No |
| payroll.view | Yes | Yes | Yes | Yes | Yes |
| payroll.generate | Yes | Yes | Yes | No | No |
| payroll.approve | Yes | Yes | Yes | No | No |
| payroll.lock | Yes | Yes | Yes | No | No |
| payroll.audit | Yes | Yes | Yes | No | No |
| payslip.view | Yes | Yes | Yes | Yes | Yes |
| payslip.generate | Yes | Yes | Yes | No | No |
| payslip.distribute | Yes | Yes | Yes | No | No |
| payslip.audit | Yes | Yes | Yes | No | No |
| compliance.view | Yes | Yes | Yes | Yes | Yes |
| compliance.manage | Yes | Yes | Yes | No | No |
| compliance.report | Yes | Yes | Yes | Yes | No |
| compliance.audit | Yes | Yes | Yes | No | No |
| analytics.view | Yes | Yes | Yes | Yes | Yes |
| analytics.manage | Yes | Yes | Yes | No | No |
| reports.view | Yes | Yes | Yes | Yes | No |
| reports.create | Yes | Yes | Yes | No | No |
| reports.export | Yes | Yes | Yes | Yes | No |
| reports.schedule | Yes | Yes | Yes | No | No |
| reports.audit | Yes | Yes | Yes | No | No |
| audit.read | Yes | Yes | Yes | No | No |

## Endpoint Matrix

| Endpoint | Permission |
| --- | --- |
| GET /api/v1/leaves/types | leave.view |
| POST /api/v1/leaves/types | leave.manage |
| GET /api/v1/leaves/policies | leave.view |
| POST /api/v1/leaves/policies | leave.manage |
| PATCH /api/v1/leaves/policies/:id | leave.manage |
| GET /api/v1/leaves/balances/me | leave.view |
| GET /api/v1/leaves/balances/:employeeId | leave.view |
| POST /api/v1/leaves/balances/adjust | leave.manage |
| POST /api/v1/leaves/requests | leave.create |
| GET /api/v1/leaves/requests/me | leave.view |
| GET /api/v1/leaves/requests | leave.view |
| GET /api/v1/leaves/requests/:id | leave.view |
| POST /api/v1/leaves/requests/:id/approve | leave.approve |
| POST /api/v1/leaves/requests/:id/reject | leave.approve |
| POST /api/v1/leaves/requests/:id/cancel | leave.cancel |
| GET /api/v1/leaves/calendar | leave.view |
| GET /api/v1/leaves/holidays | leave.view |
| POST /api/v1/leaves/holidays | leave.manage |
| DELETE /api/v1/leaves/holidays/:id | leave.manage |
| GET /api/v1/leaves/audit | leave.audit |
| GET /api/v1/compensation/components | compensation.view |
| POST /api/v1/compensation/components | compensation.manage |
| PATCH /api/v1/compensation/components/:id | compensation.manage |
| GET /api/v1/compensation/templates | compensation.view |
| POST /api/v1/compensation/templates | compensation.manage |
| PATCH /api/v1/compensation/templates/:id | compensation.manage |
| GET /api/v1/compensation/all | compensation.view |
| GET /api/v1/compensation/me | compensation.view |
| GET /api/v1/compensation/employees/:employeeId | compensation.view |
| POST /api/v1/compensation/employees/:employeeId/assign | compensation.manage |
| POST /api/v1/compensation/employees/:employeeId/revise | compensation.manage |
| GET /api/v1/compensation/history/:employeeId | compensation.view |
| GET /api/v1/compensation/audit | compensation.audit |
| POST /api/v1/payroll/runs | payroll.generate |
| GET /api/v1/payroll/runs | payroll.view |
| GET /api/v1/payroll/runs/latest | payroll.view |
| GET /api/v1/payroll/runs/:id | payroll.view |
| POST /api/v1/payroll/runs/:id/recalculate | payroll.generate |
| POST /api/v1/payroll/runs/:id/adjustments | payroll.generate |
| DELETE /api/v1/payroll/runs/:id/adjustments/:adjustmentId | payroll.generate |
| POST /api/v1/payroll/runs/:id/approve | payroll.approve |

## Task 24 Finance, Accounting, Banking & ERP Addendum

Accounting authorization is enforced server-side by the `AccountingController` under `/api/v1/finance`. Tenant Owner, Tenant Admin, and HR Admin receive the accounting finance permission set. Manager and Employee roles do not receive accounting administration permissions by default.

| Permission | Resource | Action |
| --- | --- | --- |
| finance.accounts.view | Chart of Accounts | View account tree |
| finance.accounts.manage | Chart of Accounts | Create, update, deactivate accounts and groups |
| finance.gl.view | General Ledger | View posted ledger entries and journal source records |
| finance.gl.post | General Ledger | Post accounting transactions |
| finance.journal.view | Journals and Periods | View manual journals and accounting periods |
| finance.journal.manage | Journals and Periods | Create journals and periods |
| finance.journal.approve | Journals and Periods | Approve, post, reverse journals; lock/unlock periods |
| finance.bank.view | Banking | View bank accounts, statements, transactions, reconciliation |
| finance.bank.manage | Banking | Create accounts, upload statements, run reconciliation |
| finance.vendor.view | Vendors | View vendor masters and analytics |
| finance.vendor.manage | Vendors | Create/update vendor master records |
| finance.payable.view | Accounts Payable | View vendor invoices and outstanding balances |
| finance.payable.manage | Accounts Payable | Create vendor invoices and payments |
| finance.receivable.view | Accounts Receivable | View customer invoices, payments, ageing |
| finance.receivable.manage | Accounts Receivable | Create customer invoices and payments |
| finance.tax.view | Tax Ledger | View GST/TDS summaries |
| finance.tax.manage | Tax Ledger | Calculate GST returns and tax ledger records |
| finance.erp.view | ERP Integrations | View ERP sync configuration and jobs |
| finance.erp.manage | ERP Integrations | Create integrations and queue sync jobs |
| finance.report.view | Finance Intelligence | View finance intelligence KPIs |
| finance.report.export | Financial Reports | Export accounting statements and registers |

| Endpoint | Permission |
| --- | --- |
| GET /api/v1/finance/accounts | finance.accounts.view |
| POST /api/v1/finance/account-groups | finance.accounts.manage |
| POST /api/v1/finance/accounts | finance.accounts.manage |
| PATCH /api/v1/finance/accounts/:id | finance.accounts.manage |
| DELETE /api/v1/finance/accounts/:id | finance.accounts.manage |
| GET /api/v1/finance/gl | finance.gl.view |
| GET /api/v1/finance/journals | finance.journal.view |
| POST /api/v1/finance/journals | finance.journal.manage |
| POST /api/v1/finance/journals/:id/status | finance.journal.approve |
| GET /api/v1/finance/periods | finance.journal.view |
| POST /api/v1/finance/periods | finance.journal.manage |
| POST /api/v1/finance/periods/:id/status | finance.journal.approve |
| GET /api/v1/finance/banks | finance.bank.view |
| POST /api/v1/finance/banks | finance.bank.manage |
| POST /api/v1/finance/banks/statements | finance.bank.manage |
| POST /api/v1/finance/reconciliation/run | finance.bank.manage |
| GET /api/v1/finance/vendors | finance.vendor.view |
| POST /api/v1/finance/vendors | finance.vendor.manage |
| GET /api/v1/finance/payables | finance.payable.view |
| POST /api/v1/finance/payables | finance.payable.manage |
| POST /api/v1/finance/payables/payments | finance.payable.manage |
| GET /api/v1/finance/receivables | finance.receivable.view |
| POST /api/v1/finance/customers | finance.receivable.manage |
| POST /api/v1/finance/receivables | finance.receivable.manage |
| POST /api/v1/finance/receivables/payments | finance.receivable.manage |
| GET /api/v1/finance/invoices | finance.receivable.view |
| POST /api/v1/finance/gst/returns | finance.tax.manage |
| GET /api/v1/finance/taxes | finance.tax.view |
| POST /api/v1/finance/erp | finance.erp.manage |
| POST /api/v1/finance/erp/sync | finance.erp.manage |
| POST /api/v1/finance/accounting/reports/export | finance.report.export |
| GET /api/v1/finance/intelligence | finance.report.view |

| Screen | Required Permission |
| --- | --- |
| /finance/accounts | finance.accounts.view |
| /finance/gl | finance.gl.view |
| /finance/journals | finance.journal.view |
| /finance/periods | finance.journal.view |
| /finance/banks | finance.bank.view |
| /finance/reconciliation | finance.bank.view |
| /finance/vendors | finance.vendor.view |
| /finance/payables | finance.payable.view |
| /finance/receivables | finance.receivable.view |
| /finance/invoices | finance.receivable.view |
| /finance/gst | finance.tax.view |
| /finance/taxes | finance.tax.view |
| /finance/erp | finance.erp.view |
| /admin/finance-intelligence | finance.report.view |
| POST /api/v1/payroll/runs/:id/lock | payroll.lock |
| POST /api/v1/payroll/runs/:id/cancel | payroll.generate |
| GET /api/v1/payroll/employees/:payrollRunEmployeeId | payroll.view |
| GET /api/v1/payroll/me | payroll.view |
| GET /api/v1/payroll/audit | payroll.audit |
| POST /api/v1/payslips/generate/run/:payrollRunId | payslip.generate |
| POST /api/v1/payslips/generate/employee/:payrollRunEmployeeId | payslip.generate |
| POST /api/v1/payslips/distribute | payslip.distribute |
| GET /api/v1/payslips | payslip.view |
| GET /api/v1/payslips/me | payslip.view |
| GET /api/v1/payslips/:id | payslip.view |
| GET /api/v1/payslips/:id/download | payslip.view |
| GET /api/v1/payslips/distributions | payslip.distribute |
| GET /api/v1/payslips/audit | payslip.audit |
| GET /api/v1/compliance/rules | compliance.view |
| POST /api/v1/compliance/rules | compliance.manage |
| POST /api/v1/compliance/rules/:id/versions | compliance.manage |
| POST /api/v1/compliance/calculate/preview | compliance.view |
| GET /api/v1/compliance/snapshots | compliance.view |
| GET /api/v1/compliance/snapshots/runs/:runId | compliance.view |
| POST /api/v1/compliance/snapshots/freeze/:runId | compliance.manage |
| GET /api/v1/compliance/reports/summary | compliance.report |
| GET /api/v1/compliance/reports/pf | compliance.report |
| GET /api/v1/compliance/reports/esi | compliance.report |
| GET /api/v1/compliance/reports/pt | compliance.report |
| GET /api/v1/compliance/reports/tds | compliance.report |
| GET /api/v1/compliance/audit | compliance.audit |
| GET /api/v1/analytics/overview | analytics.view |
| GET /api/v1/analytics/executive | analytics.view |
| GET /api/v1/analytics/workforce | analytics.view |
| GET /api/v1/analytics/attendance | analytics.view |
| GET /api/v1/analytics/leaves | analytics.view |
| GET /api/v1/analytics/leave | analytics.view |
| GET /api/v1/analytics/payroll | analytics.view |
| GET /api/v1/analytics/compliance | analytics.view |
| GET /api/v1/analytics/face | analytics.view |
| GET /api/v1/analytics/organization | analytics.view |
| GET /api/v1/analytics/employees | analytics.view |
| GET /api/v1/analytics/reports/definitions | reports.view |
| GET /api/v1/analytics/reports/saved | reports.view |
| POST /api/v1/analytics/reports/saved | reports.create |
| POST /api/v1/analytics/reports/execute | reports.view |
| POST /api/v1/analytics/reports/export | reports.export |
| GET /api/v1/analytics/reports/schedules | reports.schedule |
| POST /api/v1/analytics/reports/schedules | reports.schedule |
| POST /api/v1/analytics/reports/schedules/:id/run | reports.schedule |
| GET /api/v1/analytics/reports | reports.view |
| POST /api/v1/analytics/reports | reports.create |
| GET /api/v1/analytics/reports/:id | reports.view |
| PUT /api/v1/analytics/reports/:id | reports.create |
| GET /api/v1/analytics/dashboards | dashboard.view |
| POST /api/v1/analytics/dashboards | dashboard.manage |
| GET /api/v1/analytics/dashboards/:id | dashboard.view |
| PUT /api/v1/analytics/dashboards/:id | dashboard.manage |
| DELETE /api/v1/analytics/dashboards/:id | dashboard.manage |
| GET /api/v1/analytics/widgets | analytics.view, dashboard.view |
| PUT /api/v1/analytics/widgets | analytics.manage, dashboard.manage |
| GET /api/v1/analytics/audit | reports.audit |
| GET /api/v1/notifications/me | notifications.view |
| POST /api/v1/notifications/me/read/:id | notifications.view |
| POST /api/v1/notifications/me/read-all | notifications.view |
| GET /api/v1/notifications/me/unread-count | notifications.view |
| GET /api/v1/notifications/preferences | notifications.view |
| PUT /api/v1/notifications/preferences | notifications.view |
| POST /api/v1/notifications/send | notifications.send |
| GET /api/v1/notifications/templates | notifications.manage |
| POST /api/v1/notifications/templates | notifications.manage |
| PUT /api/v1/notifications/templates/:id | notifications.manage |
| GET /api/v1/workflows/definitions | workflows.view |
| POST /api/v1/workflows/definitions | workflows.manage |
| GET /api/v1/workflows/definitions/:id | workflows.view |
| POST /api/v1/workflows/start | workflows.create |
| GET /api/v1/workflows/instances | workflows.view |
| GET /api/v1/workflows/me | workflows.view |
| GET /api/v1/workflows/instances/:id | workflows.view |
| POST /api/v1/workflows/instances/:id/advance | workflows.action |
| POST /api/v1/workflows/instances/:id/delegate | workflows.action |
| POST /api/v1/workflows/instances/:id/escalate | workflows.manage |
| GET /api/v1/workflows/instances/:id/audit | workflows.audit |
| GET /api/v1/approvals/templates | approvals.view |
| POST /api/v1/approvals/templates | approvals.manage |
| GET /api/v1/approvals/templates/:id | approvals.view |
| GET /api/v1/approvals/requests | approvals.view |
| POST /api/v1/approvals/submit | approvals.create |
| GET /api/v1/approvals/me | approvals.view |
| GET /api/v1/approvals/requests/:id | approvals.view |
| POST /api/v1/approvals/requests/:id/approve | approvals.action |
| POST /api/v1/approvals/requests/:id/reject | approvals.action |
| POST /api/v1/approvals/requests/:id/delegate | approvals.action |
| GET /api/v1/organization/business-units | organization.view |
| POST /api/v1/organization/business-units | organization.manage |
| GET /api/v1/organization/business-units/:id | organization.view |
| PATCH /api/v1/organization/business-units/:id | organization.manage |
| DELETE /api/v1/organization/business-units/:id | organization.manage |
| GET /api/v1/organization/regions | organization.view |
| POST /api/v1/organization/regions | organization.manage |
| GET /api/v1/organization/regions/:id | organization.view |
| PATCH /api/v1/organization/regions/:id | organization.manage |
| DELETE /api/v1/organization/regions/:id | organization.manage |
| GET /api/v1/organization/teams | organization.view |
| POST /api/v1/organization/teams | organization.manage |
| GET /api/v1/organization/teams/:id | organization.view |
| PATCH /api/v1/organization/teams/:id | organization.manage |
| DELETE /api/v1/organization/teams/:id | organization.manage |
| GET /api/v1/organization/tree | organization.view |
| GET /api/v1/organization/reporting-chain/:employeeId | organization.view |
| PUT /api/v1/organization/reporting-manager | organization.manage |
| PUT /api/v1/organization/employees/:employeeId/assignment | organization.manage |
| GET /api/v1/security/alerts | security.view |
| POST /api/v1/security/alerts/:id/resolve | security.manage |
| GET /api/v1/security/metrics | security.view |
| GET /api/v1/profile | profile.view |
| PUT /api/v1/profile | profile.update |
| GET /api/v1/documents | documents.view |
| POST /api/v1/documents | documents.upload |
| GET /api/v1/documents/:id/download | documents.view |
| PATCH /api/v1/documents/:id/verify | documents.verify |
| DELETE /api/v1/documents/:id | documents.upload, documents.verify |
| GET /api/v1/requests | requests.view |
| POST /api/v1/requests | requests.create |
| GET /api/v1/requests/:id | requests.view |
| POST /api/v1/requests/:id/approve | requests.manage |
| POST /api/v1/requests/:id/reject | requests.manage |
| POST /api/v1/requests/:id/cancel | requests.create |
| GET /api/v1/announcements | announcements.view |
| POST /api/v1/announcements | announcements.manage |
| POST /api/v1/announcements/:id/acknowledge | announcements.acknowledge |
| DELETE /api/v1/announcements/:id | announcements.manage |
| GET /api/v1/directory | directory.view |
| GET /api/v1/id-card | idcard.view |
| GET /api/v1/id-card/download | idcard.view |
| GET /api/v1/ess/dashboard | profile.view |

## Screen Matrix

| Screen | Permissions |
| --- | --- |
| Leave Dashboard | leave.view, leave.create |
| Leave Request Form | leave.create |
| Leave Balance Ledger | leave.view |
| Team & Holiday Calendar | leave.view |
| Leave Policies Manager | leave.manage |
| Leave Approvals & Audit | leave.approve, leave.audit |
| Compensation Directory | compensation.view |
| Compensation Templates & Components | compensation.manage |
| Compensation Revision History | compensation.view |
| Compensation Audit Center | compensation.audit |
| Payroll Dashboard | payroll.view |
| Payroll Run Workbench | payroll.view, payroll.generate, payroll.approve, payroll.lock |
| Payroll Run History | payroll.view |
| Employee Paysheet View | payroll.view |
| Payroll Audit Trail | payroll.audit |
| Employee Payslips Portal | payslip.view |
| Employee Payslip Viewer | payslip.view |
| Admin Payslip Manager | payslip.view, payslip.generate |
| Payslip Distribution Monitor | payslip.distribute |
| Payslip Audit Center | payslip.audit |
| Statutory Compliance Dashboard | compliance.view |
| Versioned Rules & State Slabs | compliance.view, compliance.manage |
| Compliance Snapshot Explorer | compliance.view |
| Statutory Compliance Reports | compliance.report |
| Compliance Audit Center | compliance.audit |
| Executive Analytics Dashboard | analytics.view |
| Workforce Trends & Span of Control | analytics.view |
| Attendance Trends & Heatmaps | analytics.view |
| Leave Utilization & Seasonality | analytics.view |
| Payroll Cost & Band Analytics | analytics.view |
| Statutory Compliance Intelligence | analytics.view |
| Face Biometrics & Spoof Telemetry | analytics.view |
| Organization Structure Analytics | analytics.view |
| Reports Catalog & Hub | reports.view |
| Custom Interactive Report Builder | reports.create, reports.export |
| Saved & Shared Reports Manager | reports.view, reports.create |
| Scheduled Reports Automation Center | reports.schedule |
| Drag-and-Drop Dashboard Designer | dashboard.view, dashboard.manage |
| Analytics & Reports Audit Center | reports.audit |
| Notification Center | notifications.view |
| Notification Template Manager | notifications.manage |
| Workflow Dashboard & Tasks | workflows.view, workflows.action |
| Workflow Definition Designer | workflows.manage |
| Approvals Inbox | approvals.view, approvals.action |
| Approval Template Manager | approvals.manage |
| Enterprise Organization Hierarchy | organization.view |
| Business Unit Directory | organization.view, organization.manage |
| Functional Team Directory | organization.view, organization.manage |
| System Health & Queue Monitor | platform.admin |
| Security Threat & Anomaly Dashboard | security.view, security.manage |
| Employee Self-Service Dashboard | profile.view |
| Employee Profile Center | profile.view, profile.update |
| Edit Profile & Change Requests | profile.update |
| Document Vault & Repository | documents.view, documents.upload |
| Document Viewer & Verification | documents.view |
| Employee Request Tracker | requests.view, requests.create |
| Submit New Request Wizard | requests.create |
| Request Detail & Approval Chain | requests.view |
| Announcements & Communications | announcements.view, announcements.acknowledge |
| Announcement Reader | announcements.view |
| Digital Identity Card | idcard.view |
| Organization & Employee Directory | directory.view |
| PWA & Offline Workplace Settings | profile.view |
| AI Copilot & Conversational HR Chat | ai.chat |
| AI Conversation History | ai.chat |
| Company Knowledge Base & Policy Search | ai.knowledge.read |
| Executive AI Intelligence & Predictions | ai.prediction.read, ai.insights.read |
| AI Settings & Model Controls | ai.settings.manage |

### Task 19 AI API Endpoints
| Endpoint | Permission Required |
|---|---|
| POST /api/v1/ai/chat | ai.chat |
| GET /api/v1/ai/conversations | ai.chat |
| GET /api/v1/ai/conversations/:id | ai.chat |
| DELETE /api/v1/ai/conversations/:id | ai.chat |
| POST /api/v1/ai/knowledge/upload | ai.knowledge.manage |
| GET /api/v1/ai/knowledge | ai.knowledge.read |
| GET /api/v1/ai/knowledge/:id | ai.knowledge.read |
| DELETE /api/v1/ai/knowledge/:id | ai.knowledge.manage |
| POST /api/v1/ai/knowledge/search | ai.knowledge.read |
| GET /api/v1/ai/predictions/workforce | ai.prediction.read |
| GET /api/v1/ai/predictions/employee/:employeeId | ai.prediction.read |
| GET /api/v1/ai/insights | ai.insights.read |
| POST /api/v1/ai/insights/:id/dismiss | ai.insights.read |
| POST /api/v1/ai/documents/extract | ai.documents.extract |
| POST /api/v1/ai/reports/nl-generate | ai.reports.generate |
| GET /api/v1/ai/executive/summary | ai.prediction.read, ai.insights.read |
| GET /api/v1/ai/settings | ai.settings.manage |
| PUT /api/v1/ai/settings | ai.settings.manage |

### Task 20 Recruitment, ATS & Public Careers Endpoints
| Endpoint | Permission Required | Notes |
|---|---|---|
| GET /api/v1/public/careers/jobs | *None (Public)* | Scoped to tenant subdomain/param |
| GET /api/v1/public/careers/jobs/:slug | *None (Public)* | View public job posting |
| POST /api/v1/public/careers/apply | *None (Public)* | Candidate application submission |
| GET /api/v1/public/careers/applications/:code/status | *None (Public)* | Candidate self-service tracking |
| POST /api/v1/public/careers/offers/:code/decision | *None (Public)* | Candidate offer accept/reject |
| POST /api/v1/public/careers/preboarding/upload | *None (Public)* | Candidate document submission |
| GET /api/v1/recruitment/hiring-requests | recruitment.read | List workforce hiring requests |
| POST /api/v1/recruitment/hiring-requests | recruitment.manage | Create vacancy request |
| POST /api/v1/recruitment/hiring-requests/:id/approve | recruitment.manage | Multi-stage request approval |
| GET /api/v1/recruitment/requisitions | recruitment.read | List job requisitions |
| POST /api/v1/recruitment/requisitions | recruitment.manage | Create job requisition |
| POST /api/v1/recruitment/requisitions/:id/publish | recruitment.manage | Publish job requisition to careers |
| GET /api/v1/recruitment/candidates | candidates.read | Candidate list & search |
| POST /api/v1/recruitment/candidates | candidates.create | Add candidate |
| GET /api/v1/recruitment/candidates/:id | candidates.read | Candidate profile detail |
| GET /api/v1/recruitment/applications | applications.read | List applications & stages |
| PUT /api/v1/recruitment/applications/:id/stage | applications.manage | Advance ATS Kanban stage |
| POST /api/v1/recruitment/interviews/schedule | interviews.schedule | Schedule round & panel |
| POST /api/v1/recruitment/interviews/feedback | interviews.feedback | Submit evaluation scorecard |
| GET /api/v1/recruitment/offers | offers.read | List offer letters |
| POST /api/v1/recruitment/offers | offers.create | Generate offer letter |
| POST /api/v1/recruitment/offers/:id/approve | offers.manage | Multi-level offer approval |
| POST /api/v1/recruitment/offers/:id/release | offers.manage | Dispatch offer letter to candidate |
| GET /api/v1/recruitment/preboarding | preboarding.read | List preboarding checklists |
| POST /api/v1/recruitment/preboarding/:id/verify | preboarding.manage | Verify candidate documents |
| POST /api/v1/recruitment/candidates/:id/onboard | recruitment.manage | Atomic onboarding to Employee |
| GET /api/v1/recruitment/analytics | recruitment.read | Executive & Recruiter ATS KPIs |
| GET /api/v1/recruitment/ai-intelligence | recruitment.read | AI hiring risk & decline forecasting |

### Task 21 Performance Management System (PMS), OKRs, KRAs & Appraisals Endpoints
| Endpoint | Permission Required | Notes |
|---|---|---|
| GET /api/v1/performance/goal-cycles | performance.view | List quarterly/annual goal cycles |
| POST /api/v1/performance/goal-cycles | performance.manage | Create goal cycle |
| PUT /api/v1/performance/goal-cycles/:id/status | performance.manage | Lock, activate, or close goal cycle |
| GET /api/v1/performance/goals | performance.view | List employee goals & OKRs |
| POST /api/v1/performance/goals | performance.view | Create OKR / KRA goal |
| GET /api/v1/performance/goals/:id | performance.view | Get goal details, key results & evidence |
| PUT /api/v1/performance/goals/:id | performance.view | Update goal progress & evidence |
| POST /api/v1/performance/goals/:id/approve | performance.manage | Manager approve/reject goal |
| POST /api/v1/performance/goals/:id/key-results | performance.view | Add key result to OKR |
| PUT /api/v1/performance/key-results/:id | performance.view | Update key result progress |
| GET /api/v1/performance/feedback | performance.view | List 360 feedback, spot awards, badges |
| POST /api/v1/performance/feedback | performance.view | Submit continuous peer/manager feedback |
| GET /api/v1/performance/1on1 | performance.view | List 1:1 meetings & history |
| POST /api/v1/performance/1on1 | performance.view | Schedule 1:1 meeting with agenda |
| PUT /api/v1/performance/1on1/:id | performance.view | Update 1:1 notes, action items & status |
| GET /api/v1/performance/review-cycles | performance.view | List appraisal review cycles |
| POST /api/v1/performance/review-cycles | performance.manage | Create appraisal cycle |
| PUT /api/v1/performance/review-cycles/:id/stage | performance.manage | Advance cycle stage (Self -> Manager -> Calibration) |
| GET /api/v1/performance/reviews | performance.view | List employee appraisal reviews |
| GET /api/v1/performance/reviews/:id | performance.view | Get 360 appraisal breakdown |
| POST /api/v1/performance/reviews/:id/self-assessment | performance.review | Submit self assessment & ratings |
| POST /api/v1/performance/reviews/:id/manager-review | performance.review | Submit manager evaluation |
| POST /api/v1/performance/reviews/:id/360-score | performance.review | Submit multi-rater 360 feedback score |
| GET /api/v1/performance/competencies | performance.view | List competency framework |
| POST /api/v1/performance/competencies | performance.manage | Create competency |
| GET /api/v1/performance/designation-competencies | performance.view | Competency matrix for designation |
| POST /api/v1/performance/designation-competencies | performance.manage | Map competencies to designation |
| GET /api/v1/performance/calibration | performance.calibration | List calibration sessions |
| POST /api/v1/performance/calibration | performance.calibration | Create calibration session |
| POST /api/v1/performance/calibration/:id/adjust | performance.calibration | Adjust rating on bell curve |
| POST /api/v1/performance/calibration/:id/finalize | performance.calibration | Finalize bell curve calibration session |
| GET /api/v1/performance/salary-increments/rules | performance.manage | List salary increment matrix |
| POST /api/v1/performance/salary-increments/rules | performance.manage | Configure increment rules |
| GET /api/v1/performance/salary-increments/simulate | performance.manage | Simulate salary increments based on ratings |
| GET /api/v1/performance/promotions | performance.manage | List promotion recommendations |
| POST /api/v1/performance/promotions/evaluate | performance.manage | Evaluate promotion readiness score |
| POST /api/v1/performance/promotions/:id/approve | performance.manage | Approve promotion & compensation bump |
| GET /api/v1/performance/succession/positions | performance.succession | List critical succession roles |
| POST /api/v1/performance/succession/positions | performance.succession | Create succession position |
| GET /api/v1/performance/succession/9-box | performance.succession | Retrieve 9-box grid talent map |
| POST /api/v1/performance/succession/pool | performance.succession | Add employee to successor pool |
| GET /api/v1/performance/analytics | performance.analytics | Executive PMS KPIs & talent heatmaps |
| GET /api/v1/performance/ai-insights | performance.analytics | AI burnout risk, manager coaching tips & KRA suggestions |

### Operations, Assets, ITSM, Facilities & Exit Clearance (Task 22)
| Endpoint | Required Permission | Description |
| :--- | :--- | :--- |
| GET /api/v1/assets | assets.view | List assets with filtering and pagination |
| POST /api/v1/assets | assets.manage | Create hardware or IT asset |
| GET /api/v1/assets/:id | assets.view | Get asset details, history & book value |
| PUT /api/v1/assets/:id | assets.manage | Update asset details or status |
| POST /api/v1/assets/:id/assign | assets.manage | Assign asset to employee |
| POST /api/v1/assets/:id/transfer | assets.manage | Transfer asset between employees |
| POST /api/v1/assets/:id/return | assets.manage | Return asset to inventory |
| POST /api/v1/assets/bulk-assign | assets.manage | Bulk assign assets |
| GET /api/v1/assets/depreciation/calculate | assets.view | Calculate straight-line and WDV depreciation |
| GET /api/v1/assets/maintenance | assets.view | List maintenance, AMC and repairs |
| POST /api/v1/assets/maintenance | assets.manage | Schedule asset maintenance |
| GET /api/v1/assets/licenses | assets.view | List SaaS/software licenses and seats |
| POST /api/v1/assets/licenses | assets.manage | Create or update software license |
| POST /api/v1/assets/licenses/:id/assign | assets.manage | Assign license seat to employee |
| GET /api/v1/assets/inventory | inventory.view | List inventory items & stock levels |
| POST /api/v1/assets/inventory | inventory.manage | Add or update inventory item |
| POST /api/v1/assets/inventory/movement | inventory.manage | Record stock in / stock out / adjustment |
| GET /api/v1/helpdesk/tickets | helpdesk.view | List helpdesk tickets |
| POST /api/v1/helpdesk/tickets | helpdesk.view | Create helpdesk ticket |
| GET /api/v1/helpdesk/tickets/:id | helpdesk.view | Get ticket details and comments |
| PUT /api/v1/helpdesk/tickets/:id | helpdesk.manage | Update ticket status, priority or assignee |
| POST /api/v1/helpdesk/tickets/:id/comments | helpdesk.view | Add user comment or internal note |
| POST /api/v1/helpdesk/tickets/:id/resolve | helpdesk.manage | Mark ticket resolved with notes |
| GET /api/v1/helpdesk/sla/performance | helpdesk.view | Get SLA compliance & MTTR metrics |
| GET /api/v1/facilities | facilities.view | List facilities and meeting rooms |
| POST /api/v1/facilities | facilities.manage | Create facility resource |
| GET /api/v1/facilities/bookings | facilities.view | List meeting room bookings |
| POST /api/v1/facilities/bookings | facilities.view | Book meeting room or conference hall |
| GET /api/v1/facilities/desks | facilities.view | List office desks & zones |
| POST /api/v1/facilities/desks/allocate | facilities.manage | Allocate hot desk or dedicated seat |
| GET /api/v1/facilities/vehicles | facilities.view | List company vehicles & drivers |
| POST /api/v1/facilities/vehicles/book | facilities.view | Book company vehicle |
| GET /api/v1/visitor/visitors | visitor.view | List visitors and pre-registrations |
| POST /api/v1/visitor/pre-register | visitor.view | Pre-register visitor |
| POST /api/v1/visitor/check-in | visitor.manage | Check-in visitor & issue badge |
| POST /api/v1/visitor/check-out | visitor.manage | Check-out visitor |
| GET /api/v1/visitor/gate-passes | visitor.view | List gate passes |
| POST /api/v1/visitor/gate-passes | gatepass.manage | Request material/personnel gate pass |
| POST /api/v1/visitor/gate-passes/:id/approve | gatepass.manage | Approve gate pass |
| GET /api/v1/visitor/contractors | visitor.view | List contractor companies and worker passes |
| POST /api/v1/visitor/contractors | visitor.manage | Register contractor company & workers |
| GET /api/v1/clearance | clearance.manage | List employee exit clearance requests |
| POST /api/v1/clearance/initiate | clearance.manage | Initiate employee exit clearance workflow |
| POST /api/v1/clearance/tasks/:id/complete | clearance.manage | Sign off departmental clearance task |
| GET /api/v1/clearance/:id | clearance.manage | Get clearance status and checklist |
| GET /api/v1/operations/analytics | analytics.operations | Executive operations & asset intelligence dashboard |







