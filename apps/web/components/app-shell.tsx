"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@vc-wms/ui";
import { useSessionStore } from "../lib/session-store";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Home" },
  { href: "/ai" as Route, label: "✨ AI Copilot" },
  { href: "/analytics/ai" as Route, label: "📈 AI Intelligence" },
  { href: "/ai/knowledge-base" as Route, label: "📚 Policy RAG" },
  { href: "/ess" as Route, label: "🌟 ESS Dashboard" },
  { href: "/profile" as Route, label: "My Profile" },
  { href: "/documents" as Route, label: "Document Vault" },
  { href: "/requests" as Route, label: "My Requests" },
  { href: "/announcements" as Route, label: "Announcements" },
  { href: "/id-card" as Route, label: "Digital ID Card" },
  { href: "/directory" as Route, label: "Directory" },
  { href: "/mobile-settings" as Route, label: "PWA Settings" },
  { href: "/notifications" as Route, label: "Notifications" },
  { href: "/organization" as Route, label: "Organization Structure" },
  { href: "/organization/business-units" as Route, label: "Business Units" },
  { href: "/organization/teams" as Route, label: "Teams & Squads" },
  { href: "/approvals" as Route, label: "My Approvals" },
  { href: "/workflows" as Route, label: "Workflows Tracker" },
  { href: "/attendance" as Route, label: "Attendance" },
  { href: "/attendance/command-center" as Route, label: "🛰️ Attendance Command" },
  { href: "/attendance/shifts" as Route, label: "⏰ Shift Templates" },
  { href: "/attendance/rosters" as Route, label: "📅 Shift Rosters" },
  { href: "/attendance/swaps" as Route, label: "🔄 Shift Swaps" },
  { href: "/attendance/biometric" as Route, label: "📟 Biometric Stream" },
  { href: "/attendance/devices" as Route, label: "📟 Biometric Devices" },
  { href: "/attendance/geofence" as Route, label: "📍 GPS Geofences" },
  { href: "/attendance/face" as Route, label: "👤 Face Attendance" },
  { href: "/attendance/overtime" as Route, label: "⏱️ Overtime" },
  { href: "/attendance/anomalies" as Route, label: "⚠️ Anomalies & Fraud" },
  { href: "/attendance/productivity" as Route, label: "📊 Labor Productivity" },
  { href: "/attendance/workforce-scheduling" as Route, label: "⚡ Workforce Scheduling" },
  { href: "/admin/attendance-intelligence" as Route, label: "📊 Attendance Intel" },
  { href: "/admin/device-monitoring" as Route, label: "📟 Device Monitoring" },
  { href: "/admin/workforce-operations" as Route, label: "⚙️ Contractor Ops" },
  { href: "/leave" as Route, label: "Leaves" },
  { href: "/leave/calendar" as Route, label: "Leave Calendar" },
  { href: "/admin/leave-audit" as Route, label: "Leave Approvals" },
  { href: "/admin/leave-policies" as Route, label: "Leave Policies" },
  { href: "/compensation" as Route, label: "Compensation" },
  { href: "/compensation/templates" as Route, label: "Salary Templates" },
  { href: "/compensation/history" as Route, label: "Salary History" },
  { href: "/admin/compensation-audit" as Route, label: "Compensation Audit" },
  { href: "/payroll" as Route, label: "Payroll Dashboard" },
  { href: "/payroll/run" as Route, label: "Run Payroll" },
  { href: "/payroll/history" as Route, label: "Payroll History" },
  { href: "/admin/payroll-audit" as Route, label: "Payroll Audit" },
  { href: "/payslips" as Route, label: "My Payslips" },
  { href: "/admin/payslips" as Route, label: "Admin Payslips" },
  { href: "/admin/payslip-distribution" as Route, label: "Payslip Distribution" },
  { href: "/admin/payslip-audit" as Route, label: "Payslip Audit" },
  { href: "/compliance" as Route, label: "Statutory Compliance" },
  { href: "/compliance/rules" as Route, label: "Compliance Rules" },
  { href: "/compliance/snapshots" as Route, label: "Compliance Snapshots" },
  { href: "/compliance/reports" as Route, label: "Statutory Reports" },
  { href: "/admin/compliance-audit" as Route, label: "Compliance Audit" },
  { href: "/ai/history" as Route, label: "AI Conversations" },
  { href: "/ai/knowledge-base" as Route, label: "AI Knowledge Base" },
  { href: "/analytics/ai" as Route, label: "AI Workforce Analytics" },
  { href: "/ats" as Route, label: "🎯 ATS Dashboard" },
  { href: "/ats/pipeline" as Route, label: "📋 Hiring Pipeline" },
  { href: "/ats/candidates" as Route, label: "👥 Candidates" },
  { href: "/ats/jobs" as Route, label: "💼 Job Requisitions" },
  { href: "/ats/interviews" as Route, label: "🗓️ Interviews" },
  { href: "/ats/offers" as Route, label: "📄 Offers & Approvals" },
  { href: "/ats/preboarding" as Route, label: "🛂 Preboarding" },
  { href: "/ats/analytics" as Route, label: "📊 Recruitment Analytics" },
  { href: "/admin/recruitment-dashboard" as Route, label: "🤖 AI Talent Radar" },
  { href: "/performance" as Route, label: "🌟 PMS Dashboard" },
  { href: "/performance/goals" as Route, label: "🎯 Goals & OKRs" },
  { href: "/performance/checkins" as Route, label: "⏱️ OKR Check-Ins" },
  { href: "/performance/feedback" as Route, label: "💬 Continuous Feedback" },
  { href: "/performance/360" as Route, label: "🔄 360° Feedback" },
  { href: "/performance/1on1" as Route, label: "🤝 1:1 Meetings" },
  { href: "/performance/reviews" as Route, label: "📑 Performance Reviews" },
  { href: "/performance/appraisals" as Route, label: "🔄 360° Appraisals" },
  { href: "/performance/competencies" as Route, label: "🧭 Competency Matrix" },
  { href: "/performance/development" as Route, label: "🌱 Career Development" },
  { href: "/performance/career-paths" as Route, label: "🧭 Career Paths" },
  { href: "/performance/calibration" as Route, label: "⚖️ Bell Curve Calibration" },
  { href: "/performance/talent-review" as Route, label: "🏛️ 9-Box Talent Review" },
  { href: "/performance/promotions" as Route, label: "🚀 Promotion Engine" },
  { href: "/performance/succession" as Route, label: "🗺️ Succession & 9-Box" },
  { href: "/performance/analytics" as Route, label: "📈 PMS Analytics" },
  { href: "/admin/performance-settings" as Route, label: "⚙️ PMS Settings" },
  { href: "/admin/review-cycles" as Route, label: "⏳ Review Cycles" },
  { href: "/admin/review-templates" as Route, label: "📝 Review Templates" },
  { href: "/admin/competency-framework" as Route, label: "🧭 Competency Framework" },
  { href: "/admin/talent-intelligence" as Route, label: "🤖 Talent Intelligence" },
  { href: "/admin/calibration" as Route, label: "🏛️ Calibration Admin" },
  { href: "/learning" as Route, label: "🎓 LMS Academy" },
  { href: "/learning/catalog" as Route, label: "📚 Course Catalog" },
  { href: "/learning/my-courses" as Route, label: "📖 My Courses" },
  { href: "/learning/learning-paths" as Route, label: "🛣️ Learning Paths" },
  { href: "/learning/assessments" as Route, label: "📝 Examinations" },
  { href: "/learning/certifications" as Route, label: "🏆 Certifications" },
  { href: "/learning/calendar" as Route, label: "🗓️ Training Calendar" },
  { href: "/learning/skills" as Route, label: "🧠 Skill Matrix" },
  { href: "/admin/training" as Route, label: "🏛️ LMS Admin" },
  { href: "/admin/courses" as Route, label: "📚 Course Authoring" },
  { href: "/admin/assessments" as Route, label: "📝 Exam Designer" },
  { href: "/admin/certifications" as Route, label: "🏆 Credential Master" },
  { href: "/admin/instructors" as Route, label: "👨‍🏫 Instructors" },
  { href: "/admin/skill-matrix" as Route, label: "🧠 Skill Taxonomy" },
  { href: "/admin/compliance-training" as Route, label: "🛡️ Compliance LMS" },
  { href: "/admin/learning-analytics" as Route, label: "📈 LMS Analytics" },
  { href: "/workforce" as Route, label: "🌐 Workforce Planning" },
  { href: "/workforce/positions" as Route, label: "🏛️ Position Master" },
  { href: "/workforce/headcount" as Route, label: "📊 Headcount Planning" },
  { href: "/workforce/cost-planning" as Route, label: "💰 Cost Simulator" },
  { href: "/workforce/org-chart" as Route, label: "🌲 Dynamic Org Chart" },
  { href: "/workforce/succession" as Route, label: "🗺️ Succession Planning" },
  { href: "/workforce/bench-strength" as Route, label: "🛡️ Bench Strength" },
  { href: "/workforce/attrition" as Route, label: "🔮 Flight Risk Predictor" },
  { href: "/workforce/skill-gaps" as Route, label: "🧠 Skill Supply & Demand" },
  { href: "/workforce/forecasting" as Route, label: "📈 Workforce Forecasts" },
  { href: "/workforce/analytics" as Route, label: "📊 Workforce Analytics" },
  { href: "/admin/chro-dashboard" as Route, label: "👔 CHRO Cockpit" },
  { href: "/admin/workforce-intelligence" as Route, label: "🌐 CEO Intelligence" },
  { href: "/admin/org-design" as Route, label: "🛠️ Org Restructure Sandbox" },
  { href: "/assets" as Route, label: "💻 Asset Register" },
  { href: "/assets/inventory" as Route, label: "📦 Inventory & Stock" },
  { href: "/assets/licenses" as Route, label: "🔑 Software Licenses" },
  { href: "/assets/maintenance" as Route, label: "🛠️ Asset Maintenance" },
  { href: "/assets/depreciation" as Route, label: "📉 Asset Depreciation" },
  { href: "/helpdesk" as Route, label: "🎫 ITSM Helpdesk" },
  { href: "/helpdesk/tickets" as Route, label: "📋 Support Tickets" },
  { href: "/helpdesk/sla" as Route, label: "⏱️ SLA Performance" },
  { href: "/facilities" as Route, label: "🏢 Facilities" },
  { href: "/facilities/bookings" as Route, label: "📅 Room Bookings" },
  { href: "/facilities/desks" as Route, label: "🪑 Desk Allocation" },
  { href: "/vehicles" as Route, label: "🚗 Fleet & Vehicles" },
  { href: "/visitors" as Route, label: "🛂 Visitor Management" },
  { href: "/gate-passes" as Route, label: "🚪 Gate Passes" },
  { href: "/clearance" as Route, label: "📤 Exit Clearance" },
  { href: "/expenses" as Route, label: "Expenses" },
  { href: "/travel" as Route, label: "Travel" },
  { href: "/my-reimbursements" as Route, label: "My Reimbursements" },
  { href: "/finance" as Route, label: "Finance" },
  { href: "/finance/accounts" as Route, label: "Chart of Accounts" },
  { href: "/finance/gl" as Route, label: "General Ledger" },
  { href: "/finance/journals" as Route, label: "Journals" },
  { href: "/finance/periods" as Route, label: "Accounting Periods" },
  { href: "/finance/banks" as Route, label: "Banking" },
  { href: "/finance/reconciliation" as Route, label: "Bank Reconciliation" },
  { href: "/finance/vendors" as Route, label: "Vendors" },
  { href: "/finance/payables" as Route, label: "Accounts Payable" },
  { href: "/finance/receivables" as Route, label: "Accounts Receivable" },
  { href: "/finance/invoices" as Route, label: "Invoices" },
  { href: "/finance/gst" as Route, label: "GST" },
  { href: "/finance/taxes" as Route, label: "Tax Ledger" },
  { href: "/finance/erp" as Route, label: "ERP Integrations" },
  { href: "/finance/expenses" as Route, label: "Finance Expenses" },
  { href: "/finance/travel" as Route, label: "Finance Travel" },
  { href: "/finance/budgets" as Route, label: "Budgets" },
  { href: "/finance/reimbursements" as Route, label: "Reimbursements" },
  { href: "/finance/reports" as Route, label: "Finance Reports" },
  { href: "/admin/finance-dashboard" as Route, label: "Finance Dashboard" },
  { href: "/admin/finance-intelligence" as Route, label: "Finance Intelligence" },
  { href: "/admin/operations-dashboard" as Route, label: "📊 Operations Dashboard" },
  { href: "/analytics" as Route, label: "Analytics Hub" },
  { href: "/analytics/executive" as Route, label: "Executive Intelligence" },
  { href: "/analytics/workforce" as Route, label: "Workforce Analytics" },
  { href: "/analytics/attendance" as Route, label: "Attendance Analytics" },
  { href: "/analytics/leave" as Route, label: "Leave Analytics" },
  { href: "/analytics/payroll" as Route, label: "Payroll Analytics" },
  { href: "/analytics/compliance" as Route, label: "Compliance Analytics" },
  { href: "/analytics/face" as Route, label: "Biometrics Analytics" },
  { href: "/analytics/organization" as Route, label: "Organization Analytics" },
  { href: "/reports" as Route, label: "Reports Catalog" },
  { href: "/reports/builder" as Route, label: "Report Builder" },
  { href: "/reports/saved" as Route, label: "Saved Reports" },
  { href: "/reports/scheduled" as Route, label: "Scheduled Reports" },
  { href: "/admin/dashboard-builder" as Route, label: "Dashboard Designer" },
  { href: "/admin/analytics-audit" as Route, label: "Analytics Audit" },
  { href: "/face" as Route, label: "Biometrics" },
  { href: "/admin/attendance" as Route, label: "Admin Attendance" },
  { href: "/attendance/corrections" as Route, label: "Corrections" },
  { href: "/locations" as Route, label: "Locations" },
  { href: "/admin/location-audit" as Route, label: "Location Audit" },
  { href: "/admin/biometric-audit" as Route, label: "Biometric Audit" },
  { href: "/employees", label: "Employees" },
  { href: "/admin/ai-settings" as Route, label: "⚙️ AI Controls" },
  { href: "/admin/notification-templates" as Route, label: "Notification Templates" },
  { href: "/admin/workflows" as Route, label: "Workflow Config" },
  { href: "/admin/approvals" as Route, label: "Approval Config" },
  { href: "/admin/system-health" as Route, label: "System Health" },
  { href: "/integrations" as Route, label: "🔌 Integrations Hub" },
  { href: "/integrations/api" as Route, label: "🔑 API Management" },
  { href: "/integrations/webhooks" as Route, label: "⚡ Webhooks" },
  { href: "/integrations/connectors" as Route, label: "🧩 Connectors" },
  { href: "/integrations/sso" as Route, label: "🛡️ SSO & IdP" },
  { href: "/automation" as Route, label: "⚙️ Automation" },
  { href: "/automation/builder" as Route, label: "🛠️ Workflow Builder" },
  { href: "/automation/history" as Route, label: "📜 Workflow History" },
  { href: "/automation/templates" as Route, label: "📋 Workflow Templates" },
  { href: "/ai-assistant" as Route, label: "🤖 AI Assistant" },
  { href: "/knowledge" as Route, label: "📚 Knowledge Base" },
  { href: "/knowledge/categories" as Route, label: "📁 KB Categories" },
  { href: "/admin/integration-health" as Route, label: "🩺 Integration Health" },
  { href: "/admin/api-monitoring" as Route, label: "📈 API Monitoring" },
  { href: "/admin/webhook-monitoring" as Route, label: "📊 Webhook Monitoring" },
  { href: "/settings/tenant", label: "Settings" },
  { href: "/settings/roles", label: "Roles" },
  { href: "/audit-logs", label: "Audit" }
];

const mobileNavItems: Array<{ href: Route; label: string }> = [
  { href: "/ai" as Route, label: "AI" },
  { href: "/ess" as Route, label: "ESS" },
  { href: "/profile" as Route, label: "Profile" },
  { href: "/requests" as Route, label: "Requests" },
  { href: "/id-card" as Route, label: "ID Card" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tenantName = useSessionStore((state) => state.tenantName);

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface p-4 lg:block overflow-y-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-panel bg-primary text-sm font-semibold text-white">W</div>
          <div>
            <p className="text-sm font-semibold text-zinc-950">{tenantName}</p>
            <p className="text-xs text-zinc-500">Workforce platform</p>
          </div>
        </div>
        <nav className="grid gap-1 pb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-control px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-muted hover:text-zinc-950",
                pathname.startsWith(item.href) && "bg-muted text-zinc-950"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-canvas/95 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{tenantName}</p>
          <p className="text-xs text-zinc-500">Tenant-scoped workspace</p>
        </div>
        <button className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-zinc-700" type="button">
          Cmd K
        </button>
      </header>
      <main className="pb-20 lg:ml-64 lg:pb-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 grid h-16 grid-cols-5 border-t border-border bg-surface lg:hidden">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "grid place-items-center text-xs font-medium text-zinc-500",
              pathname.startsWith(item.href) && "text-primary"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
