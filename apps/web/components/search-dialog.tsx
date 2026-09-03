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
  FolderOpen,
  MapPin,
  BarChart3
} from "lucide-react";
import { Button } from "./ui/button";
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
  // Overview
  { title: "Home Dashboard", href: "/dashboard" as Route, icon: Home, section: "Overview" },
  { title: "AI Copilot Workspace", href: "/ai" as Route, icon: Sparkles, section: "Overview" },
  { title: "AI Smart Insights", href: "/ai/insights" as Route, icon: Sparkles, section: "Overview" },
  { title: "AI Workforce Predictions", href: "/ai/predictions" as Route, icon: Sparkles, section: "Overview" },
  { title: "AI Automations", href: "/ai/automations" as Route, icon: Sparkles, section: "Overview" },
  { title: "Analytics Hub", href: "/analytics" as Route, icon: BarChart3, section: "Overview" },

  // People & Org
  { title: "Workforce Directory", href: "/directory" as Route, icon: Building2, section: "People & Organization" },
  { title: "Employees Directory", href: "/employees" as Route, icon: Users, section: "People & Organization", permission: "employees.read" },
  { title: "Organization Units", href: "/organization" as Route, icon: Briefcase, section: "People & Organization", permission: "organization.view" },
  { title: "Teams", href: "/organization/teams" as Route, icon: Users, section: "People & Organization", permission: "organization.view" },
  { title: "Org Hierarchy Chart", href: "/org-chart" as Route, icon: Briefcase, section: "People & Organization" },
  { title: "Work Locations", href: "/locations" as Route, icon: MapPin, section: "People & Organization", permission: "location.view" },

  // Time & Attendance
  { title: "Attendance Tracker", href: "/attendance" as Route, icon: Clock, section: "Time & Schedule" },
  { title: "Leave & Time Off", href: "/leave" as Route, icon: Calendar, section: "Time & Schedule" },
  { title: "Team Leave Calendar", href: "/leave/calendar" as Route, icon: Calendar, section: "Time & Schedule" },

  // Self Service
  { title: "My Profile", href: "/profile" as Route, icon: Users, section: "Self Service" },
  { title: "My Payslips", href: "/payslips" as Route, icon: CreditCard, section: "Self Service" },
  { title: "My Documents", href: "/documents" as Route, icon: FolderOpen, section: "Self Service" },
  { title: "Service Requests", href: "/requests" as Route, icon: CheckCircle2, section: "Self Service" },
  { title: "Digital ID Card", href: "/id-card" as Route, icon: ShieldCheck, section: "Self Service" },

  // Management & Operations
  { title: "Talent Acquisition", href: "/ats" as Route, icon: Users, section: "Talent", permission: "recruitment.read" },
  { title: "Job Requisitions", href: "/ats" as Route, icon: Briefcase, section: "Talent", permission: "recruitment.read" },
  { title: "Candidates Database", href: "/ats" as Route, icon: Users, section: "Talent", permission: "candidates.read" },
  { title: "Hiring Pipeline", href: "/ats" as Route, icon: Sparkles, section: "Talent", permission: "applications.read" },
  { title: "Interviews Schedule", href: "/ats" as Route, icon: Clock, section: "Talent", permission: "interviews.read" },
  { title: "Offer Management", href: "/ats" as Route, icon: CheckCircle2, section: "Talent", permission: "offers.read" },
  { title: "Preboarding Tasks", href: "/ats" as Route, icon: FolderOpen, section: "Talent", permission: "preboarding.read" },
  { title: "Performance & OKRs", href: "/performance" as Route, icon: Sparkles, section: "Management" },
  { title: "Learning LMS", href: "/learning" as Route, icon: GraduationCap, section: "Management" },
  { title: "Enterprise Payroll", href: "/payroll" as Route, icon: CreditCard, section: "Management", permission: "payroll.read" },
  { title: "Asset Management", href: "/assets" as Route, icon: Laptop, section: "Management" },
  { title: "Platform Admin Center", href: "/admin" as Route, icon: ShieldCheck, section: "Management", permission: "tenant.settings.read" }
];

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const permissions = useSessionStore((state) => state.permissions);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "j" || e.key === "k") && (e.metaKey || e.ctrlKey)) {
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
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 font-normal"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden sm:inline text-xs">Search...</span>
        <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search workforce, modules, and commands…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
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
                        <Icon className="size-4 text-muted-foreground" />
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
