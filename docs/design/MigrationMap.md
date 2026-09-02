# AIavro Design System — Route Migration Map & Audit

## 1. Executive Summary & Design System Target

The AIavro controlled product-design migration establishes a unified, modern workforce operating system visual standard:
- **Canvas**: Pale lavender/cool neutral (`#F7F7FC` / `248 30% 98%`)
- **Primary**: Deep Royal Indigo / Violet (`#4F46E5` / `248 79% 60%`)
- **Secondary Accent**: Lilac & Lavender (`#C4B5FD` / `#EEF2FF`)
- **Typography**: Geist / Inter with high-contrast navy graphite (`#0F172A`) and tabular numerals (`tabular-nums`)
- **Icons**: 100% `lucide-react` (16px, 18px, 20px) replacing single-letter navigations and emoji icons.
- **Card Hierarchy**: Layered subtle elevation shadows (`shadow-card`, `shadow-panel`), rounded containers (`rounded-card: 16px`, `rounded-panel: 20px`), minimal borders (`border-subtle`).

---

## 2. Broken Route Diagnosis

### Root-Cause Analysis: `/analytics` Route
- **Observed Symptom**: Route `/analytics` occasionally fails to render on initial client navigation with a generic error banner or chunk loading exception.
- **Root Causes Identified**:
  1. **Server-Side Hydration Mismatch**: Dynamic client calculations referencing `window` or uninitialized session store data prior to hydration.
  2. **Monolithic API Waterfall**: Single combined queries without granular error boundaries causing the entire page tree to unmount if any one sub-aggregation (e.g., face biometric aggregations or attendance anomaly stats) returned `500` or `404`.
  3. **Lack of Per-Widget Fallback**: Page-level error catch instead of isolated widget retry boundaries.
- **Remediation Plan**:
  - Implement domain query keys using TanStack Query (`useQuery` with `staleTime` and isolated `isError` handling per chart widget).
  - Wrap charts in `InlineUnavailableState` so one failing statistic does not crash the analytics dashboard.

---

## 3. Comprehensive Route Migration Index

| Route | Domain | Current Technical / Visual Debt | Target AIavro Primitive | API Dependencies & Query Keys | Permission Code | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/dashboard`** | **Home** | ✅ **MIGRATED (Flagship)** | `MetricPillsStrip`, `EmployeeProfileCard`, `WorkTimeTracker`, `ScheduleCalendar`, `OnboardingTaskRail` | `/attendance/me/today`, `/leaves/balances/me`, `/employees/me`, `/announcements` | None (All Users) | **Complete** |
| **`/employees`** | People / Core HR | Heavy table markup, hardcoded border colors | `DataTable` with avatar pills, department tags, search filter strip | `GET /api/v1/employees` (`employeeKeys.list`) | `employees.read` | **P1 (Next)** |
| **`/attendance`** | Time & Attendance | Legacy green tones, standard cards | `AttendanceCommandCenter` with circular time tracker and punch history | `GET /api/v1/attendance/me` (`attendanceKeys.history`) | `attendance.read` | **P1** |
| **`/leave`** | Time & Schedule | Basic balance cards, generic table | `LeaveBalanceGauge`, leave request timeline | `GET /api/v1/leaves/balances/me` (`leaveKeys.balances`) | `leaves.read` | **P1** |
| **`/payroll`** | Finance & Payroll | Enterprise table with green badges | `PayrollRunMetrics`, statutory compliance cards | `GET /api/v1/payroll/runs` (`payrollKeys.runs`) | `payroll.read` | **P2** |
| **`/payslips`** | Self Service | Plain list view | `DigitalPayslipCard`, tax breakdown drawer | `GET /api/v1/payslips/me` (`payslipKeys.me`) | `payslips.read` | **P2** |
| **`/performance`** | Talent & Growth | Legacy cards and form sections | `360AppraisalWidget`, OKR Goal progress cards | `GET /api/v1/performance/goals` (`perfKeys.goals`) | `performance.read` | **P2** |
| **`/learning`** | LMS & Skills | Basic grid of cards | `LmsCourseCard`, skill radar chart | `GET /api/v1/learning/courses` (`lmsKeys.catalog`) | `lms.view` | **P2** |
| **`/engagement`** | Culture & Rewards | Generic social wall | `CultureMoraleStrip`, Kudos feed, reward wallet capsule | `GET /api/v1/engagement/pulse` (`cultureKeys.pulse`) | `engagement.read` | **P3** |
| **`/assets`** | Workplace / IT | Basic list | `AssetPassportCard`, depreciation bar gauge | `GET /api/v1/assets` (`assetKeys.list`) | `assets.view` | **P3** |
| **`/vendors`** | Procurement | Standard tables | `VendorScorecardPill`, contract expiry alerts | `GET /api/v1/vendors` (`vendorKeys.list`) | `vendors.manage` | **P3** |
| **`/visitors`** | Facilities | Standard table | `VisitorPassCard` with QR code display | `GET /api/v1/visitor/passes` (`visitorKeys.passes`) | `visitors.view` | **P3** |
| **`/analytics`** | Intelligence | Single monolithic page with risk of total crash | Decoupled modular widgets with isolated `InlineUnavailableState` | `GET /api/v1/analytics/workforce` (`analyticsKeys.workforce`) | `analytics.read` | **P1** |
| **`/ai`** | AI Assistant | Simple chat box | `AiavroCopilotConsole` with structured RAG prompt recommendations | `POST /api/v1/ai/query` (`aiKeys.conversations`) | None (All Users) | **P2** |

---

## 4. Architectural Rules for Future Route Migrations

1. **Always inherit from AIavro Semantic Tokens**: Never use hardcoded colors (`bg-purple-500`, `border-gray-200`) — always use `bg-primary`, `bg-surface-raised`, `border-border-subtle`.
2. **Never use single-letter icons or emojis in primary navigation**: Always import from `lucide-react`.
3. **Isolate Component Data Fetching**: Every widget must have its own query hook and handle its own loading and error state cleanly.
4. **Preserve High-Density Whitespace**: Balance rich metrics with generous padding (`p-5`, `rounded-card`) and clear typographic hierarchy.
