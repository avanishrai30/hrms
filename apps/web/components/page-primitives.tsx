import type { ReactNode } from "react";
import { cn } from "@vc-wms/ui";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-xs font-semibold text-zinc-500">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Surface({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return <section className={cn("rounded-overlay border border-border bg-surface p-5 shadow-sm", className)}>{children}</section>;
}

export function Section({ title, description, children, className }: { title: string; description?: string | undefined; children: ReactNode; className?: string | undefined }) {
  return (
    <Surface className={className}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p> : null}
      </div>
      {children}
    </Surface>
  );
}

export function MetricStrip({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}

export function Metric({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return (
    <Surface className="p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-950">{value}</p>
      {detail ? <div className="mt-2 text-xs leading-5 text-zinc-500">{detail}</div> : null}
    </Surface>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid gap-3" aria-live="polite" aria-busy="true">
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="h-3 rounded-full bg-muted" />
      <div className="h-3 w-2/3 rounded-full bg-muted" />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-panel border border-dashed border-border bg-canvas p-6 text-center">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-panel border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}

export function PermissionState({
  title = "You do not have access to this area.",
  description = "Ask a tenant administrator to grant the required permission if this page should be available to your role."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-4 py-10 text-center">
      <div className="rounded-overlay border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
      </div>
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-muted text-zinc-700",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-red-50 text-red-700"
      )}
    >
      {children}
    </span>
  );
}
