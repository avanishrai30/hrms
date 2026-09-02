# AIavro Design System — Route Migration Map & Audit

## 1. Executive Summary & Design System Target

The AIavro controlled product-design migration establishes a unified, modern workforce operating system visual standard:
- **Canvas**: Pale lavender/cool neutral (`#F7F7FC` / `248 30% 98%`)
- **Primary**: Deep Royal Indigo / Violet (`#4F46E5` / `248 79% 60%`)
- **Secondary Accent**: Lilac & Lavender (`#C4B5FD` / `#EEF2FF`)
- **Typography**: Geist / Inter with high-contrast navy graphite (`#0F172A`) and tabular numerals (`tabular-nums`)
- **Icons**: 100% `lucide-react` (16px, 18px, 20px) replacing single-letter navigations and emoji icons.
- **Card Hierarchy**: Layered subtle elevation shadows (`shadow-card`, `shadow-panel`), rounded containers (`rounded-card: 16px`, `rounded-panel: 20px`), minimal borders (`border-subtle`).
- **Security & RBAC**: Fail-closed permission gating (`usePermissionGate`), zero permissive fallbacks, privacy field classifications, and authenticated download endpoints.

---

## 2. Comprehensive Route Migration Index

| Route | Domain | Previous State | Target AIavro Primitive / Architecture | API Dependencies & Query Keys | Permission Code | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/dashboard`** | **Home** | Legacy admin panel | `MetricPillsStrip`, `EmployeeProfileCard`, `WorkTimeTracker`, `ScheduleCalendar`, `OnboardingTaskRail` | `/attendance/me/today`, `/leaves/balances/me`, `/employees/me`, `/announcements` | None (All Users) | ✅ **Complete (Task 01)** |
| **`/profile`** | **ESS** | Synthetic fallbacks | Profile header card, work & emergency tabs | `GET /profile` (`useProfile`) | `profile.view` | ✅ **Complete (Task 02)** |
| **`/attendance`** | **ESS** | Assumed shift rules | Interactive timer dial, 3-state policy rules | `GET /attendance/me/today` (`useAttendanceToday`) | `attendance.view` | ✅ **Complete (Task 02)** |
| **`/leave`** | **ESS** | Legacy leave page | Available balances hero, request timeline | `GET /leaves/balances/me` (`useLeaveBalances`) | `leave.view` | ✅ **Complete (Task 02)** |
| **`/payslips`** | **ESS** | Raw table | Authenticated PDF download, compensation cards | `GET /payslips/me` (`useMyPayslips`) | `payslip.view` | ✅ **Complete (Task 02)** |
| **`/documents`** | **ESS** | Raw links | Verified credential vault, authenticated download | `GET /documents` (`useEmployeeDocuments`) | `documents.view` | ✅ **Complete (Task 02)** |
| **`/id-card`** | **ESS** | Fake icon | Standard scannable QR payload, neutral badge | `GET /id-card` (`useIdCard`) | `idcard.view` | ✅ **Complete (Task 02)** |
| **`/requests`** | **ESS** | Hardcoded types | Service desk modal, backend enum alignment | `GET /requests` (`useEmployeeRequests`) | `requests.view` | ✅ **Complete (Task 02)** |
| **`/announcements`** | **ESS** | Plain list | Pinned broadcasts, acknowledgment mutations | `GET /announcements` (`useAnnouncements`) | `announcements.view` | ✅ **Complete (Task 02)** |
| **`/directory`** | **People** | Legacy search | Debounced search, department pills, employee cards | `GET /directory` (`peopleKeys.directory`) | `directory.view` | ✅ **Complete (Task 03)** |
| **`/employees`** | **People** | Heavy ERP table | HR Operations workspace, multi-filter, create modal | `GET /employees`, `POST /employees` (`peopleKeys.employees`) | `employees.read` | ✅ **Complete (Task 03)** |
| **`/employees/[id]`** | **People** | Static details | Tabbed profile workspace (Overview, Org, Docs, Timeline) | `GET /employees/:id` (`peopleKeys.employeeDetail`) | `employees.read` | ✅ **Complete (Task 03)** |
| **`/organization`** | **Org** | Plain lists | Org metrics strip, Depts & Designations tabs | `GET /departments`, `GET /designations` | `organization.view` | ✅ **Complete (Task 03)** |
| **`/org-chart`** | **Org** | Monolithic chart | Recursive tree nodes with direct reports & badges | `GET /directory/org-chart`, `GET /organization/tree` | `directory.view` | ✅ **Complete (Task 03)** |
| **`/organization/business-units`** | **Org** | Basic table | Business units cards & creation modal | `GET /organization/business-units` | `organization.view` | ✅ **Complete (Task 03)** |
| **`/organization/teams`** | **Org** | Basic table | Squads & Teams cards & creation modal | `GET /organization/teams` | `organization.view` | ✅ **Complete (Task 03)** |
| **`/locations`** | **Org** | Basic table | Geofenced workplace locations cards & creation modal | `GET /locations` (`peopleKeys.locations`) | `location.view` | ✅ **Complete (Task 03)** |
| **`/mss`** | **Manager** | None / placeholder | Team overview, attendance status, pending approvals | `GET /mss/dashboard` (`managerKeys.dashboard`) | `mss.read` | ✅ **Complete (Task 03)** |
| **`/mss/team`** | **Manager** | None | Direct reports roster with contact & profile links | `GET /mss/team` (`managerKeys.team`) | `mss.read` | ✅ **Complete (Task 03)** |
| **`/mss/approvals`** | **Manager** | None | Leave & request approval queue with 1-click action | `GET /mss/approvals` (`managerKeys.approvals`) | `mss.read` | ✅ **Complete (Task 03)** |

---

## 3. Privacy & Access Control Rules

1. **Public Workplace Directory**:
   - Exposed fields: `fullName`, `avatarUrl`, `employeeCode`, `designation`, `department`, `workEmail`, `workLocation`.
   - Never expose in public directory: `personalPhone`, `homeAddress`, `emergencyContact`, `salary`, `bankAccount`, `taxId`.
2. **Restricted HR Operations**:
   - Gated strictly by `employees.read` / `employees.create` / `employees.update`.
3. **Manager Boundary**:
   - Manager workspace strictly scopes direct reports (`where: { managerEmployeeId }`). A manager cannot view non-subordinate private employee records.
4. **Tenant Isolation**:
   - Every API query verifies `where: { tenantId }`.

