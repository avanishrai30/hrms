"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input, Panel } from "../../components/ui";
import { apiRequest } from "../../lib/api";
import { useSessionStore } from "../../lib/session-store";

const schema = z.object({
  tenantSlug: z.string().min(2),
  identifier: z.string().min(3),
  password: z.string().min(8),
  deviceFingerprint: z.string().min(8)
});

type LoginForm = z.infer<typeof schema>;

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string };
  tenant: { name: string };
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantSlug: process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? "vc-organics",
      identifier: "",
      password: "",
      deviceFingerprint: typeof navigator === "undefined" ? "server-device" : navigator.userAgent.slice(0, 64)
    }
  });
  const login = useMutation({
    mutationFn: (values: LoginForm) =>
      apiRequest<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(values) }),
    onSuccess: (result) => {
      setSession(result.accessToken, result.tenant.name, []);
      router.push("/dashboard");
    }
  });

  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[1fr_520px]">
      <section className="hidden border-r border-border p-10 lg:grid">
        <div className="mt-auto max-w-xl">
          <div className="mb-6 grid h-12 w-12 place-items-center rounded-panel bg-primary font-semibold text-white">W</div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">Workforce operations, tenant by tenant.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600">
            A secure foundation for employees, roles, settings, and tenant administration.
          </p>
        </div>
      </section>
      <section className="grid place-items-center p-4">
        <Panel className="w-full max-w-md">
          <div className="mb-6">
            <p className="text-sm font-medium text-primary">VC-WMS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Sign in</h2>
            <p className="mt-2 text-sm text-zinc-600">Use your tenant workspace credentials.</p>
          </div>
          <form className="grid gap-4" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
            <Field label="Tenant slug" error={form.formState.errors.tenantSlug?.message}>
              <Input {...form.register("tenantSlug")} autoComplete="organization" />
            </Field>
            <Field label="Email or phone" error={form.formState.errors.identifier?.message}>
              <Input {...form.register("identifier")} autoComplete="username" />
            </Field>
            <Field label="Password" error={form.formState.errors.password?.message}>
              <Input {...form.register("password")} autoComplete="current-password" type="password" />
            </Field>
            {login.isError ? <p className="rounded-control bg-red-50 p-3 text-sm text-red-700">Sign in failed. Check access and try again.</p> : null}
            <Button disabled={login.isPending} type="submit">
              {login.isPending ? "Signing in" : "Sign in"}
            </Button>
          </form>
        </Panel>
      </section>
    </main>
  );
}

