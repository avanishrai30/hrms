"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
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
  Bell,
  Sun,
  Moon,
  LogOut,
  CircleUser,
  EllipsisVertical
} from "lucide-react";
import type { PermissionCode } from "@vc-wms/shared-types";
import { useSessionStore } from "../lib/session-store";
import { useEmployeeProfile } from "../lib/queries/use-dashboard-queries";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { SearchDialog } from "./search-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

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
    title: "Overview",
    items: [
      { href: "/dashboard" as Route, label: "Home Dashboard", icon: Home },
      { href: "/ai" as Route, label: "AI Copilot", icon: Sparkles },
      { href: "/directory" as Route, label: "Workforce Directory", icon: Building2 }
    ]
  },
  {
    title: "People & Organization",
    items: [
      { href: "/employees" as Route, label: "Employees", icon: Users, permission: "employees.read" },
      { href: "/organization" as Route, label: "Organization Structure", icon: Building2, permission: "organization.view" },
      { href: "/org-chart" as Route, label: "Org Hierarchy Chart", icon: Briefcase },
      { href: "/organization/business-units" as Route, label: "Business Units", icon: Building2, permission: "organization.view" },
      { href: "/organization/teams" as Route, label: "Teams", icon: Users, permission: "organization.view" },
      { href: "/locations" as Route, label: "Work Locations", icon: Building2, permission: "location.view" }
    ]
  },
  {
    title: "Time & Schedule",
    items: [
      { href: "/attendance" as Route, label: "Attendance Tracker", icon: Clock },
      { href: "/leave" as Route, label: "Leave & Time Off", icon: Calendar },
      { href: "/leave/calendar" as Route, label: "Team Calendar", icon: Calendar }
    ]
  },
  {
    title: "Employee Self Service",
    items: [
      { href: "/profile" as Route, label: "My Profile", icon: CircleUser },
      { href: "/payslips" as Route, label: "My Payslips", icon: CreditCard },
      { href: "/documents" as Route, label: "My Documents", icon: FolderOpen },
      { href: "/requests" as Route, label: "Service Requests", icon: CheckCircle2 },
      { href: "/id-card" as Route, label: "Digital ID Card", icon: ShieldCheck }
    ]
  },
  {
    title: "Manager Workspace",
    items: [
      { href: "/mss" as Route, label: "Manager Overview", icon: Users, permission: "mss.read" },
      { href: "/mss/team" as Route, label: "Direct Reports", icon: Users, permission: "mss.read" },
      { href: "/mss/approvals" as Route, label: "Pending Approvals", icon: CheckCircle2, permission: "mss.read" }
    ]
  },
  {
    title: "Enterprise Modules",
    items: [
      { href: "/ats" as Route, label: "Talent Acquisition", icon: Users, permission: "recruitment.read" },
      { href: "/payroll" as Route, label: "Enterprise Payroll", icon: CreditCard, permission: "payroll.read" },
      { href: "/performance" as Route, label: "Performance & OKRs", icon: Sparkles },
      { href: "/learning" as Route, label: "Learning LMS", icon: GraduationCap },
      { href: "/assets" as Route, label: "Asset Management", icon: Laptop },
      { href: "/vendors" as Route, label: "Vendor Ecosystem", icon: ShieldCheck, permission: "vendors.manage" }
    ]
  }
];

function NavUserSection() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { clear } = useSessionStore();
  const { data: profile } = useEmployeeProfile();

  const handleLogout = () => {
    clear();
    router.push("/login" as Route);
  };

  const name = profile?.fullName || "";
  const email = profile?.workEmail || profile?.email || "";
  const initial = name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {profile?.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={name} /> : null}
                <AvatarFallback className="rounded-lg">
                  {initial || <CircleUser className="size-4 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name || "—"}</span>
                <span className="truncate text-muted-foreground text-xs">{email || "—"}</span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {profile?.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={name} /> : null}
                  <AvatarFallback className="rounded-lg">
                    {initial || <CircleUser className="size-4 text-muted-foreground" />}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name || "—"}</span>
                  <span className="truncate text-muted-foreground text-xs">{email || "—"}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={"/profile" as Route} className="cursor-pointer">
                  <CircleUser className="size-4 mr-2" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/id-card" as Route} className="cursor-pointer">
                  <ShieldCheck className="size-4 mr-2" />
                  <span>Digital ID Card</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="size-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { permissions, hydrateFromStorage, isHydrated } = useSessionStore();
  const { data: profile } = useEmployeeProfile();
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    if (!isHydrated) {
      hydrateFromStorage();
    }
  }, [hydrateFromStorage, isHydrated]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const name = profile?.fullName || "";
  const initial = name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : null;

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon">
        {/* 1. Sidebar Brand Header */}
        <SidebarHeader>
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-sm shadow-xs shrink-0">
              A
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
              <span className="text-xs font-bold tracking-tight text-foreground truncate">AIavro HRMS</span>
              <span className="text-[10px] text-muted-foreground truncate">VC Organics</span>
            </div>
          </div>
        </SidebarHeader>

        {/* 2. Grouped Navigation Content */}
        <SidebarContent>
          {navSections.map((section) => {
            const filteredItems = section.items.filter((item) => {
              if (!item.permission) return true;
              return permissions.includes(item.permission);
            });

            if (filteredItems.length === 0) return null;

            return (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}/`));

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                            <Link href={item.href} prefetch={false}>
                              <Icon />
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        {/* 3. Sidebar Footer with Exact NavUser */}
        <SidebarFooter>
          <NavUserSection />
        </SidebarFooter>
      </Sidebar>

      {/* 4. Main Inset Area with Standard Studio Admin Header */}
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 lg:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <SearchDialog />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-2 pl-1">
              <Avatar className="h-7 w-7">
                {profile?.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback>
                  {initial || <CircleUser className="size-3.5 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-foreground">{name || "—"}</span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  {typeof profile?.designation === "string" ? profile.designation : profile?.designation?.name || "—"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 5. Page Content Container */}
        <div className="min-h-0 min-w-0 flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
