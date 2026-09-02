import type { Route } from "next";
import type { PermissionCode } from "@vc-wms/shared-types";

export type NavItem = {
  href: Route;
  label: string;
  permission?: PermissionCode;
};

export type NavGroup = {
  label: string;
  href: Route;
  permission?: PermissionCode;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  { label: "Home", href: "/dashboard", items: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    label: "People",
    href: "/employees",
    items: [
      { href: "/employees", label: "Employees", permission: "employees.read" },
      { href: "/directory", label: "Directory", permission: "directory.view" },
      { href: "/organization", label: "Organization", permission: "organization.view" },
      { href: "/organization/business-units" as Route, label: "Business Units", permission: "organization.view" },
      { href: "/organization/teams" as Route, label: "Teams", permission: "organization.view" },
      { href: "/documents", label: "Documents", permission: "documents.view" },
      { href: "/profile", label: "My Profile", permission: "profile.view" },
      { href: "/requests", label: "Requests", permission: "requests.view" }
    ]
  },
  {
    label: "Time",
    href: "/attendance",
    items: [
      { href: "/attendance", label: "Attendance", permission: "attendance.view" },
      { href: "/attendance/history" as Route, label: "History", permission: "attendance.view" },
      { href: "/attendance/corrections" as Route, label: "Corrections", permission: "attendance.correct" },
      { href: "/leave", label: "Leave", permission: "leave.view" },
      { href: "/leave/calendar" as Route, label: "Leave Calendar", permission: "leave.view" },
      { href: "/locations", label: "Locations", permission: "location.view" }
    ]
  },
  {
    label: "Payroll",
    href: "/payroll",
    items: [
      { href: "/payroll", label: "Payroll", permission: "payroll.view" },
      { href: "/payroll/run" as Route, label: "Run Payroll", permission: "payroll.process" },
      { href: "/compensation", label: "Compensation", permission: "compensation.view" },
      { href: "/payslips", label: "Payslips", permission: "payslip.view" },
      { href: "/compliance", label: "Compliance", permission: "compliance.view" },
      { href: "/finance", label: "Finance", permission: "finance.view" },
      { href: "/expenses", label: "Expenses", permission: "expenses.view" },
      { href: "/travel", label: "Travel", permission: "travel.view" }
    ]
  },
  {
    label: "Talent",
    href: "/ats" as Route,
    items: [
      { href: "/ats" as Route, label: "Hiring", permission: "recruitment.read" },
      { href: "/ats/pipeline" as Route, label: "Pipeline", permission: "recruitment.read" },
      { href: "/performance" as Route, label: "Performance", permission: "performance.view" },
      { href: "/performance/goals" as Route, label: "Goals", permission: "performance.view" },
      { href: "/performance/reviews" as Route, label: "Reviews", permission: "performance.view" },
      { href: "/performance/succession" as Route, label: "Succession", permission: "performance.view" },
      { href: "/learning" as Route, label: "Learning" }
    ]
  },
  {
    label: "Workplace",
    href: "/assets",
    items: [
      { href: "/assets", label: "Assets", permission: "assets.view" },
      { href: "/helpdesk" as Route, label: "Helpdesk", permission: "helpdesk.view" },
      { href: "/facilities" as Route, label: "Facilities", permission: "facilities.view" },
      { href: "/visitors" as Route, label: "Visitors", permission: "visitor.view" },
      { href: "/gate-passes" as Route, label: "Gate Passes", permission: "gatepass.manage" },
      { href: "/vehicles" as Route, label: "Fleet" },
      { href: "/clearance" as Route, label: "Clearance", permission: "clearance.manage" }
    ]
  },
  {
    label: "Analytics",
    href: "/analytics",
    permission: "analytics.view",
    items: [
      { href: "/analytics", label: "Analytics Hub", permission: "analytics.view" },
      { href: "/analytics/executive" as Route, label: "Executive", permission: "analytics.view" },
      { href: "/analytics/workforce" as Route, label: "Workforce", permission: "analytics.view" },
      { href: "/analytics/attendance" as Route, label: "Attendance", permission: "analytics.view" },
      { href: "/analytics/payroll" as Route, label: "Payroll", permission: "analytics.view" },
      { href: "/reports", label: "Reports", permission: "reports.view" }
    ]
  },
  {
    label: "AI",
    href: "/ai",
    items: [
      { href: "/ai", label: "Copilot", permission: "ai.assistant.view" },
      { href: "/ai-assistant" as Route, label: "Assistant", permission: "ai.assistant.view" },
      { href: "/analytics/ai" as Route, label: "Insights", permission: "analytics.view" },
      { href: "/ai/knowledge-base" as Route, label: "Policy Intelligence", permission: "ai.assistant.view" },
      { href: "/ai/history" as Route, label: "History", permission: "ai.assistant.view" },
      { href: "/automation" as Route, label: "Automations", permission: "automation.view" }
    ]
  },
  {
    label: "Admin",
    href: "/settings/tenant",
    permission: "tenant.settings.read",
    items: [
      { href: "/settings/tenant", label: "Tenant Settings", permission: "tenant.settings.read" },
      { href: "/settings/branding", label: "Brand Settings", permission: "tenant.branding.read" },
      { href: "/settings/roles", label: "Roles", permission: "roles.read" },
      { href: "/users", label: "Users", permission: "users.read" },
      { href: "/integrations" as Route, label: "Integrations", permission: "integrations.view" },
      { href: "/integrations/sso" as Route, label: "SSO", permission: "integrations.sso.view" },
      { href: "/audit-logs", label: "Audit", permission: "security.view" },
      { href: "/admin/system-health" as Route, label: "System Health", permission: "security.manage" },
      { href: "/admin/security" as Route, label: "Security", permission: "security.manage" }
    ]
  }
];

export const employeeDock: NavItem[] = [
  { href: "/dashboard", label: "Home" },
  { href: "/requests", label: "Requests", permission: "requests.view" },
  { href: "/attendance", label: "Time", permission: "attendance.view" },
  { href: "/ai", label: "AI", permission: "ai.assistant.view" },
  { href: "/profile", label: "Profile", permission: "profile.view" }
];

export function canSee(permission: PermissionCode | undefined, permissions: PermissionCode[]) {
  if (!permission) return true;
  return permissions.includes(permission);
}

export function filterGroups(permissions: PermissionCode[]) {
  return navGroups
    .filter((group) => canSee(group.permission, permissions))
    .map((group) => ({ ...group, items: group.items.filter((item) => canSee(item.permission, permissions)) }))
    .filter((group) => group.items.length > 0);
}

export function routeCommandItems(permissions: PermissionCode[], query: string) {
  return filterGroups(permissions)
    .flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.href === item.href) === index)
    .filter((item) => `${item.group} ${item.label}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12);
}

export function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}
