import { Panel, Badge, Button } from "../../../components/ui";

const setupItems = [
  "Review tenant settings",
  "Confirm branding",
  "Create departments",
  "Invite HR admins",
  "Add employees"
];

export default function DashboardPage() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Tenant dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">Foundation modules are ready for tenant setup and employee administration.</p>
        </div>
        <Button>Add employee</Button>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tenant status", "Active", "success"],
          ["Users", "Invite-ready", "neutral"],
          ["RBAC", "Permission based", "success"],
          ["Employees", "Foundation", "neutral"]
        ].map(([label, value, tone]) => (
          <Panel key={label}>
            <p className="text-sm text-zinc-500">{label}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xl font-semibold text-zinc-950">{value}</p>
              <Badge tone={tone === "success" ? "success" : "neutral"}>{tone === "success" ? "Ready" : "Setup"}</Badge>
            </div>
          </Panel>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel>
          <h2 className="text-base font-semibold text-zinc-950">Priority setup</h2>
          <div className="mt-4 divide-y divide-border">
            {setupItems.map((item) => (
              <div className="flex items-center justify-between py-3" key={item}>
                <span className="text-sm text-zinc-700">{item}</span>
                <Badge>Pending</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-base font-semibold text-zinc-950">Tenant isolation</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            All foundation APIs are designed around server-derived tenant context, scoped queries, and permission checks.
          </p>
        </Panel>
      </section>
    </div>
  );
}

