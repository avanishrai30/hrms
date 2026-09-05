"use client";

import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-4xl items-center px-6 py-12">
        <section className="relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px animate-pulse bg-gradient-to-r from-transparent via-destructive/60 to-transparent" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Something interrupted this workspace.</h1>
                <span className="inline-flex items-center rounded-full border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  No client data was trusted
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                The app hit an unexpected state while loading this view. You can retry safely; tenant data boundaries remain enforced by the server.
              </p>
              {error.digest && (
                <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                  Digest: {error.digest}
                </p>
              )}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </button>
                <a
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Open dashboard
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
