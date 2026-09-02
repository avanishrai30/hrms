# AIavro Studio Admin Exact Visual Convergence Mapping Document

This document records the component, layout, and visual system mappings between the **Studio Admin** design system ([next-shadcn-admin-dashboard](https://github.com/arhamkhnz/next-shadcn-admin-dashboard), MIT License) and **AIavro HRMS**.

---

## 1. Design System & Shell Primitives

| Component / Layer | Studio Admin Reference | AIavro Implementation | Differences Intentionally Retained |
|---|---|---|---|
| **Shell & Layout** | `SidebarProvider`, `SidebarInset`, `h-12` header | `apps/web/components/ui/sidebar.tsx`, `apps/web/components/app-shell.tsx` | AIavro multi-tenant branding, role permissions filter on nav groups |
| **Command Palette** | `SearchDialog` (`cmdk` with `Cmd+K`) | `apps/web/components/search-dialog.tsx` | Search targets live AIavro routes filtered by active RBAC permissions |
| **Header Bar** | Sticky `h-12` with trigger, search bar, theme toggle, user menu | `apps/web/components/app-shell.tsx` header | Integrated with VC Organics session store & employee profile |
| **Color Tokens** | Neutral shadcn theme (`oklch` / `hsl` neutral palette) | `apps/web/app/globals.css`, `apps/web/tailwind.config.ts` | Retains restrained AIavro primary indigo accent (`hsl(240 5.9% 10%)` / `hsl(243 75% 59%)`) |
| **Typography & Geometry** | Geist / Inter sans font stack, `--radius: 0.625rem` (10px) | `apps/web/app/globals.css` | Exact font stack, tabular numerals (`tabular-nums`) on metric counters |
| **Card Primitive** | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | `apps/web/components/ui/card.tsx` | 100% parity with standard shadcn Card grammar |
| **Table Primitive** | `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell` | `apps/web/components/ui/table.tsx` | Dense enterprise padding, uppercase column headers |
| **Badge Primitive** | `Badge` (default, secondary, destructive, success, warning, outline) | `apps/web/components/ui/badge.tsx` | Standard shadcn variants with status mappings |
| **Dialog Primitive** | `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter` | `apps/web/components/ui/dialog.tsx` | Radix Dialog with backdrop blur and animated zoom transitions |

---

## 2. Route-by-Route Component & Data Mapping

### 1. `/dashboard`
- **Studio Admin Reference**: `/dashboard/default` (`MetricCards`, `PerformanceOverview`, `SubscriberOverview` data table)
- **Component Reused / Adapted**: Metric Cards 4-column grid, Attendance / Punch terminal card, Profile / Shortcuts card, Announcements data table.
- **AIavro Data Source**: `GET /api/v1/dashboard/summary`, `GET /api/v1/attendance/today`, `GET /api/v1/leaves/balances`, `GET /api/v1/requests`, `GET /api/v1/announcements`.
- **Permission Boundary**: `ess.read`, `dashboard.view` (broad role access).
- **Differences Intentionally Retained**: ZERO fake revenue, sales, or customer growth data. All metrics represent real workforce headcount, punch status, leave balance days, and open service requests.

---

### 2. `/directory`
- **Studio Admin Reference**: Table / Filter pattern with responsive cards and pagination controls.
- **Component Reused / Adapted**: Search toolbar with debounced `Input` and department selector, Employee card grid with `Avatar`, role badge, email, and location.
- **AIavro Data Source**: `GET /api/v1/employees/directory?search=&departmentId=&limit=24&offset=`.
- **Permission Boundary**: Gated on `directory.view` or `employees.read`.
- **Differences Intentionally Retained**: Real server-side offset pagination, 300ms debounced search, Work Email directory-safe classification.

---

### 3. `/employees`
- **Studio Admin Reference**: Data table layout (`UsersTable` / `/dashboard/users`) with search toolbar, status filters, and pagination.
- **Component Reused / Adapted**: Dense `Table` with Employee avatar, employee code, department/designation, employment type, status badge, and Manage action.
- **AIavro Data Source**: `GET /api/v1/employees?q=&departmentId=&status=`.
- **Permission Boundary**: Gated on `employees.read`; creation gated on `employees.create`.
- **Differences Intentionally Retained**: Deliberate required `employmentType` dropdown in Add Employee `Dialog`, backend-owned `status: "DRAFT"` and `salaryType: "MONTHLY"` defaults (omitted from frontend mutation payload).

---

### 4. `/employees/[id]`
- **Studio Admin Reference**: Detail page surface with breadcrumb, header metadata card, and tabs.
- **Component Reused / Adapted**: `Breadcrumb`, `Avatar`, `Badge`, `Tabs` (`Overview`, `Hierarchy`, `Documents`, `Timeline`).
- **AIavro Data Source**: `GET /api/v1/employees/:id`, `GET /api/v1/employees/:id/timeline`, `GET /api/v1/employees/:id/documents`.
- **Permission Boundary**: Gated on `employees.read`. Timeline query enabled only when tab active. Documents query gated on `documents.read`.
- **Differences Intentionally Retained**: Strict privacy gates (unauthorized tabs show restricted banner without executing backend queries). Phone classified as restricted HR contact.

---

### 5. `/organization`
- **Studio Admin Reference**: Multi-tab entity management with metric strip and action modals.
- **Component Reused / Adapted**: Top 4-card metric strip (`Departments`, `Designations`, `Business Units`, `Teams`), `Tabs`, `Table`, `Dialog` for creating departments and designations.
- **AIavro Data Source**: `GET /api/v1/departments`, `GET /api/v1/designations`, `GET /api/v1/business-units`, `GET /api/v1/teams`.
- **Permission Boundary**: Gated on `organization.view` / `departments.read`.

---

### 6. `/locations`
- **Studio Admin Reference**: Entity list with facility type badges and creation dialog.
- **Component Reused / Adapted**: `Table`, `Badge`, `Button`, `Dialog` with facility type select and geofence radius.
- **AIavro Data Source**: `GET /api/v1/locations`.
- **Permission Boundary**: Gated on `location.view`; creation on `location.create`.
- **Differences Intentionally Retained**: 100m default geofence ownership.

---

### 7. `/mss`, `/mss/team`, `/mss/approvals`
- **Studio Admin Reference**: Management overview with KPI strip, team grid, and approval list.
- **Component Reused / Adapted**: KPI strip (`Direct Reports`, `On Leave Today`, `Pending Approvals`), `Table`, `Tabs`, `Dialog` for rejection reason.
- **AIavro Data Source**: `GET /api/v1/mss/dashboard`, `GET /api/v1/mss/team`, `GET /api/v1/leaves/approvals`, `POST /api/v1/leaves/:id/review`.
- **Permission Boundary**: Gated on `mss.read` and `leave.approve`. Same-tenant manager authorization rejects non-direct reports with `ForbiddenException` (403).
- **Differences Intentionally Retained**: Eliminated `window.prompt()` for leave rejection in favor of a clean shadcn `Dialog`. Truthful copy describing leave approvals vs. service desk monitoring.

---

### 8. Employee Self Service (`/profile`, `/attendance`, `/leave`, `/payslips`, `/documents`, `/id-card`)
- **Studio Admin Reference**: Cards, badges, action buttons, and standard tables.
- **Component Reused / Adapted**: Inherits all Studio Admin CSS variables, `--radius: 0.625rem`, dense padding, and neutral contrast tokens.
- **AIavro Data Source**: Existing authenticated ESS endpoints.
- **Permission Boundary**: Unchanged.
