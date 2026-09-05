"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  Building2,
  Scale,
  Sparkles,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
  Clock,
  Landmark,
  UploadCloud,
  Archive,
  RefreshCw,
  Trash2,
  Search
} from "lucide-react";
import { apiRequest, getApiUrl } from "../../../../lib/api";
import { getAccessToken } from "../../../../lib/auth-token";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import type { AiKnowledgeChunkView, AiKnowledgeDocumentView } from "@vc-wms/shared-types";

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

type BusinessContextTab = "legal" | "statutory" | "workforce" | "ai" | "contacts" | "knowledge";

export default function BusinessContextPage() {
  const [activeTab, setActiveTab] = useState<BusinessContextTab>("statutory");
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
  const [knowledgeDocs, setKnowledgeDocs] = useState<AiKnowledgeDocumentView[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingKnowledge, setIsDraggingKnowledge] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("POLICY");
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState("");
  const [uploadExpiresAt, setUploadExpiresAt] = useState("");
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<AiKnowledgeChunkView[]>([]);
  const [knowledgeActionId, setKnowledgeActionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "knowledge") {
      setActiveTab("knowledge");
    }

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
        await loadKnowledgeDocs();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tenant configuration.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function loadKnowledgeDocs() {
    const docs = await apiRequest<AiKnowledgeDocumentView[]>("/ai/knowledge").catch(() => []);
    setKnowledgeDocs(docs);
  }

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

  function acceptKnowledgeFile(file: File | null | undefined) {
    if (!file) return;
    const allowed = [".pdf", ".docx", ".txt", ".md"];
    const lower = file.name.toLowerCase();
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      setError("Upload PDF, DOCX, TXT, or MD files only.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
    }
  }

  async function uploadKnowledgeFile() {
    if (!selectedFile) {
      setError("Select a knowledge file before uploading.");
      return;
    }

    const form = new FormData();
    form.append("file", selectedFile);
    if (uploadTitle.trim()) form.append("title", uploadTitle.trim());
    form.append("category", uploadCategory);
    if (uploadEffectiveDate) form.append("effectiveDate", uploadEffectiveDate);
    if (uploadExpiresAt) form.append("expiresAt", uploadExpiresAt);
    form.append("audience", "TENANT_ADMIN");

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", getApiUrl("/ai/knowledge/files"));
      const token = getAccessToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(xhr.responseText || "Knowledge file upload failed."));
      };
      xhr.onerror = () => reject(new Error("Knowledge file upload failed."));
      setUploadProgress(0);
      xhr.send(form);
    });

    setSelectedFile(null);
    setUploadTitle("");
    setUploadProgress(null);
    await loadKnowledgeDocs();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  async function runKnowledgeSearch() {
    if (!knowledgeSearch.trim()) return;
    const results = await apiRequest<AiKnowledgeChunkView[]>("/ai/knowledge/search", {
      method: "POST",
      body: JSON.stringify({ query: knowledgeSearch.trim(), topK: 5 })
    });
    setSearchResults(results);
  }

  async function runKnowledgeAction(id: string, action: "archive" | "reindex" | "delete") {
    try {
      setKnowledgeActionId(id);
      setError(null);
      if (action === "delete") {
        await apiRequest(`/ai/knowledge/${id}`, { method: "DELETE" });
      } else {
        await apiRequest(`/ai/knowledge/${id}/${action}`, { method: "POST" });
      }
      await loadKnowledgeDocs();
      if (action === "archive") {
        setSearchResults([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Knowledge action failed.");
    } finally {
      setKnowledgeActionId(null);
    }
  }

  function formatSize(bytes?: number) {
    if (!bytes) return "Not configured";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        {([
          { id: "statutory", label: "Finance & Statutory", icon: Scale, badge: "Critical" },
          { id: "legal", label: "Legal & Entity", icon: Building2 },
          { id: "workforce", label: "Workforce Rules", icon: Clock },
          { id: "ai", label: "AI Grounding", icon: Sparkles, badge: "Intelligence" },
          { id: "knowledge", label: "Knowledge Library", icon: FileText, badge: "RAG" },
          { id: "contacts", label: "Key Contacts", icon: Mail }
        ] satisfies Array<{ id: BusinessContextTab; label: string; icon: typeof Scale; badge?: string }>).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* TAB 6: KNOWLEDGE LIBRARY */}
        {activeTab === "knowledge" && (
          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.4fr] gap-6">
            <Panel className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-primary" />
                    Upload Knowledge
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    PDF, DOCX, TXT, and MD files are stored privately, extracted, chunked, and indexed per tenant.
                  </p>
                </div>
                <Badge tone="neutral">Tenant scoped</Badge>
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingKnowledge(true);
                }}
                onDragLeave={() => setIsDraggingKnowledge(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingKnowledge(false);
                  acceptKnowledgeFile(event.dataTransfer.files.item(0));
                }}
                className={`relative overflow-hidden rounded-xl border border-dashed p-6 text-center transition ${
                  isDraggingKnowledge
                    ? "border-zinc-900 bg-zinc-100 dark:border-white dark:bg-zinc-900"
                    : "border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                }`}
              >
                <div className="absolute inset-x-6 top-0 h-px animate-pulse bg-gradient-to-r from-transparent via-zinc-400 to-transparent" />
                <UploadCloud className="mx-auto h-8 w-8 text-zinc-500" />
                <p className="mt-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedFile ? selectedFile.name : "Drop a business document here"}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {selectedFile ? formatSize(selectedFile.size) : "Server validates file type, size, tenant path, and duplicate hash."}
                </p>
                <label className="mt-4 inline-flex h-8 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  Choose file
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                    className="sr-only"
                    onChange={(event) => acceptKnowledgeFile(event.target.files?.item(0))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                <Field label="Document Title">
                  <Input value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} placeholder="Employee handbook v3" />
                </Field>
                <Field label="Category">
                  <select
                    value={uploadCategory}
                    onChange={(event) => setUploadCategory(event.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    {["POLICY", "LEAVE", "COMPLIANCE", "BENEFITS", "CODE_OF_CONDUCT", "CUSTOM"].map((category) => (
                      <option key={category} value={category}>{category.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Effective Date">
                    <Input type="date" value={uploadEffectiveDate} onChange={(event) => setUploadEffectiveDate(event.target.value)} />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" value={uploadExpiresAt} onChange={(event) => setUploadExpiresAt(event.target.value)} />
                  </Field>
                </div>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Uploading and preparing index</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <div className="h-full rounded-full bg-zinc-900 transition-all dark:bg-white" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={() => void uploadKnowledgeFile().catch((err: unknown) => {
                  setUploadProgress(null);
                  setError(err instanceof Error ? err.message : "Knowledge file upload failed.");
                })}
                disabled={!selectedFile || uploadProgress !== null}
                className="w-full"
              >
                {uploadProgress !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Upload and Index
              </Button>
            </Panel>

            <div className="space-y-6">
              <Panel className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Document Library</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Current and archived tenant knowledge versions.</p>
                  </div>
                  <Button type="button" variant="secondary" className="h-8 px-3" onClick={() => void loadKnowledgeDocs()}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-[11px] uppercase text-zinc-500 dark:bg-zinc-900">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Document</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                        <th className="px-3 py-2 font-semibold">Size</th>
                        <th className="px-3 py-2 font-semibold">Chunks</th>
                        <th className="px-3 py-2 font-semibold">Indexed</th>
                        <th className="px-3 py-2 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {knowledgeDocs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">No knowledge documents uploaded.</td>
                        </tr>
                      ) : knowledgeDocs.map((doc) => (
                        <tr key={doc.id} className="bg-white dark:bg-zinc-950">
                          <td className="px-3 py-3">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{doc.title}</p>
                            <p className="mt-0.5 text-[11px] text-zinc-500">
                              v{doc.version} · {doc.category} · {doc.originalFileName || "Textarea content"}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <Badge tone={doc.status === "INDEXED" ? "success" : doc.status === "FAILED" ? "danger" : doc.status === "ARCHIVED" ? "neutral" : "warning"}>
                              {doc.status || (doc.isActive ? "INDEXED" : "ARCHIVED")}
                            </Badge>
                            {doc.lastError && <p className="mt-1 max-w-44 text-[10px] text-red-600">{doc.lastError}</p>}
                          </td>
                          <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{formatSize(doc.sizeBytes)}</td>
                          <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{doc.chunkCount ?? 0}</td>
                          <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                            {doc.indexedAt ? new Date(doc.indexedAt).toLocaleString() : "Not indexed"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex justify-end gap-1.5">
                              <Button type="button" variant="secondary" className="h-7 w-7 p-0" disabled={knowledgeActionId === doc.id} onClick={() => void runKnowledgeAction(doc.id, "reindex")}>
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              <Button type="button" variant="secondary" className="h-7 w-7 p-0" disabled={knowledgeActionId === doc.id || doc.status === "ARCHIVED"} onClick={() => void runKnowledgeAction(doc.id, "archive")}>
                                <Archive className="h-3.5 w-3.5" />
                              </Button>
                              <Button type="button" variant="danger" className="h-7 w-7 p-0" disabled={knowledgeActionId === doc.id} onClick={() => void runKnowledgeAction(doc.id, "delete")}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">RAG Search Explorer</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Diagnostics for source-backed tenant retrieval.</p>
                  </div>
                  <Badge tone="neutral">Admin diagnostics</Badge>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={knowledgeSearch} onChange={(event) => setKnowledgeSearch(event.target.value)} placeholder="Search exact policy concept" />
                  <Button type="button" onClick={() => void runKnowledgeSearch().catch((err: unknown) => setError(err instanceof Error ? err.message : "Knowledge search failed."))}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
                <div className="space-y-2">
                  {searchResults.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800">No retrieved chunks yet.</div>
                  ) : searchResults.map((chunk) => (
                    <div key={chunk.id} className="rounded-lg border border-zinc-200 bg-white p-4 text-xs dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {chunk.documentTitle} v{chunk.version ?? 1}
                        </p>
                        <Badge tone="neutral">Score {chunk.similarityScore ?? 0}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        {chunk.category || "CUSTOM"} · {chunk.sourceSection || "Section not tagged"} {chunk.sourcePage ? `· Page ${chunk.sourcePage}` : ""}
                      </p>
                      <p className="mt-3 line-clamp-3 text-zinc-600 dark:text-zinc-400">{chunk.content}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
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
