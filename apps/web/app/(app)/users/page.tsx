"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface Membership {
  id: string;
  status: string;
  user: { email: string };
  roles: Array<{ role: { name: string } }>;
}

export default function UsersPage() {
  const users = useQuery({ queryKey: ["users"], queryFn: () => apiRequest<Membership[]>("/admin/users") });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Users</h1>
        <p className="mt-1 text-sm text-zinc-600">Invite users, assign roles, deactivate access, and reset sessions.</p>
      </header>
      <Panel>
        {users.isLoading ? <p className="text-sm text-zinc-600">Loading users...</p> : null}
        {users.isError ? <p className="text-sm text-danger">Users could not be loaded.</p> : null}
        <div className="divide-y divide-border">
          {users.data?.map((membership) => (
            <div className="flex items-center justify-between py-3" key={membership.id}>
              <div>
                <p className="text-sm font-medium text-zinc-950">{membership.user.email}</p>
                <p className="text-xs text-zinc-500">{membership.roles.map((role) => role.role.name).join(", ") || "No role"}</p>
              </div>
              <Badge tone={membership.status === "ACTIVE" ? "success" : "neutral"}>{membership.status}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

