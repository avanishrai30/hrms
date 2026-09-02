"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AiavroMark, AiavroWordmark } from "../../components/aiavro-brand";
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
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);
  const nextPath = searchParams.get("next");
  const safeNextPath = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";
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
      router.push(safeNextPath as Route);
    }
  });

  return (
    <LoginShell>
      <Panel className="w-full max-w-md border-zinc-200 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-6">
          <div className="mb-5 lg:hidden">
            <AiavroWordmark />
          </div>
          <p className="text-sm font-medium text-zinc-500">VC Organics Workspace</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Sign in</h2>
          <p className="mt-2 text-sm text-zinc-600">Use your work email or phone to continue into AIavro.</p>
        </div>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
          <input {...form.register("tenantSlug")} type="hidden" />
          <div className="rounded-panel border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-xs font-medium text-zinc-500">Workspace detected</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900">VC Organics</p>
          </div>
          <Field label="Email or phone" error={form.formState.errors.identifier?.message}>
            <Input {...form.register("identifier")} autoComplete="username" />
          </Field>
          <Field label="Password" error={form.formState.errors.password?.message}>
            <Input {...form.register("password")} autoComplete="current-password" type="password" />
          </Field>
          {login.isError ? <p className="rounded-control bg-red-50 p-3 text-sm text-red-700">{login.error.message}</p> : null}
          <Button disabled={login.isPending} type="submit">
            {login.isPending ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </Panel>
    </LoginShell>
  );
}

function LoginShell({ children }: { children?: ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-[#101417] p-3 text-zinc-950 lg:grid-cols-[minmax(0,1fr)_520px]">
      <section className="hidden rounded-overlay bg-[#f6f7f4] p-10 lg:grid">
        <div className="flex items-start justify-between">
          <AiavroWordmark className="h-8" />
          <p className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">AIavro Workforce</p>
        </div>
        <div className="mt-auto max-w-2xl">
          <AiavroMark className="mb-7 h-14 w-14" />
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-zinc-950">One secure workforce platform for every tenant.</h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-zinc-600">
            AIavro provides the product layer. VC Organics is your active workspace.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-xs text-zinc-600">
            {["Tenant isolated", "Permission aware", "PWA ready"].map((item) => (
              <div className="rounded-panel border border-zinc-200 bg-white p-3" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid place-items-center p-4">
        {children ?? (
          <Panel className="w-full max-w-md border-zinc-200 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <AiavroMark className="mx-auto mb-4" />
            <p className="text-center text-sm font-semibold text-zinc-950">Preparing secure sign in</p>
          </Panel>
        )}
      </section>
    </main>
  );
}
