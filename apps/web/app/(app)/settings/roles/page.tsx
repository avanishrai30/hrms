"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface Role {
  id: string;
  code: string;
  name: string;
  isSystemRole: boolean;
  permissions: Array<{ permission: { code: string } }>;
}

export default function RolesPage() {
  const roles = useQuery({ queryKey: ["roles"], queryFn: () => apiRequest<Role[]>("/tenant/roles") });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Roles</h1>
        <p className="mt-1 text-sm text-zinc-600">Permission-based tenant access without hardcoded role checks.</p>
      </header>
      <div className="grid gap-4">
        {roles.isLoading ? <Panel>Loading roles...</Panel> : null}
        {roles.isError ? <Panel className="text-danger">Roles could not be loaded.</Panel> : null}
        {roles.data?.map((role) => (
          <Panel key={role.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zinc-950">{role.name}</h2>
                <p className="mt-1 font-mono text-xs text-zinc-500">{role.code}</p>
              </div>
              <Badge>{role.isSystemRole ? "System" : "Custom"}</Badge>
            </div>
            <p className="mt-4 text-sm text-zinc-600">{role.permissions.length} permissions assigned.</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

