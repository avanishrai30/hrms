"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AiNavBar } from "../components/ai-nav-bar";

interface ConversationItem {
  id: string;
  title: string;
  contextType: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{ content: string; role: string; createdAt: string }>;
}

export default function AiHistoryPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        const data = await apiRequest<ConversationItem[]>("/ai/conversations");
        setConversations(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load conversation history");
      } finally {
        setLoading(false);
      }
    }
    void loadConversations();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this conversation thread?")) return;
    try {
      await apiRequest(`/ai/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete conversation");
    }
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <AiNavBar />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Link href={"/ai" as Route} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
              ← Back to Copilot
            </Link>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            AI Conversation History
          </h1>
          <p className="text-sm text-neutral-500">
            Review past multi-turn HR Copilot interactions and queries.
          </p>
        </div>

        <Link href={"/ai" as Route}>
          <Button variant="primary">+ New Chat</Button>
        </Link>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <Panel className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">No Past Conversations</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Start a new conversation with HR Copilot to ask about leaves, attendance, or policies.
          </p>
          <div className="mt-4">
            <Link href={"/ai" as Route}>
              <Button variant="primary">Launch HR Copilot</Button>
            </Link>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const lastMessage = conv.messages?.[0];
            return (
              <Panel
                key={conv.id}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 transition flex items-center justify-between shadow-2xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                      {conv.title}
                    </span>
                    <Badge tone="neutral">{conv.contextType}</Badge>
                  </div>
                  {lastMessage && (
                    <p className="text-xs text-neutral-500 truncate">
                      {lastMessage.role === "assistant" ? "🤖 " : "👤 "}
                      {lastMessage.content}
                    </p>
                  )}
                  <div className="text-[11px] text-neutral-400">
                    Updated {new Date(conv.updatedAt).toLocaleDateString()} at {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link href={"/ai" as Route}>
                    <Button variant="secondary">Resume</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => void handleDelete(conv.id)}
                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    Delete
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
