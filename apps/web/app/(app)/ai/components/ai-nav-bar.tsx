"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AI_NAV_ITEMS: Array<{ label: string; href: Route; icon: string }> = [
  { label: "Copilot", href: "/ai" as Route, icon: "✨" },
  { label: "Insights", href: "/ai/insights" as Route, icon: "💡" },
  { label: "Predictions", href: "/ai/predictions" as Route, icon: "📈" },
  { label: "Policies & RAG", href: "/ai/knowledge-base" as Route, icon: "📚" },
  { label: "Automations", href: "/ai/automations" as Route, icon: "⚡" },
  { label: "History & Audit", href: "/ai/history" as Route, icon: "📜" },
  { label: "AI Settings", href: "/admin/ai-settings" as Route, icon: "⚙️" }
];

export function AiNavBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="AI Workspace Navigation" className="flex items-center space-x-1.5 overflow-x-auto pb-1 mb-4 border-b border-neutral-200 dark:border-neutral-800">
      {AI_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/ai" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              isActive
                ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
