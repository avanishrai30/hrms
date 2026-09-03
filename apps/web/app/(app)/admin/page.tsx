"use client";

import { useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Settings,
  Users,
  Lock,
  Activity,
  FileCheck2,
  Workflow,
  Cpu,
  Key,
  CreditCard,
  Building2,
  HelpCircle,
  Clock,
  Radio,
  Sliders,
  ChevronRight,
  Search,
  CheckCircle2
} from "lucide-react";
import { Badge, Panel } from "../../../components/ui";
import { useSessionStore } from "../../../lib/session-store";
import type { PermissionCode } from "@vc-wms/shared-types";

interface AdminModule {
  title: string;
  description: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionCode;
  badge?: string;
  badgeVariant?: "success" | "neutral" | "warning";
}

interface AdminSection {
  category: string;
  description: string;
  modules: AdminModule[];
}

const ADMIN_SECTIONS: AdminSection[] = [
  {
    category: "Security & Governance",
    description: "Access controls, security anomaly detection, and compliance audit trail.",
    modules: [
      {
        title: "Security Incidents & Alerts",
        description: "Monitor real-time security alerts, unusual login behaviors, and incident resolutions.",
        href: "/admin/security" as Route,
        icon: Shield,
        permission: "security.manage",
        badge: "Critical",
        badgeVariant: "warning"
      },
      {
        title: "Audit & Compliance Trail",
        description: "Immutable record of all tenant mutations, administrative updates, and security logs.",
        href: "/audit-logs" as Route,
        icon: FileCheck2,
        permission: "security.view"
      },
      {
        title: "Biometric Security & Liveness",
        description: "Review facial recognition verification rates, anti-spoof logs, and device authorizations.",
        href: "/admin/biometric-audit" as Route,
        icon: Lock,
        permission: "security.manage"
      },
      {
        title: "System Health & Uptime",
        description: "Real-time probe monitoring database connection, Redis queues, and memory utilization.",
        href: "/admin/system-health" as Route,
        icon: Activity,
        permission: "security.manage",
        badge: "Live",
        badgeVariant: "success"
      }
    ]
  },
  {
    category: "AI & Platform Intelligence",
    description: "LLM provider configurations, safety shields, and autonomous workforce agents.",
    modules: [
      {
        title: "AI Model & Privacy Governance",
        description: "Configure Google Gemini, OpenAI keys, hyperparameters, PII masking, and prompt shields.",
        href: "/admin/ai-settings" as Route,
        icon: Cpu,
        permission: "tenant.settings.read",
        badge: "Configured",
        badgeVariant: "success"
      },
      {
        title: "Executive Intelligence Cockpit",
        description: "Cross-functional insights, attrition risk radars, and workforce cost analytics.",
        href: "/admin/executive-intelligence" as Route,
        icon: Sparkles,
        permission: "analytics.view"
      },
      {
        title: "Approval Workflow Engines",
        description: "Configure multi-level conditional approval chains for leaves, compensation, and assets.",
        href: "/admin/approvals" as Route,
        icon: Workflow,
        permission: "tenant.settings.update"
      },
      {
        title: "Workflow Automations",
        description: "Manage trigger-action automation rules and scheduled workforce pipeline jobs.",
        href: "/admin/workflows" as Route,
        icon: Sliders,
        permission: "tenant.settings.update"
      }
    ]
  },
  {
    category: "Tenant & Access Administration",
    description: "Organization parameters, branding, RBAC permission roles, and user memberships.",
    modules: [
      {
        title: "Tenant Settings",
        description: "Manage organization profile, default currency, timezones, and payroll cycles.",
        href: "/settings/tenant" as Route,
        icon: Building2,
        permission: "tenant.settings.read"
      },
      {
        title: "Branding & Appearance",
        description: "Customize tenant brand colors, enterprise logos, favicons, and PWA metadata.",
        href: "/settings/branding" as Route,
        icon: Settings,
        permission: "tenant.branding.read"
      },
      {
        title: "Roles & Permissions (RBAC)",
        description: "Define custom roles and inspect granular resource permissions across all domains.",
        href: "/settings/roles" as Route,
        icon: Key,
        permission: "roles.read"
      },
      {
        title: "User Accounts & Memberships",
        description: "Manage tenant user accounts, employee account linkages, and access invitations.",
        href: "/users" as Route,
        icon: Users,
        permission: "users.read"
      }
    ]
  },
  {
    category: "Operations & Workforce Audit",
    description: "Operational logs, attendance muster audits, payroll reconciliations, and terminal fleet.",
    modules: [
      {
        title: "Attendance Overrides & Muster",
        description: "Audit manual punch adjustments, verify location geofences, and review anomalies.",
        href: "/admin/attendance" as Route,
        icon: Clock,
        permission: "attendance.update"
      },
      {
        title: "Payroll & Compensation Audit",
        description: "Audit compensation component structures, formula revisions, and settlement ledgers.",
        href: "/admin/payroll-audit" as Route,
        icon: CreditCard,
        permission: "payroll.process"
      },
      {
        title: "Biometric Terminal Fleet",
        description: "Inspect hardware punch terminals, sync intervals, and offline device fallbacks.",
        href: "/admin/device-monitoring" as Route,
        icon: Radio,
        permission: "location.audit"
      },
      {
        title: "Helpdesk & Service Delivery",
        description: "Configure ticket routing, category queues, SLA thresholds, and resolution escalations.",
        href: "/admin/helpdesk" as Route,
        icon: HelpCircle,
        permission: "tenant.settings.read"
      }
    ]
  }
];

export default function AdminHubPage() {
  const { permissions } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return ADMIN_SECTIONS.map((section) => {
      const filteredModules = section.modules.filter((mod) => {
        // Permission check
        if (mod.permission && permissions.length > 0 && !permissions.includes(mod.permission)) {
          return false;
        }

        // Search query filter
        if (!q) return true;
        return (
          mod.title.toLowerCase().includes(q) ||
          mod.description.toLowerCase().includes(q) ||
          section.category.toLowerCase().includes(q)
        );
      });

      return {
        ...section,
        modules: filteredModules
      };
    }).filter((section) => section.modules.length > 0);
  }, [permissions, searchQuery]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Shield className="size-4 text-primary" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">
            Admin Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure tenant security, RBAC policies, AI intelligence boundaries, and system operations.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Filter admin modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Panel className="p-4 rounded-xl border border-border bg-card flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Platform RBAC</div>
            <div className="text-sm font-bold text-foreground">Strict Isolation Active</div>
          </div>
        </Panel>

        <Panel className="p-4 rounded-xl border border-border bg-card flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Cpu className="size-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">AI Governance</div>
            <div className="text-sm font-bold text-foreground">Prompt Shields Enforced</div>
          </div>
        </Panel>

        <Panel className="p-4 rounded-xl border border-border bg-card flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Audit Compliance</div>
            <div className="text-sm font-bold text-foreground">Immutable Logging Enabled</div>
          </div>
        </Panel>
      </div>

      {/* Categorized Admin Modules */}
      <div className="space-y-10">
        {filteredSections.map((section) => (
          <div key={section.category} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {section.category}
              </h2>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="group block p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                          <Icon className="size-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                              {mod.title}
                            </span>
                            {mod.badge && (
                              <Badge
                                tone={
                                  mod.badgeVariant === "success"
                                    ? "success"
                                    : mod.badgeVariant === "warning"
                                    ? "warning"
                                    : "neutral"
                                }
                              >
                                {mod.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border">
            <Search className="size-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No administrative modules match your search.</p>
            <p className="text-xs text-muted-foreground mt-1">Try searching with a different term or clear the filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
