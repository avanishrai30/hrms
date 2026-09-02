"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Clock,
  Calendar,
  CreditCard,
  GraduationCap,
  Sparkles,
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Briefcase,
  ShieldCheck,
  Laptop,
  Building2,
  BarChart3
} from "lucide-react";
import type { PermissionCode } from "@vc-wms/shared-types";
import { useSessionStore } from "../lib/session-store";
import { useEmployeeProfile } from "../lib/queries/use-dashboard-queries";

interface NavItem {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionCode;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Core",
    items: [
      { href: "/dashboard" as Route, label: "Home", icon: Home },
      { href: "/search" as Route, label: "Global Search", icon: Search },
      { href: "/ai" as Route, label: "AI Copilot", icon: Sparkles, badge: "New" }
    ]
  },
  {
    title: "Self Service & People",
    items: [
      { href: "/ess" as Route, label: "My Self Service", icon: Users },
      { href: "/directory" as Route, label: "Directory", icon: Building2 },
      { href: "/org-chart" as Route, label: "Org Chart", icon: Briefcase },
      { href: "/employees" as Route, label: "Employees", icon: Users, permission: "employees.read" },
      { href: "/recruitment" as Route, label: "Recruitment ATS", icon: Briefcase, permission: "recruitment.read" }
    ]
  },
  {
    title: "Time & Schedule",
    items: [
      { href: "/attendance" as Route, label: "Attendance", icon: Clock },
      { href: "/leave" as Route, label: "Leave & Time Off", icon: Calendar },
      { href: "/meeting-rooms" as Route, label: "Meeting Rooms", icon: Building2 },
      { href: "/parking" as Route, label: "Parking Bays", icon: Briefcase }
    ]
  },
  {
    title: "Finance & Payroll",
    items: [
      { href: "/payslips" as Route, label: "My Payslips", icon: CreditCard },
      { href: "/payroll" as Route, label: "Enterprise Payroll", icon: CreditCard, permission: "payroll.read" },
      { href: "/finance" as Route, label: "Finance & Accounts", icon: CreditCard, permission: "finance.view" }
    ]
  },
  {
    title: "Talent & Growth",
    items: [
      { href: "/performance" as Route, label: "Performance & OKRs", icon: BarChart3 },
      { href: "/learning" as Route, label: "Learning & LMS", icon: GraduationCap },
      { href: "/engagement" as Route, label: "Culture & Rewards", icon: Sparkles }
    ]
  },
  {
    title: "Workplace & Operations",
    items: [
      { href: "/assets" as Route, label: "Asset Management", icon: Laptop },
      { href: "/vendors" as Route, label: "Vendor Ecosystem", icon: ShieldCheck, permission: "vendors.manage" },
      { href: "/contractors" as Route, label: "Contractor Muster", icon: Users, permission: "contractors.manage" },
      { href: "/visitors" as Route, label: "Visitor Passes", icon: ShieldCheck }
    ]
  },
  {
    title: "Intelligence & Admin",
    items: [
      { href: "/admin/executive-intelligence" as Route, label: "Executive AI", icon: BarChart3, permission: "executive.intelligence" },
      { href: "/analytics" as Route, label: "Analytics Hub", icon: BarChart3, permission: "analytics.view" },
      { href: "/admin/system-health" as Route, label: "System Health", icon: Settings, permission: "system.health" },
      { href: "/audit-logs" as Route, label: "Audit Ledger", icon: ShieldCheck, permission: "audit.read" }
    ]
  }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const tenantName = useSessionStore((state) => state.tenantName) || "VC Organics";
  const permissions = useSessionStore((state) => state.permissions) || [];
  const profileQuery = useEmployeeProfile();
  const profile = profileQuery.data;
  const userDisplayName = profile?.fullName || profile?.firstName || "My Workspace";
  const initialLetter = (profile?.firstName?.charAt(0) || profile?.fullName?.charAt(0) || tenantName.charAt(0) || "U").toUpperCase();

  const filterItem = (item: NavItem) => {
    if (!item.permission) return true;
    return permissions.includes(item.permission);
  };

  return (
    <div className="min-h-screen bg-canvas flex text-foreground font-sans antialiased">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border-subtle bg-surface transition-all duration-300 z-30 shrink-0 sticky top-0 h-screen ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand & Workspace Identity */}
        <div className="p-4 flex items-center justify-between border-b border-border-subtle">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-panel bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                A
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-foreground">AIavro</h1>
                  <span className="px-1.5 py-0.2 rounded-pill bg-primary-soft text-[10px] font-bold text-primary">OS</span>
                </div>
                <p className="text-[11px] text-foreground-muted font-medium truncate">{tenantName}</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-panel bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                A
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-control hover:bg-surface-muted text-foreground-muted hover:text-foreground transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(filterItem);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!isCollapsed && (
                  <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-foreground-muted/70">
                    {section.title}
                  </h2>
                )}
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-card text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                      } ${isCollapsed ? "justify-center px-0 py-2.5" : ""}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-foreground-muted group-hover:text-primary transition-colors"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-pill bg-accent-purple/20 text-accent-purple text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip in Collapsed Mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1 rounded-control bg-[#18153B] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-dropdown z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Account / Tenant Context Footer */}
        <div className="p-3 border-t border-border-subtle bg-surface-muted/30">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-card bg-surface border border-border-subtle shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-pill bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {initialLetter}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-foreground-muted truncate">{tenantName}</p>
                </div>
              </div>
              <Link href={"/profile" as Route} className="text-foreground-muted hover:text-foreground transition p-1">
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div className="w-8 h-8 rounded-pill bg-primary-soft text-primary font-bold text-xs flex items-center justify-center">
                {initialLetter}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="sticky top-0 z-20 h-16 bg-surface/80 backdrop-blur-md border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-control hover:bg-surface-muted text-foreground-secondary transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground-muted hidden sm:inline">{tenantName}</span>
              <span className="text-xs text-foreground-muted hidden sm:inline">/</span>
              <span className="text-xs font-bold text-foreground capitalize">
                {pathname === "/dashboard" ? "Overview" : pathname.replace(/^\//, "").replace(/-/g, " ")}
              </span>
            </div>
          </div>

          {/* Right: Quick actions (Search, Notifications, Copilot, Profile) */}
          <div className="flex items-center gap-2.5">
            <Link
              href={"/search" as Route}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-pill bg-surface-muted border border-border-subtle text-xs text-foreground-muted hover:text-foreground transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search anything...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px] font-mono">⌘K</kbd>
            </Link>

            <Link
              href={"/notifications" as Route}
              className="relative p-2 rounded-pill bg-surface hover:bg-surface-muted border border-border-subtle text-foreground-secondary transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-pill bg-primary" />
            </Link>

            <Link
              href={"/ai" as Route}
              className="px-3 py-1.5 rounded-pill bg-primary text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </Link>

            <Link href={"/profile" as Route} className="flex items-center gap-2 pl-2 border-l border-border-subtle">
              <div className="w-8 h-8 rounded-pill bg-gradient-to-br from-primary to-accent-purple text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {initialLetter}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 pb-12 overflow-x-hidden">{children}</main>
      </div>

      {/* 3. Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-surface h-full shadow-2xl flex flex-col z-50">
            <div className="p-4 flex items-center justify-between border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-panel bg-primary flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">AIavro</h2>
                  <p className="text-[10px] text-foreground-muted">{tenantName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-control hover:bg-surface-muted text-foreground-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-4">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted px-2">
                    {section.title}
                  </h3>
                  {section.items.filter(filterItem).map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-card text-xs font-semibold ${
                          isActive ? "bg-primary text-white" : "text-foreground-secondary hover:bg-surface-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
