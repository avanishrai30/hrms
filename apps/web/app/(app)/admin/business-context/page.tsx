"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  Building2,
  Scale,
  Sparkles,
  Users,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Globe2,
  Clock,
  Landmark
} from "lucide-react";
import { apiRequest } from "../../../../lib/api";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";

interface TenantSettingsResponse {
  id: string;
  timezone: string;
  locale: string;
  currency: string;
  weekStartDay: number;
  payrollCycleDay: number;
  attendanceTimezone: string;
  defaultWorkingDaysPerMonth: number;
  metadata?: Record<string, unknown>;
}

interface TenantInfoResponse {
  id: string;
  name: string;
  slug: string;
  legalName: string;
  plan: string;
  settings?: TenantSettingsResponse;
}

export default function BusinessContextPage() {
  const [activeTab, setActiveTab] = useState<"legal" | "statutory" | "workforce" | "ai" | "contacts">("statutory");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Legal & Entity state
  const [legalName, setLegalName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstinNumber, setGstinNumber] = useState("");
  const [incorporationDate, setIncorporationDate] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");

  // Statutory & Payroll state
  const [statutoryJurisdiction, setStatutoryJurisdiction] = useState("IN");
  const [pfPolicyVersion, setPfPolicyVersion] = useState("IN-EPF-2024");
  const [esiPolicyVersion, setEsiPolicyVersion] = useState("IN-ESI-2024");
  const [policyAppliesFrom, setPolicyAppliesFrom] = useState("2024-01-01");
  const [currency, setCurrency] = useState("INR");
  const [payrollCycleDay, setPayrollCycleDay] = useState(25);
  const [defaultWorkingDaysPerMonth, setDefaultWorkingDaysPerMonth] = useState(26);

  // Workforce state
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [locale, setLocale] = useState("en-IN");
  const [weekStartDay, setWeekStartDay] = useState(1);
  const [standardDailyHours, setStandardDailyHours] = useState(8.5);
  const [probationMonths, setProbationMonths] = useState(3);

  // AI Context & Grounding
  const [companyMission, setCompanyMission] = useState("");
  const [industryDomain, setIndustryDomain] = useState("");
  const [domainGlossary, setDomainGlossary] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");

  // Key Contacts
  const [hrEmail, setHrEmail] = useState("");
  const [payrollEmail, setPayrollEmail] = useState("");
  const [grievanceEmail, setGrievanceEmail] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const currentTenant = await apiRequest<TenantInfoResponse>("/tenant/current").catch(() => null);
        const settings = await apiRequest<TenantSettingsResponse>("/tenant/settings");

        const meta = (settings.metadata as Record<string, unknown>) ?? {};
        const legalMeta = (meta.legal as Record<string, unknown>) ?? {};
        const payrollMeta = (meta.payroll as Record<string, unknown>) ?? {};
        const workforceMeta = (meta.workforce as Record<string, unknown>) ?? {};
        const aiMeta = (meta.ai as Record<string, unknown>) ?? {};
        const contactsMeta = (meta.contacts as Record<string, unknown>) ?? {};

        // Populate Legal
        setLegalName(String(legalMeta.legalName || currentTenant?.legalName || currentTenant?.name || ""));
        setBrandName(String(legalMeta.brandName || currentTenant?.name || ""));
        setCinNumber(String(legalMeta.cin || ""));
        setPanNumber(String(legalMeta.pan || ""));
        setGstinNumber(String(legalMeta.gstin || ""));
        setIncorporationDate(String(legalMeta.incorporationDate || ""));
        setRegisteredAddress(String(legalMeta.registeredAddress || ""));

        // Populate Statutory & Payroll
        setStatutoryJurisdiction(
          String(payrollMeta.statutoryJurisdiction || meta.statutoryJurisdiction || "IN")
        );
        setPfPolicyVersion(
          String(payrollMeta.pfPolicyVersion || meta.pfPolicyVersion || "IN-EPF-2024")
        );
        setEsiPolicyVersion(
          String(payrollMeta.esiPolicyVersion || meta.esiPolicyVersion || "IN-ESI-2024")
        );
        setPolicyAppliesFrom(
          String(payrollMeta.policyAppliesFrom || meta.policyAppliesFrom || "2024-01-01")
        );
        setCurrency(settings.currency || "INR");
        setPayrollCycleDay(settings.payrollCycleDay ?? 25);
        setDefaultWorkingDaysPerMonth(settings.defaultWorkingDaysPerMonth ?? 26);

        // Populate Workforce
        setTimezone(settings.timezone || "Asia/Kolkata");
        setLocale(settings.locale || "en-IN");
        setWeekStartDay(settings.weekStartDay ?? 1);
        setStandardDailyHours(Number(workforceMeta.standardDailyHours ?? 8.5));
        setProbationMonths(Number(workforceMeta.probationMonths ?? 3));

        // Populate AI Grounding
        setCompanyMission(String(aiMeta.companyMission || ""));
        setIndustryDomain(String(aiMeta.industryDomain || ""));
        setDomainGlossary(String(aiMeta.domainGlossary || ""));
        setAiInstructions(String(aiMeta.aiInstructions || ""));

        // Populate Contacts
        setHrEmail(String(contactsMeta.hrEmail || ""));
        setPayrollEmail(String(contactsMeta.payrollEmail || ""));
        setGrievanceEmail(String(contactsMeta.grievanceEmail || ""));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tenant configuration.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const metadataToSave = {
        legal: {
          legalName,
          brandName,
          cin: cinNumber,
          pan: panNumber,
          gstin: gstinNumber,
          incorporationDate,
          registeredAddress
        },
        payroll: {
          statutoryJurisdiction: statutoryJurisdiction.trim().toUpperCase(),
          pfPolicyVersion: pfPolicyVersion.trim(),
          esiPolicyVersion: esiPolicyVersion.trim(),
          policyAppliesFrom: policyAppliesFrom.trim()
        },
        // Top-level fallbacks for backward compatibility
        statutoryJurisdiction: statutoryJurisdiction.trim().toUpperCase(),
        pfPolicyVersion: pfPolicyVersion.trim(),
        esiPolicyVersion: esiPolicyVersion.trim(),
        policyAppliesFrom: policyAppliesFrom.trim(),
        workforce: {
          standardDailyHours,
          probationMonths
        },
        ai: {
          companyMission,
          industryDomain,
          domainGlossary,
          aiInstructions
        },
        contacts: {
          hrEmail,
          payrollEmail,
          grievanceEmail
        }
      };

      await apiRequest("/tenant/settings", {
        method: "PATCH",
        body: JSON.stringify({
          timezone,
          locale,
          currency,
          weekStartDay: Number(weekStartDay),
          payrollCycleDay: Number(payrollCycleDay),
          attendanceTimezone: timezone,
          defaultWorkingDaysPerMonth: Number(defaultWorkingDaysPerMonth),
          metadata: metadataToSave
        })
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save business context.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={"/admin" as Route}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Admin Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mt-1">
            Business & AI Context
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Enterprise legal profile, statutory payroll policies (PF/ESI), operating parameters, and AI grounding.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-xs font-semibold transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Business context & statutory configurations saved successfully.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: "statutory", label: "Finance & Statutory", icon: Scale, badge: "Critical" },
          { id: "legal", label: "Legal & Entity", icon: Building2 },
          { id: "workforce", label: "Workforce Rules", icon: Clock },
          { id: "ai", label: "AI Grounding", icon: Sparkles, badge: "Intelligence" },
          { id: "contacts", label: "Key Contacts", icon: Mail }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: FINANCE & STATUTORY PAYROLL */}
        {activeTab === "statutory" && (
          <div className="space-y-6">
            <Panel className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    Statutory Compliance Jurisdiction & Rules
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Required for statutory deductions (Provident Fund, Employee State Insurance, Professional Tax).
                  </p>
                </div>
                <Badge tone="success">Engine Ready</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <Field label="Statutory Jurisdiction (ISO 2-letter)">
                  <Input
                    value={statutoryJurisdiction}
                    onChange={(e) => setStatutoryJurisdiction(e.target.value.toUpperCase())}
                    placeholder="e.g. IN"
                    maxLength={2}
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Standard country jurisdiction code (e.g. IN for India).
                  </p>
                </Field>

                <Field label="Statutory Policy Effective Date">
                  <Input
                    type="date"
                    value={policyAppliesFrom}
                    onChange={(e) => setPolicyAppliesFrom(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Date from which statutory deduction formulas apply.
                  </p>
                </Field>

                <Field label="Provident Fund (PF) Policy Version">
                  <Input
                    value={pfPolicyVersion}
                    onChange={(e) => setPfPolicyVersion(e.target.value)}
                    placeholder="e.g. IN-EPF-2024"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Registered engine policy ID (defaults to <span className="font-mono">IN-EPF-2024</span>).
                  </p>
                </Field>

                <Field label="Employee State Insurance (ESI) Version">
                  <Input
                    value={esiPolicyVersion}
                    onChange={(e) => setEsiPolicyVersion(e.target.value)}
                    placeholder="e.g. IN-ESI-2024"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Registered engine policy ID (defaults to <span className="font-mono">IN-ESI-2024</span>).
                  </p>
                </Field>
              </div>
            </Panel>

            <Panel className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-primary" />
                Payroll Cycle & Settlement Defaults
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <Field label="Operating Currency">
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    placeholder="INR"
                    maxLength={3}
                    required
                  />
                </Field>

                <Field label="Monthly Payroll Cycle Cutoff Day">
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={payrollCycleDay}
                    onChange={(e) => setPayrollCycleDay(parseInt(e.target.value, 10))}
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Day of month salary cycle closes (1 - 28).</p>
                </Field>

                <Field label="Standard Working Days Per Month">
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={defaultWorkingDaysPerMonth}
                    onChange={(e) => setDefaultWorkingDaysPerMonth(parseInt(e.target.value, 10))}
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Used for prorated salary calculations.</p>
                </Field>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 2: LEGAL & ORGANIZATION */}
        {activeTab === "legal" && (
          <Panel className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Corporate Identity & Registration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Field label="Full Legal Business Entity Name">
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. VC Organics Private Limited"
                  required
                />
              </Field>

              <Field label="Brand / Display Name">
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. VC Organics"
                />
              </Field>

              <Field label="Corporate Identity Number (CIN)">
                <Input
                  value={cinNumber}
                  onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. U01111KA2020PTC123456"
                />
              </Field>

              <Field label="Company Permanent Account Number (PAN)">
                <Input
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AABCV1234F"
                />
              </Field>

              <Field label="Goods & Services Tax Identification (GSTIN)">
                <Input
                  value={gstinNumber}
                  onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 29AABCV1234F1Z5"
                />
              </Field>

              <Field label="Date of Incorporation">
                <Input
                  type="date"
                  value={incorporationDate}
                  onChange={(e) => setIncorporationDate(e.target.value)}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Registered Office Address">
                  <textarea
                    rows={3}
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    placeholder="Full registered headquarters address including city, state, postal code and country"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </div>
            </div>
          </Panel>
        )}

        {/* TAB 3: WORKFORCE RULES */}
        {activeTab === "workforce" && (
          <Panel className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Operating Timezone & Shift Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Field label="Organization Timezone">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                </select>
              </Field>

              <Field label="Locale">
                <Input
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  placeholder="en-IN"
                />
              </Field>

              <Field label="Week Start Day">
                <select
                  value={weekStartDay}
                  onChange={(e) => setWeekStartDay(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={1}>Monday</option>
                  <option value={0}>Sunday</option>
                  <option value={6}>Saturday</option>
                </select>
              </Field>

              <Field label="Standard Daily Work Hours">
                <Input
                  type="number"
                  step="0.5"
                  min="4"
                  max="14"
                  value={standardDailyHours}
                  onChange={(e) => setStandardDailyHours(parseFloat(e.target.value))}
                />
              </Field>

              <Field label="Standard Probation Period (Months)">
                <Input
                  type="number"
                  min="0"
                  max="12"
                  value={probationMonths}
                  onChange={(e) => setProbationMonths(parseInt(e.target.value, 10))}
                />
              </Field>
            </div>
          </Panel>
        )}

        {/* TAB 4: AI GROUNDING */}
        {activeTab === "ai" && (
          <Panel className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Copilot & Autonomous Domain Context
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Information here grounds AI queries, HR policy explanations, and workforce summaries.
                </p>
              </div>
              <Badge tone="neutral">Grounding Context</Badge>
            </div>

            <div className="space-y-4 text-xs">
              <Field label="Company Mission & Business Overview">
                <textarea
                  rows={3}
                  value={companyMission}
                  onChange={(e) => setCompanyMission(e.target.value)}
                  placeholder="e.g. VC Organics specializes in certified organic produce manufacturing, distribution, and cold-chain warehousing across South India."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>

              <Field label="Industry & Operational Domain">
                <Input
                  value={industryDomain}
                  onChange={(e) => setIndustryDomain(e.target.value)}
                  placeholder="e.g. Organic Food Processing, Supply Chain, Agri-logistics"
                />
              </Field>

              <Field label="Company Terminology, Codes & Glossary">
                <textarea
                  rows={3}
                  value={domainGlossary}
                  onChange={(e) => setDomainGlossary(e.target.value)}
                  placeholder="e.g. WH1: Main Warehousing Hub, QA: Quality Assurance & Seed Traceability, CC: Cold Chain Loggers."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>

              <Field label="AI Agent Custom Guidelines & Directives">
                <textarea
                  rows={3}
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="e.g. Always reference official policy numbers when responding to leave or payroll inquiries. Maintain a formal, courteous, and precise tone."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>
            </div>
          </Panel>
        )}

        {/* TAB 5: KEY CONTACTS */}
        {activeTab === "contacts" && (
          <Panel className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Statutory & Governance Points of Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <Field label="HR Administration Contact Email">
                <Input
                  type="email"
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                  placeholder="hr@vcorganics.com"
                />
              </Field>

              <Field label="Payroll & Finance Contact Email">
                <Input
                  type="email"
                  value={payrollEmail}
                  onChange={(e) => setPayrollEmail(e.target.value)}
                  placeholder="payroll@vcorganics.com"
                />
              </Field>

              <Field label="Grievance Officer Email">
                <Input
                  type="email"
                  value={grievanceEmail}
                  onChange={(e) => setGrievanceEmail(e.target.value)}
                  placeholder="grievances@vcorganics.com"
                />
              </Field>
            </div>
          </Panel>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={"/admin" as Route}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-xs font-bold transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Business Context
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
