"use client";

import React, { ReactNode } from "react";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

export function SkeletonLoader({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded-control bg-muted/60 ${className}`} />;
}

export function InlineUnavailableState({
  title = "Data unavailable",
  description = "This service is currently unable to load live records.",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center rounded-card border border-border-subtle bg-surface-muted/50">
      <AlertCircle className="w-5 h-5 text-text-muted mb-2 opacity-80" />
      <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      <p className="text-[11px] text-foreground-muted mt-0.5 max-w-[220px]">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-primary bg-primary-soft hover:bg-primary-soft/80 rounded-control transition"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyStateView({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-card border border-dashed border-border-subtle bg-surface/50">
      <div className="w-9 h-9 rounded-pill bg-primary-soft flex items-center justify-center text-primary mb-2.5">
        <Inbox className="w-4 h-4" />
      </div>
      <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      {description && <p className="text-[11px] text-foreground-muted mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
