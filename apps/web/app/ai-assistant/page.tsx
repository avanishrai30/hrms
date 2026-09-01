"use client";

import { useState } from "react";
import { Badge, Button, Input, Panel } from "../../components/ui";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolsUsed?: string[];
  sources?: string[];
}

export default function AiAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am VC Organics HR AI Copilot. I can help you query workforce analytics, leave policies, payroll distributions, attendance patterns, and draft official HR documents. What can I do for you today?",
      timestamp: "Just now"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    "What is the average leave balance across the Engineering department?",
    "Summarize the PF and ESI compliance filings for August 2026.",
    "Draft an announcement for the upcoming Diwali holiday schedule.",
    "Check if there are any pending high-priority expense claims over ₹20,000."
  ];

  const handleSend = () => {
    if (!prompt.trim()) return;
    const userMsg: Message = {
      role: "user",
      content: prompt,
      timestamp: "Just now"
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsLoading(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        role: "assistant",
        content: `Based on your query regarding "${userMsg.content}":\n\nI have retrieved the active tenant context and aggregated records across the compliance, attendance, and payroll databases.\n\n• Target Scope: Engineering & Operations\n• Compliance Status: 100% compliant with EPFO & ESIC statutory norms\n• Actionable Summary: 3 employees have leave balances expiring next month; 1 pending finance reimbursement requires manager sign-off.`,
        timestamp: "Just now",
        toolsUsed: ["prisma.leaveBalance.aggregate", "ai.knowledge.search", "compliance.snapshot.read"],
        sources: ["HR Policy Manual v4.2", "August Statutory Summary"]
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🤖 AI HR Copilot & Assistant</h1>
          <p className="text-sm text-slate-600">
            Role-aware, multi-tenant enterprise AI assistant with tool calling across HRMS, Payroll, Attendance, and Knowledge Base.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">MODEL: VC-HR-LLM-v2 (GUARDRAILS ACTIVE)</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Chat Area */}
        <div className="space-y-4 lg:col-span-3">
          <Panel className="flex h-[550px] flex-col justify-between p-4">
            {/* Message Thread */}
            <div className="space-y-4 overflow-y-auto pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>

                    {m.toolsUsed && (
                      <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500 font-mono">
                        <span className="font-bold text-slate-700">Tools Invoked:</span>{" "}
                        {m.toolsUsed.join(", ")}
                      </div>
                    )}

                    {m.sources && (
                      <div className="mt-1 text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-slate-700">Sources:</span>{" "}
                        {m.sources.join(" · ")}
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-2 text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                  <span>AI Copilot is analyzing data and querying knowledge base...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-200 pt-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask any HR, payroll, attendance, policy or compliance question..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button variant="primary" onClick={handleSend} disabled={isLoading}>
                  Send
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Panel className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">⚡ Suggested Quick Prompts</h3>
            <div className="space-y-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="w-full text-left rounded border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-700 hover:bg-slate-100 transition leading-snug"
                >
                  {p}
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="space-y-3 text-xs text-slate-600">
            <h3 className="text-sm font-bold text-slate-900">🛡️ Guardrails & Compliance</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Strict tenant data isolation enforced at SQL layer.</li>
              <li>Role-based redaction: PII masked for non-HR callers.</li>
              <li>Zero retention for external LLM inference.</li>
              <li>Immutable query audit log in `audit_logs` table.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
