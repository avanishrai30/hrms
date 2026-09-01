"use client";

import { useQuery } from "@tanstack/react-query";
import { Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface TenantSettings {
  timezone: string;
  locale: string;
  currency: string;
  defaultWorkingDaysPerMonth: number;
}

export default function TenantSettingsPage() {
  const settings = useQuery({
    queryKey: ["tenant-settings"],
    queryFn: () => apiRequest<TenantSettings>("/tenant/settings")
  });

  return (
    <div className="mx-auto grid max-w-4xl gap-6 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Tenant settings</h1>
        <p className="mt-1 text-sm text-zinc-600">Company, locale, and workforce defaults for the active tenant.</p>
      </header>
      <Panel>
        {settings.isLoading ? <p className="text-sm text-zinc-600">Loading settings...</p> : null}
        {settings.isError ? <p className="text-sm text-danger">Settings could not be loaded.</p> : null}
        {settings.data ? (
          <dl className="grid gap-4 text-sm md:grid-cols-2">
            <div><dt className="text-zinc-500">Timezone</dt><dd className="font-medium">{settings.data.timezone}</dd></div>
            <div><dt className="text-zinc-500">Locale</dt><dd className="font-medium">{settings.data.locale}</dd></div>
            <div><dt className="text-zinc-500">Currency</dt><dd className="font-medium">{settings.data.currency}</dd></div>
            <div><dt className="text-zinc-500">Working days</dt><dd className="font-medium">{settings.data.defaultWorkingDaysPerMonth}</dd></div>
          </dl>
        ) : null}
      </Panel>
    </div>
  );
}

