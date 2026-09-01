"use client";

import { useQuery } from "@tanstack/react-query";
import { Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface Branding {
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pwaName: string;
}

export default function BrandingPage() {
  const branding = useQuery({
    queryKey: ["tenant-branding"],
    queryFn: () => apiRequest<Branding>("/tenant/branding")
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Brand settings</h1>
        <p className="mt-1 text-sm text-zinc-600">White-label identity with accessibility-safe color usage.</p>
      </header>
      <Panel>
        {branding.isLoading ? <p className="text-sm text-zinc-600">Loading branding...</p> : null}
        {branding.isError ? <p className="text-sm text-danger">Branding could not be loaded.</p> : null}
        {branding.data ? (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-zinc-500">Display name</dt><dd className="font-medium">{branding.data.displayName}</dd></div>
              <div><dt className="text-zinc-500">PWA name</dt><dd className="font-medium">{branding.data.pwaName}</dd></div>
            </dl>
            <div className="rounded-panel border border-border p-4">
              <p className="text-sm font-medium">Theme preview</p>
              <div className="mt-4 flex gap-2">
                {[branding.data.primaryColor, branding.data.secondaryColor, branding.data.accentColor].map((color) => (
                  <span className="h-10 w-10 rounded-control border border-border" key={color} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

