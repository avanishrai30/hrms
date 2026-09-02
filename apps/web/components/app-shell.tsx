"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@vc-wms/ui";
import { AiavroMark, AiavroWordmark, DEFAULT_TENANT_WORKSPACE } from "./aiavro-brand";
import { apiRequest } from "../lib/api";
import { filterGroups, isActive, routeCommandItems, employeeDock } from "../lib/navigation";
import { useSessionStore } from "../lib/session-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const tenantName = useSessionStore((state) => state.tenantName);
  const accessToken = useSessionStore((state) => state.accessToken);
  const permissions = useSessionStore((state) => state.permissions);
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clear);
  const [sessionReady, setSessionReady] = useState(Boolean(accessToken));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const groups = filterGroups(permissions);
  const activeGroup = groups.find((group) => isActive(pathname, group.href) || group.items.some((item) => isActive(pathname, item.href))) ?? groups[0];
  const visibleDock = employeeDock.filter((item) => !item.permission || permissions.includes(item.permission));
  const commandItems = useMemo(() => routeCommandItems(permissions, commandQuery), [commandQuery, permissions]);

  useEffect(() => {
    if (accessToken) {
      setSessionReady(true);
      return;
    }
    let cancelled = false;
    apiRequest<{ accessToken: string; tenant: { name: string } }>("/auth/refresh", { method: "POST" })
      .then((result) => {
        if (cancelled) return;
        setSession(result.accessToken, result.tenant.name, []);
        setSessionReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        const next = encodeURIComponent(pathname);
        router.replace(`/login?next=${next}`);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, clearSession, pathname, router, setSession]);

  useEffect(() => {
    const onSessionExpired = () => {
      clearSession();
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/login?next=${next}`);
    };
    window.addEventListener("aiavro:session-expired", onSessionExpired);
    return () => window.removeEventListener("aiavro:session-expired", onSessionExpired);
  }, [clearSession, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCommandOpen(false);
  }, [pathname]);

  async function logout() {
    await apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
    clearSession();
    window.location.assign("/login");
  }

  if (!sessionReady) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas p-6 text-center">
        <div className="rounded-overlay border border-border bg-surface p-6 shadow-sm">
          <AiavroMark className="mx-auto mb-4" />
          <p className="text-sm font-semibold text-zinc-950">Checking your AIavro session</p>
          <p className="mt-2 text-sm text-zinc-500">Protected workspace content will load after authentication is confirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas text-zinc-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 hidden border-r border-border bg-surface px-4 py-5 transition-[width] duration-200 motion-reduce:transition-none lg:block",
          collapsed ? "w-[88px]" : "w-[280px]"
        )}
      >
        <div className="flex items-center gap-3 px-2">
          <AiavroMark />
          <div className={cn("min-w-0", collapsed && "hidden")}>
            <AiavroWordmark className="h-5" />
            <p className="mt-1 truncate text-xs text-zinc-500">{tenantName || DEFAULT_TENANT_WORKSPACE}</p>
          </div>
        </div>
        <button
          className="mt-4 h-9 w-full rounded-control border border-border text-xs font-medium text-zinc-600 transition hover:bg-muted focus-visible:outline-primary"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "Open" : "Collapse"}
        </button>
        <nav className="mt-7 grid gap-1" aria-label="Primary navigation">
          {groups.map((group) => (
            <Link
              key={group.label}
              href={group.href}
              className={cn(
                "flex items-center justify-between rounded-control px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-muted hover:text-zinc-950",
                activeGroup?.label === group.label && "bg-zinc-950 text-white hover:bg-zinc-900 hover:text-white"
              )}
            >
              <span className="truncate">{collapsed ? group.label.slice(0, 1) : group.label}</span>
              {!collapsed ? <span className="text-xs opacity-60">{group.items.length}</span> : null}
            </Link>
          ))}
        </nav>
        <div className={cn("absolute inset-x-4 bottom-5 rounded-panel border border-border bg-canvas p-3", collapsed && "hidden")}>
          <p className="text-xs font-medium text-zinc-900">Workspace</p>
          <p className="mt-1 truncate text-sm text-zinc-600">{tenantName || DEFAULT_TENANT_WORKSPACE}</p>
        </div>
      </aside>

      <header className={cn("sticky top-0 z-10 border-b border-border bg-canvas/95 backdrop-blur transition-[margin] duration-200 motion-reduce:transition-none", collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]")}>
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <AiavroMark className="h-8 w-8" />
              </button>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950">{activeGroup?.label ?? "Workspace"}</p>
              <p className="truncate text-xs text-zinc-500">{tenantName || DEFAULT_TENANT_WORKSPACE}</p>
            </div>
          </div>
          <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
            <button
              className="h-10 w-full max-w-lg rounded-control border border-border bg-surface px-3 text-left text-sm text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700"
              type="button"
              onClick={() => setCommandOpen(true)}
            >
              Search AIavro or press Cmd K
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-zinc-700 transition hover:bg-muted" href={"/notifications" as Route}>
              Alerts
            </Link>
            <Link className="hidden rounded-control border border-border bg-surface px-3 py-2 text-sm text-zinc-700 transition hover:bg-muted sm:inline-flex" href={"/helpdesk" as Route}>
              Help
            </Link>
            <div className="relative">
              <button className="rounded-control bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800" type="button" onClick={() => setAccountOpen((value) => !value)}>
                Account
              </button>
              {accountOpen ? (
                <div className="absolute right-0 top-12 w-56 rounded-overlay border border-border bg-surface p-2 shadow-lg">
                  <p className="px-2 py-2 text-xs text-zinc-500">{tenantName || DEFAULT_TENANT_WORKSPACE}</p>
                  <Link className="block rounded-control px-2 py-2 text-sm text-zinc-700 hover:bg-muted" href="/profile">
                    My profile
                  </Link>
                  <button className="block w-full rounded-control px-2 py-2 text-left text-sm text-red-700 hover:bg-red-50" type="button" onClick={() => void logout()}>
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {activeGroup ? (
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:px-8" aria-label={`${activeGroup.label} navigation`}>
            {activeGroup.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-control px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-muted hover:text-zinc-950",
                  isActive(pathname, item.href) && "bg-surface text-zinc-950 shadow-sm"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      <main className={cn("pb-20 transition-[margin] duration-200 motion-reduce:transition-none lg:pb-8", collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]")}>{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 grid h-16 border-t border-border bg-surface lg:hidden"
        style={{ gridTemplateColumns: `repeat(${visibleDock.length}, minmax(0, 1fr))` }}
        aria-label="Mobile navigation"
      >
        {visibleDock.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("grid place-items-center text-xs font-medium text-zinc-500", isActive(pathname, item.href) && "text-zinc-950")}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" role="presentation" onClick={() => setMobileOpen(false)}>
          <aside className="h-full w-[300px] bg-surface p-4 shadow-xl" role="dialog" aria-modal="true" aria-label="Navigation" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <AiavroWordmark />
              <button className="rounded-control border border-border px-3 py-2 text-sm" type="button" onClick={() => setMobileOpen(false)}>
                Close
              </button>
            </div>
            <nav className="grid gap-1">
              {groups.map((group) => (
                <Link key={group.href} className={cn("rounded-control px-3 py-2 text-sm font-medium text-zinc-700", activeGroup?.label === group.label && "bg-zinc-950 text-white")} href={group.href}>
                  {group.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      {commandOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-start bg-black/35 px-4 pt-24" role="presentation" onClick={() => setCommandOpen(false)}>
          <div className="mx-auto w-full max-w-xl rounded-overlay border border-border bg-surface p-2 shadow-2xl" role="dialog" aria-modal="true" aria-label="Command menu" onClick={(event) => event.stopPropagation()}>
            <input
              autoFocus
              className="h-12 w-full rounded-control border border-border bg-canvas px-3 text-sm text-zinc-950 outline-none focus:border-zinc-400"
              placeholder="Jump to a page"
              value={commandQuery}
              onChange={(event) => setCommandQuery(event.target.value)}
            />
            <div className="mt-2 max-h-80 overflow-y-auto">
              {commandItems.length ? (
                commandItems.map((item) => (
                  <Link key={item.href} className="flex items-center justify-between rounded-control px-3 py-2 text-sm text-zinc-700 hover:bg-muted" href={item.href}>
                    <span>{item.label}</span>
                    <span className="text-xs text-zinc-400">{item.group}</span>
                  </Link>
                ))
              ) : (
                <p className="px-3 py-6 text-center text-sm text-zinc-500">No matching pages.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
