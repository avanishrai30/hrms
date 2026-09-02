"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type { AiPromptResponseView } from "@vc-wms/shared-types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: string | undefined;
  dataPayload?: Record<string, unknown> | undefined;
  tokensUsed?: number | undefined;
  modelUsed?: string | undefined;
  createdAt: string;
  quickReplies?: string[] | undefined;
  suggestedActions?: Array<{ label: string; action: string; payload?: Record<string, unknown> }> | undefined;
}

const QUICK_PROMPTS = [
  "🌴 How many leave days do I have?",
  "⏱️ Show my attendance today",
  "💰 View my latest payslip",
  "📜 What is the maternity leave policy?",
  "📊 Summarize workforce attrition risks"
];

export default function AiCopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        content: "Hello! I am your **AIavro HR Assistant** for this tenant workspace.\n\nI can answer authorized questions about your **leave balances**, **shift timings**, **payroll & tax deductions**, **company policies**, and **workforce insights**.\n\nHow can I help you today?",
        createdAt: new Date().toISOString(),
        quickReplies: [
          "How many leave days do I have?",
          "Show my attendance today",
          "Download my latest payslip"
        ]
      }
    ]);
  }, []);

  async function handleSendMessage(textToSend?: string) {
    const promptText = (textToSend || inputPrompt).trim();
    if (!promptText || loading) return;

    setInputPrompt("");
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: promptText,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await apiRequest<AiPromptResponseView>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          conversationId,
          prompt: promptText,
          contextType: "GENERAL"
        })
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: ChatMessage = {
        id: response.messageId || `ai-${Date.now()}`,
        role: "assistant",
        content: response.content,
        intent: response.intent,
        dataPayload: response.dataPayload || undefined,
        tokensUsed: response.tokensUsed,
        modelUsed: response.modelUsed,
        createdAt: new Date().toISOString(),
        quickReplies: response.quickReplies,
        suggestedActions: response.suggestedActions
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate AI response.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 px-6 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl shadow-md">
            ✨
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100">AIavro HR Assistant</h1>
              <Badge tone="success">Active</Badge>
            </div>
            <p className="text-xs text-neutral-500">Multi-Model Grounded Assistant (RAG & Internal APIs)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={"/ai/history" as Route}>
            <Button variant="ghost">📜 History</Button>
          </Link>
          <Link href={"/ai/knowledge-base" as Route}>
            <Button variant="ghost">📚 Policies</Button>
          </Link>
          <Link href={"/analytics/ai" as Route}>
            <Button variant="secondary">📈 Predictions</Button>
          </Link>
        </div>
      </div>

      {/* Chat Messages Container */}
      <Panel className="flex-1 overflow-y-auto p-6 space-y-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center space-x-2 mb-1 px-1">
              <span className="text-[11px] font-medium text-neutral-500">
                {msg.role === "user" ? "You" : "HR Copilot"}
              </span>
              <span className="text-[10px] text-neutral-400">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {msg.modelUsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                  {msg.modelUsed}
                </span>
              )}
            </div>

            <div
              className={`max-w-2xl px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                  : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Grounded Data Card Payload */}
              {msg.dataPayload && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  {msg.dataPayload.type === "LEAVE_BALANCE" && Array.isArray(msg.dataPayload.balances) && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(msg.dataPayload.balances as Array<{ leaveType: string; available: number; total: number }>).map((b, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">{b.leaveType}</div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-sm">
                            {b.available} <span className="text-[10px] text-neutral-400 font-normal">/ {b.total} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.dataPayload.type === "ATTENDANCE_STATUS" && (
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">Shift: {String(msg.dataPayload.shiftName)}</div>
                        <div className="text-neutral-500 text-[11px]">Today&apos;s Status: {String(msg.dataPayload.status)}</div>
                      </div>
                      <Badge tone={msg.dataPayload.status === "PRESENT" ? "success" : "neutral"}>
                        {String(msg.dataPayload.status)}
                      </Badge>
                    </div>
                  )}

                  {msg.dataPayload.type === "PAYSLIP_CARD" && (
                    <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Payslip ({String(msg.dataPayload.month)}/{String(msg.dataPayload.year)})
                        </div>
                        <div className="text-neutral-500 text-[11px]">Net Disbursed Amount</div>
                      </div>
                      <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{Number(msg.dataPayload.netPay).toLocaleString("en-IN")}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2 flex flex-wrap gap-2">
                  {msg.suggestedActions.map((act, i) => (
                    <Link key={i} href={(act.payload?.href as Route) || "/dashboard"}>
                      <button className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition">
                        {act.label}
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {msg.quickReplies && msg.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                {msg.quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => void handleSendMessage(qr)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-200/80 dark:bg-neutral-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-neutral-700 transition"
                  >
                    💬 {qr}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-neutral-500 text-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center animate-pulse">
              ✨
            </div>
            <div className="space-y-1">
              <div className="flex space-x-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <p className="text-[11px] text-neutral-400">Consulting policies and platform records...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </Panel>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap items-center gap-2 px-2">
          <span className="text-xs font-semibold text-neutral-500">Quick Prompts:</span>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => void handleSendMessage(qp)}
              className="text-xs px-3 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 text-neutral-700 dark:text-neutral-300 transition shadow-2xs"
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="relative flex items-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-700 shadow-md p-2 focus-within:ring-2 focus-within:ring-emerald-500">
        <Input
          value={inputPrompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about leaves, attendance, payroll, or company policies..."
          className="flex-1 border-none shadow-none focus:ring-0 text-sm bg-transparent px-3"
          disabled={loading}
        />
        <Button
          onClick={() => void handleSendMessage()}
          disabled={loading || !inputPrompt.trim()}
          variant="primary"
          className="rounded-xl px-4"
        >
          {loading ? "Thinking..." : "Send 🚀"}
        </Button>
      </div>
    </div>
  );
}
