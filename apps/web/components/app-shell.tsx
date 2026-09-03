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
  EllipsisVertical,
  ChevronRight,
  PlusCircle,
  Command,
  MapPin,
  BarChart3
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from "./ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
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

interface NavSubItem {
  href: Route;
  label: string;
  permission?: PermissionCode;
}

interface NavItem {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionCode;
  badge?: string;
  subItems?: NavSubItem[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard" as Route, label: "Home", icon: Home },
      {
        href: "/ai" as Route,
        label: "AI Copilot",
        icon: Sparkles,
        subItems: [
          { href: "/ai" as Route, label: "Workspace" },
          { href: "/ai/insights" as Route, label: "Smart Insights" },
          { href: "/ai/predictions" as Route, label: "Workforce Predictions" },
          { href: "/ai/automations" as Route, label: "Automations" }
        ]
      },
      { href: "/analytics" as Route, label: "Analytics", icon: BarChart3 }
    ]
  },
  {
    title: "Workforce",
    items: [
      { href: "/directory" as Route, label: "Directory", icon: Building2 },
      { href: "/employees" as Route, label: "Employees", icon: Users, permission: "employees.read" },
      {
        href: "/organization" as Route,
        label: "Organization",
        icon: Briefcase,
        permission: "organization.view",
        subItems: [
          { href: "/organization" as Route, label: "Structure" },
          { href: "/organization/teams" as Route, label: "Teams" },
          { href: "/org-chart" as Route, label: "Hierarchy Chart" }
        ]
      },
      { href: "/locations" as Route, label: "Locations", icon: MapPin, permission: "location.view" }
    ]
  },
  {
    title: "Time & Leave",
    items: [
      { href: "/attendance" as Route, label: "Attendance", icon: Clock },
      {
        href: "/leave" as Route,
        label: "Leave",
        icon: Calendar,
        subItems: [
          { href: "/leave" as Route, label: "Balances & Requests" },
          { href: "/leave/calendar" as Route, label: "Team Calendar" }
        ]
      }
    ]
  },
  {
    title: "Self Service",
    items: [
      { href: "/profile" as Route, label: "Profile", icon: CircleUser },
      { href: "/payslips" as Route, label: "Payslips", icon: CreditCard },
      { href: "/documents" as Route, label: "Documents", icon: FolderOpen },
      { href: "/requests" as Route, label: "Requests", icon: CheckCircle2 },
      { href: "/id-card" as Route, label: "Digital ID", icon: ShieldCheck }
    ]
  },
  {
    title: "Enterprise",
    items: [
      { href: "/ats" as Route, label: "Talent", icon: Users, permission: "recruitment.read" },
      { href: "/payroll" as Route, label: "Payroll", icon: CreditCard, permission: "payroll.read" },
      { href: "/performance" as Route, label: "Performance", icon: Sparkles },
      { href: "/learning" as Route, label: "Learning", icon: GraduationCap },
      { href: "/assets" as Route, label: "Assets", icon: Laptop },
      { href: "/admin" as Route, label: "Admin Center", icon: ShieldCheck, permission: "tenant.settings.read" }
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
        {/* 1. Sidebar Brand Header (Studio Admin Geometry) */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href={"/dashboard" as Route} prefetch={false}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">AIavro HRMS</span>
                    <span className="truncate text-xs text-muted-foreground">VC Organics</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* 2. Grouped Navigation Content */}
        <SidebarContent>
          {/* Quick Create Section */}
          <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Quick Create"
                        className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground cursor-pointer"
                      >
                        <PlusCircle className="size-4 shrink-0" />
                        <span className="font-medium">Quick Create</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-52 rounded-lg">
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={"/leave" as Route} className="cursor-pointer">Apply Leave</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={"/attendance" as Route} className="cursor-pointer">Log Attendance</Link>
                      </DropdownMenuItem>
                      {permissions.includes("employees.read") && (
                        <DropdownMenuItem asChild>
                          <Link href={"/employees" as Route} className="cursor-pointer">Add Employee</Link>
                        </DropdownMenuItem>
                      )}
                      {permissions.includes("recruitment.read") && (
                        <DropdownMenuItem asChild>
                          <Link href={"/ats" as Route} className="cursor-pointer">Create Requisition</Link>
                        </DropdownMenuItem>
                      )}
                      {permissions.includes("location.view") && (
                        <DropdownMenuItem asChild>
                          <Link href={"/locations" as Route} className="cursor-pointer">Create Location</Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Nav Sections */}
          {navSections.map((section) => {
            const filteredItems = section.items.filter((item) => {
              if (!item.permission) return true;
              return permissions.includes(item.permission);
            });

            if (filteredItems.length === 0) return null;

            return (
              <SidebarGroup key={section.title}>
                {section.title && (
                  <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/80">
                    {section.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const hasSubs = Boolean(item.subItems && item.subItems.length > 0);
                      const isParentActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}`));

                      if (hasSubs && item.subItems) {
                        return (
                          <Collapsible
                            key={item.href}
                            asChild
                            defaultOpen={isParentActive}
                            className="group/collapsible"
                          >
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                  tooltip={item.label}
                                  isActive={isParentActive}
                                >
                                  <Icon className="size-4 shrink-0" />
                                  <span>{item.label}</span>
                                  <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {item.subItems.map((sub) => {
                                    const isSubActive = pathname === sub.href;
                                    return (
                                      <SidebarMenuSubItem key={sub.href}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={isSubActive}
                                        >
                                          <Link href={sub.href} prefetch={false}>
                                            <span>{sub.label}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    );
                                  })}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                        );
                      }

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isParentActive}
                            tooltip={item.label}
                          >
                            <Link href={item.href} prefetch={false}>
                              <Icon className="size-4 shrink-0" />
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

        {/* 3. Sidebar Footer with NavUser */}
        <SidebarFooter>
          <NavUserSection />
        </SidebarFooter>
      </Sidebar>

      {/* 4. Main Inset Area with Standard Studio Admin Header */}
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 lg:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
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
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-2 pl-1">
              <Avatar className="h-7 w-7 rounded-lg">
                {profile?.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback className="rounded-lg text-xs">
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

        {/* 5. Page Content Container (Studio Admin Content Rhythm) */}
        <div className="min-h-0 min-w-0 flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
