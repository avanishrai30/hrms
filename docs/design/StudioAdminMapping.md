# AIavro Studio Admin Exact Visual Convergence & Source Transplant Mapping Document

This document records the exact source transplant, component composition, and visual integrity mappings between upstream **Studio Admin** ([next-shadcn-admin-dashboard](https://github.com/arhamkhnz/next-shadcn-admin-dashboard)) and **AIavro HRMS** for Task 03.6.

---

## 1. Upstream Source Repository & License Information

- **Repository**: `https://github.com/arhamkhnz/next-shadcn-admin-dashboard.git`
- **Upstream Release Version**: `2.2.0`
- **Upstream Commit SHA**: `f0db53ce2f40059a43018b44f6d5da4f0b2e3b6e`
- **License**: MIT License
- **Copyright**: `Copyright (c) 2024 Arham Khan`
- **License Notice**:
  ```text
  MIT License

  Copyright (c) 2024 Arham Khan

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  ```

---

## 2. Design System & Shell Primitives

| Component / Layer | Upstream Reference Path | AIavro Implementation Path | Structure & Parity |
|---|---|---|---|
| **App Shell & Inset** | `src/app/(main)/layout.tsx` | `apps/web/components/app-shell.tsx` | Exact `SidebarProvider`, collapsible `Sidebar` (`variant="sidebar"`), `h-12` sticky header, backdrop blur |
| **NavUser Footer** | `src/app/(main)/dashboard/_components/sidebar/nav-user.tsx` | `apps/web/components/app-shell.tsx` (`NavUserSection`) | `SidebarMenuButton size="lg"`, `Avatar className="h-8 w-8 rounded-lg"`, `EllipsisVertical`, responsive dropdown placement |
| **Command Palette** | `src/app/(main)/dashboard/_components/header/search-dialog.tsx` | `apps/web/components/search-dialog.tsx` | Exact `cmdk` `SearchDialog` (`Cmd+K`), filtered dynamically by active RBAC permissions |
| **Header Bar** | `src/app/(main)/dashboard/_components/header/` | `apps/web/components/app-shell.tsx` | Sticky `h-12` header with `SidebarTrigger`, `Separator orientation="vertical"`, `SearchDialog`, theme switcher, notifications, user avatar |
| **Theme Tokens** | `src/app/globals.css`, `components.json` (`baseColor: neutral`) | `apps/web/app/globals.css`, `apps/web/tailwind.config.ts` | Neutral CSS tokens (`--card`, `--popover`, `--primary`, `--muted`, `--border`, `--radius: 0.625rem`) |
| **Card Primitive** | `src/components/ui/card.tsx` | `apps/web/components/ui/card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`, `data-slot="card"` |
| **Table Primitive** | `src/components/ui/table.tsx` | `apps/web/components/ui/table.tsx` | Enterprise table grammar with `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell` |
| **Badge Primitive** | `src/components/ui/badge.tsx` | `apps/web/components/ui/badge.tsx` | `default`, `secondary`, `destructive`, `outline`, `success`, `warning` |
| **Dialog Primitive** | `src/components/ui/dialog.tsx` | `apps/web/components/ui/dialog.tsx` | Radix Dialog with animated backdrop blur and zoom transitions |
| **Tabs Primitive** | `src/components/ui/tabs.tsx` | `apps/web/components/ui/tabs.tsx` | Radix Tabs with pill-style trigger indicators |

---

## 3. Data Integrity & Recovery Contract (14 Points)

| # | Integrity Assertion | Implementation Rule & Status |
|---|---|---|
| **1** | Punch never silently uses hardcoded coordinates | Uses real browser `navigator.geolocation.getCurrentPosition`; omits coordinates if unavailable or permission denied. Hardcoded coordinates (`12.9716, 77.5946`) deleted. |
| **2** | Failed geolocation does not fall back to Bangalore | If geolocation fails or times out, coordinates remain `undefined` without fabricating location. |
| **3** | New location does not use hardcoded coordinates | Explicit numeric inputs required for `latitude` and `longitude` in location creation form. |
| **4** | Missing designation does not render Team Member | Defaults to `—` or empty; synthetic "Team Member" role deleted. |
| **5** | Missing department does not render General | Defaults to `—` or empty; synthetic "General" department deleted. |
| **6** | Missing location does not render Bangalore HQ | Defaults to `—` or empty; synthetic "Bangalore HQ" location deleted. |
| **7** | Missing identity does not render U | Returns neutral `CircleUser` icon fallback; synthetic "U" string initial deleted. |
| **8** | Unavailable employee count does not render Verified | Shows `—` when loading or unavailable; synthetic "Verified" label deleted. |
| **9** | Non-realtime data does not claim Live Sync | Omitted unproven sync claims; honest status displayed. |
| **10** | Missing announcement category does not become General | Defaults to `—` or empty. |
| **11** | Privacy gates remain intact (fail closed) | Unauthorized tabs and fields block queries and display restricted state. |
| **12** | Employee creation defaults remain backend-owned | Required deliberate `employmentType`; frontend does not inject synthetic status/salary defaults. |
| **13** | Wrong-manager leave approval remains blocked | Backend enforces direct report relationship and fails non-reports with 403 Forbidden. |
| **14** | Command-palette results remain permission aware | Filters accessible routes according to user's assigned permissions. |

---

## 4. Route Visual Parity & Architecture Mapping

### 1. `/dashboard`
- **Upstream Pattern**: `/dashboard/default` (`MetricCards`, `PerformanceOverview`, `SubscriberOverview` table)
- **Geometry**: `grid grid-cols-1 xl:grid-cols-4 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs`
- **Data Integrations**: Real live API queries (`attendance`, `leaveBalances`, `requests`, `announcements`, `employeeCount`).
- **Integrity**: Real GPS punch recording with fail-closed prompt; honest shift naming.

### 2. `/directory`
- **Upstream Pattern**: Toolbar with search input, department filter, responsive card grid, and server pagination footer (`Showing X to Y results`, `Previous` / `Next` buttons).
- **Integrity**: 300ms debounced queries; zero "Bangalore HQ", "Team Member", "General", or "U" fallbacks.

### 3. `/employees`
- **Upstream Pattern**: Data table roster with search, department selector, status dropdown, deliberate Add Employee dialog, and server pagination.
- **Integrity**: Deliberate `employmentType` input; backend-owned lifecycle status.

### 4. `/employees/[id]`
- **Upstream Pattern**: Breadcrumb trail, profile header card with avatar, and 4 detail tabs (`Overview`, `Hierarchy`, `Documents`, `Timeline`).
- **Integrity**: Strict privacy gates on Documents and Timeline; no leak of unassigned data.

### 5. `/locations`
- **Upstream Pattern**: Facility management table with geofence badges and Add Location dialog.
- **Integrity**: Explicit numeric coordinate inputs; no synthetic Bangalore defaults.

### 6. `/organization`, `/organization/business-units`, `/organization/teams`, `/org-chart`
- **Upstream Pattern**: Metric cards, tabbed entity tables, expandable organizational tree.
- **Integrity**: Clean hierarchy relations without synthetic fallbacks.

### 7. `/mss`, `/mss/team`, `/mss/approvals`
- **Upstream Pattern**: Manager KPI cards, direct reports grid, approval tables with dedicated shadcn rejection reason dialog.
- **Integrity**: Same-tenant manager authorization gates.

### 8. ESS Retrofits (`/profile`, `/attendance`, `/leave`, `/payslips`, `/documents`, `/id-card`)
- **Upstream Pattern**: Converted to shadcn cards, badges, and tables; eradicated legacy CSS tokens (`bg-surface`, `rounded-card`, `rounded-panel`, `shadow-card`).
