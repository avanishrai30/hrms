import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@vc-wms/ui";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-white hover:brightness-95",
        variant === "secondary" && "border border-border bg-surface text-zinc-900 hover:bg-muted",
        variant === "ghost" && "text-zinc-700 hover:bg-muted",
        variant === "danger" && "bg-danger text-white hover:brightness-95",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-primary disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-zinc-800">{label}</span>
      {children}
      {error ? <span className="text-sm text-danger">{error}</span> : null}
    </label>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-panel border border-border bg-surface p-5 shadow-sm", className)}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
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
