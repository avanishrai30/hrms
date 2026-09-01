"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { AiSettingsView } from "@vc-wms/shared-types";

export default function AiSettingsPage() {
  const [settings, setSettings] = useState<AiSettingsView | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [provider, setProvider] = useState<"GEMINI" | "OPENAI" | "LOCAL_MOCK">("GEMINI");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [modelName, setModelName] = useState("gemini-1.5-flash");
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [piiMasking, setPiiMasking] = useState(true);
  const [promptShield, setPromptShield] = useState(true);
  const [autoInsights, setAutoInsights] = useState(true);
  const [workforcePredictions, setWorkforcePredictions] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await apiRequest<AiSettingsView>("/ai/settings");
        setSettings(data);
        setProvider(data.activeProvider);
        setModelName(data.modelName);
        setTemperature(data.temperature);
        setMaxTokens(data.maxTokens);
        setPiiMasking(data.enablePiiMasking);
        setPromptShield(data.enablePromptShield);
        setAutoInsights(data.enableAutoInsights);
        setWorkforcePredictions(data.enableWorkforcePredictions);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load AI settings");
      } finally {
        setLoading(false);
      }
    }
    void loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const payload: Record<string, unknown> = {
        activeProvider: provider,
        modelName,
        temperature,
        maxTokens,
        enablePiiMasking: piiMasking,
        enablePromptShield: promptShield,
        enableAutoInsights: autoInsights,
        enableWorkforcePredictions: workforcePredictions
      };

      if (geminiKey.trim()) payload.geminiApiKey = geminiKey.trim();
      if (openaiKey.trim()) payload.openaiApiKey = openaiKey.trim();

      const updated = await apiRequest<AiSettingsView>("/ai/settings", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setSettings(updated);
      setSuccess(true);
      setGeminiKey("");
      setOpenaiKey("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Link href={"/admin/security" as Route} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
              ← Admin Center
            </Link>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            AI Model Controls & Intelligence Settings
          </h1>
          <p className="text-sm text-neutral-500">
            Configure LLM providers, API keys, model parameters, and safety shields.
          </p>
        </div>

        <Link href={"/ai" as Route}>
          <Button variant="primary">✨ Launch Copilot</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
          ✓ AI configurations saved successfully.
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-neutral-100 dark:bg-neutral-800/40 rounded-2xl animate-pulse" />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Provider Selection */}
          <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              Active LLM Provider
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "GEMINI", label: "Google Gemini", desc: "Recommended for fast RAG & multi-modal processing", badge: "Default" },
                { key: "OPENAI", label: "OpenAI GPT", desc: "GPT-4o & GPT-4o-mini structured analysis", badge: "Supported" },
                { key: "LOCAL_MOCK", label: "Deterministic Local", desc: "Air-gapped offline & rule-based engine", badge: "Fallback" }
              ].map((prov) => (
                <div
                  key={prov.key}
                  onClick={() => setProvider(prov.key as "GEMINI" | "OPENAI" | "LOCAL_MOCK")}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    provider === prov.key
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{prov.label}</span>
                    <Badge tone={provider === prov.key ? "success" : "neutral"}>{prov.badge}</Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">{prov.desc}</p>
                </div>
              ))}
            </div>

            {provider === "GEMINI" && (
              <div className="space-y-3 pt-2">
                <Field label="Gemini API Key (Leave empty to use server default)">
                  <Input
                    type="password"
                    value={geminiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeminiKey(e.target.value)}
                    placeholder={settings?.hasGeminiKey ? "•••••••••••••••• (Key Configured)" : "AIzaSy..."}
                  />
                </Field>
              </div>
            )}

            {provider === "OPENAI" && (
              <div className="space-y-3 pt-2">
                <Field label="OpenAI API Key (Leave empty to use server default)">
                  <Input
                    type="password"
                    value={openaiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpenaiKey(e.target.value)}
                    placeholder={settings?.hasOpenaiKey ? "•••••••••••••••• (Key Configured)" : "sk-..."}
                  />
                </Field>
              </div>
            )}
          </Panel>

          {/* Hyperparameters */}
          <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              Model Parameters & Hyperparameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Model Identifier">
                <Input
                  value={modelName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModelName(e.target.value)}
                  placeholder="gemini-1.5-flash"
                />
              </Field>

              <Field label="Temperature (0.0 to 1.0)">
                <Input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={temperature}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemperature(parseFloat(e.target.value))}
                />
              </Field>

              <Field label="Max Output Tokens">
                <Input
                  type="number"
                  step="128"
                  min="256"
                  max="8192"
                  value={maxTokens}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxTokens(parseInt(e.target.value, 10))}
                />
              </Field>
            </div>
          </Panel>

          {/* Safety & Governance Controls */}
          <Panel className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              Safety, Privacy & Governance Shields
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    🛡️ Prompt Injection Shield
                  </div>
                  <div className="text-xs text-neutral-500">
                    Blocks instruction override attacks, jailbreak payloads, and credential leaks.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={promptShield}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromptShield(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    🔒 Dynamic PII Masking
                  </div>
                  <div className="text-xs text-neutral-500">
                    Redacts PAN, Aadhaar, bank accounts, and confidential salaries unless authorized by RBAC.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={piiMasking}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPiiMasking(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    💡 Automated Smart Insights
                  </div>
                  <div className="text-xs text-neutral-500">
                    Scans weekly attendance drops and overtime surges autonomously.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoInsights}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoInsights(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    📈 Predictive Workforce Intelligence
                  </div>
                  <div className="text-xs text-neutral-500">
                    Computes attrition risk scores and burnout indices for proactive retention.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={workforcePredictions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkforcePredictions(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </label>
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving Changes..." : "Save AI Configuration"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
