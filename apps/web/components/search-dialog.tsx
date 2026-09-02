"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Search,
  Home,
  Users,
  Clock,
  Calendar,
  CreditCard,
  Building2,
  Briefcase,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Laptop,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator
} from "./ui/command";
import { useSessionStore } from "../lib/session-store";
import type { PermissionCode } from "@vc-wms/shared-types";

interface RouteItem {
  title: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
  permission?: PermissionCode;
}

export const COMMAND_ROUTES: RouteItem[] = [
  // Core
  { title: "Home Dashboard", href: "/dashboard" as Route, icon: Home, section: "Core" },
  { title: "AI Assistant", href: "/ai" as Route, icon: Sparkles, section: "Core" },

  // People & Org
  { title: "Workforce Directory", href: "/directory" as Route, icon: Building2, section: "People & Organization" },
  { title: "Employees List", href: "/employees" as Route, icon: Users, section: "People & Organization", permission: "employees.read" },
  { title: "Organization Structure", href: "/organization" as Route, icon: Building2, section: "People & Organization", permission: "organization.view" },
  { title: "Org Chart Hierarchy", href: "/org-chart" as Route, icon: Briefcase, section: "People & Organization" },
  { title: "Business Units", href: "/organization/business-units" as Route, icon: Building2, section: "People & Organization", permission: "organization.view" },
  { title: "Teams", href: "/organization/teams" as Route, icon: Users, section: "People & Organization", permission: "organization.view" },
  { title: "Work Locations", href: "/locations" as Route, icon: Building2, section: "People & Organization", permission: "location.view" },

  // Time & Leave
  { title: "Attendance Tracker", href: "/attendance" as Route, icon: Clock, section: "Time & Schedule" },
  { title: "Leave & Time Off", href: "/leave" as Route, icon: Calendar, section: "Time & Schedule" },
  { title: "Apply Leave", href: "/leave/request" as Route, icon: Calendar, section: "Time & Schedule" },
  { title: "Leave Calendar", href: "/leave/calendar" as Route, icon: Calendar, section: "Time & Schedule" },

  // Self Service
  { title: "My Profile", href: "/profile" as Route, icon: Users, section: "Self Service" },
  { title: "My Payslips", href: "/payslips" as Route, icon: CreditCard, section: "Self Service" },
  { title: "My Documents", href: "/documents" as Route, icon: FolderOpen, section: "Self Service" },
  { title: "Service Requests", href: "/requests" as Route, icon: CheckCircle2, section: "Self Service" },
  { title: "Digital ID Card", href: "/id-card" as Route, icon: ShieldCheck, section: "Self Service" },

  // Manager Workspace
  { title: "Manager Overview", href: "/mss" as Route, icon: Users, section: "Manager Workspace", permission: "mss.read" },
  { title: "My Direct Reports", href: "/mss/team" as Route, icon: Users, section: "Manager Workspace", permission: "mss.read" },
  { title: "Pending Approvals", href: "/mss/approvals" as Route, icon: CheckCircle2, section: "Manager Workspace", permission: "mss.read" },

  // Finance & Admin
  { title: "Enterprise Payroll", href: "/payroll" as Route, icon: CreditCard, section: "Finance", permission: "payroll.read" },
  { title: "Asset Management", href: "/assets" as Route, icon: Laptop, section: "Operations" },
  { title: "Learning & LMS", href: "/learning" as Route, icon: GraduationCap, section: "Talent" },

  // Talent Acquisition
  { title: "Talent Acquisition", href: "/ats" as Route, icon: Users, section: "Talent", permission: "recruitment.read" },
  { title: "Job Requisitions", href: "/ats/jobs" as Route, icon: Briefcase, section: "Talent", permission: "recruitment.read" },
  { title: "Candidates Database", href: "/ats/candidates" as Route, icon: Users, section: "Talent", permission: "candidates.read" },
  { title: "Hiring Pipeline", href: "/ats/pipeline" as Route, icon: Sparkles, section: "Talent", permission: "applications.read" },
  { title: "Interviews Schedule", href: "/ats/interviews" as Route, icon: Clock, section: "Talent", permission: "interviews.read" },
  { title: "Offer Management", href: "/ats/offers" as Route, icon: CheckCircle2, section: "Talent", permission: "offers.read" },
  { title: "Preboarding Tasks", href: "/ats/preboarding" as Route, icon: FolderOpen, section: "Talent", permission: "preboarding.read" }
];

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const permissions = useSessionStore((state) => state.permissions);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: Route) => {
    setOpen(false);
    router.push(href);
  };

  const authorizedRoutes = getAuthorizedCommandRoutes(permissions);
  const sections = Array.from(new Set(authorizedRoutes.map((r) => r.section)));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-64 items-center justify-between rounded-md border border-input bg-muted/40 px-2.5 text-xs text-muted-foreground shadow-xs transition hover:bg-muted hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          <span>Search or command...</span>
        </span>
        <kbd className="pointer-events-none hidden select-none rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-100 sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search route..." />
        <CommandList>
          <CommandEmpty>No matching routes or commands found.</CommandEmpty>
          {sections.map((section, idx) => (
            <React.Fragment key={section}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={section}>
                {authorizedRoutes
                  .filter((r) => r.section === section)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.href}
                        onSelect={() => handleSelect(item.href)}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{item.title}</span>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function getAuthorizedCommandRoutes(permissions: readonly string[]) {
  return COMMAND_ROUTES.filter((r) => {
    if (!r.permission) return true;
    return permissions.includes(r.permission);
  });
}
