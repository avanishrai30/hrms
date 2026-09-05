import Link from "next/link";
import { ArrowLeft, Compass, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-5xl items-center px-6 py-12">
        <section className="relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px animate-pulse bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="relative flex aspect-square max-w-72 items-center justify-center rounded-2xl border border-border bg-muted/30">
              <div className="absolute h-28 w-28 animate-ping rounded-full border border-primary/20" />
              <div className="absolute h-44 w-44 rounded-full border border-border" />
              <Compass className="h-16 w-16 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">404</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">This workspace route is not available.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                The page may have moved, or your tenant may not have this module enabled. Return to the dashboard or search the workspace.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href="/dashboard" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/search" className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Link>
                <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Admin Center
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
