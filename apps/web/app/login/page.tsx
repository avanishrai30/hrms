"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AiavroMark, AiavroWordmark } from "../../components/aiavro-brand";
import { apiRequest } from "../../lib/api";
import { useSessionStore } from "../../lib/session-store";

const schema = z.object({
  identifier: z.string().min(3, "Enter your work email or phone number."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

type LoginForm = z.infer<typeof schema>;

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string };
  tenant: { name: string };
}

const DEVICE_ID_KEY = "aiavro_device_id";

function getDeviceFingerprint() {
  if (typeof window === "undefined") return "web-client";
  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.length >= 8) return existing;
    const generated = globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  } catch {
    return `web-${Date.now()}`;
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#203fc2]" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);

  const nextPath = searchParams.get("next");
  const safeNextPath = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";
  const tenantSlug = "vc-organics";

  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" }
  });

  const login = useMutation({
    mutationFn: (values: LoginForm) =>
      apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          tenantSlug,
          identifier: values.identifier.trim(),
          password: values.password,
          deviceFingerprint: getDeviceFingerprint()
        })
      }),
    onSuccess: (result) => {
      setSession(result.accessToken, result.tenant.name, []);
      router.push(safeNextPath as Route);
    }
  });

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#203fc2] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-950/30 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-[calc(100dvh-2rem)] max-w-[1440px] overflow-hidden rounded-[34px] bg-white shadow-[0_32px_90px_rgba(3,10,45,0.28)] sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[0.98fr_1.02fr] lg:rounded-[42px]">
        <div className="relative flex min-h-[660px] flex-col px-6 py-7 sm:px-10 sm:py-9 lg:min-h-0 lg:px-14 lg:py-12 xl:px-20">
          <header className="flex items-center justify-between gap-4">
            <AiavroWordmark className="h-8" />
            <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">VC Organics</div>
          </header>

          <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12 lg:py-8">
            <div className="mb-9">
              <AiavroMark className="mb-5 h-11 w-11 rounded-2xl" />
              <h1 className="text-[34px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#101217] sm:text-[40px]">Welcome back</h1>
              <p className="mt-3 max-w-sm text-[14px] leading-6 text-zinc-500">Sign in to the VC Organics workspace, securely managed on AIavro.</p>
            </div>

            <form className="space-y-5" noValidate onSubmit={form.handleSubmit((values) => login.mutate(values))}>
              <div>
                <label htmlFor="identifier" className="mb-2 block text-[13px] font-medium text-zinc-700">Work email or phone</label>
                <input
                  id="identifier"
                  {...form.register("identifier")}
                  autoComplete="username"
                  placeholder="name@vcorganics.com"
                  className="h-12 w-full rounded-[14px] border border-zinc-200 bg-white px-4 text-[14px] text-zinc-950 shadow-[0_1px_2px_rgba(16,24,40,0.03)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 focus:border-[#3154d8] focus:ring-4 focus:ring-[#3154d8]/10"
                />
                {form.formState.errors.identifier ? <p className="mt-2 text-xs text-red-600">{form.formState.errors.identifier.message}</p> : null}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="password" className="text-[13px] font-medium text-zinc-700">Password</label>
                  <span className="text-[12px] text-zinc-400">Secure workspace access</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    {...form.register("password")}
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-[14px] border border-zinc-200 bg-white px-4 pr-12 text-[14px] text-zinc-950 shadow-[0_1px_2px_rgba(16,24,40,0.03)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 focus:border-[#3154d8] focus:ring-4 focus:ring-[#3154d8]/10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2.5 top-1/2 grid h-8 min-w-8 -translate-y-1/2 place-items-center rounded-lg px-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {form.formState.errors.password ? <p className="mt-2 text-xs text-red-600">{form.formState.errors.password.message}</p> : null}
              </div>

              {login.isError ? (
                <div role="alert" className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-700">
                  {login.error.message}
                </div>
              ) : null}

              <button
                disabled={login.isPending}
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[#1739c6] px-4 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(23,57,198,0.24)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#1232b5] hover:shadow-[0_14px_28px_rgba(23,57,198,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {login.isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3 text-[11px] leading-5 text-zinc-400">
              <span className="h-px flex-1 bg-zinc-100" />
              <span>AIavro platform · VC Organics tenant</span>
              <span className="h-px flex-1 bg-zinc-100" />
            </div>
          </div>

          <footer className="flex items-center justify-between gap-4 text-[11px] text-zinc-400">
            <span>© {new Date().getFullYear()} AIavro</span>
            <span>Private workforce system</span>
          </footer>
        </div>

        <aside className="relative hidden overflow-hidden bg-[#070a25] lg:block" aria-label="AIavro workforce intelligence preview">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(102,83,255,0.96),transparent_26%),radial-gradient(circle_at_32%_72%,rgba(29,76,230,0.92),transparent_34%),linear-gradient(145deg,#070917_4%,#101751_50%,#080a22_100%)]" />
          <div className="absolute -right-[11%] -top-[9%] h-[58%] w-[64%] rounded-[46%_54%_58%_42%/54%_48%_52%_46%] bg-[linear-gradient(150deg,#d9d5ff_0%,#7567ff_28%,#1f2b94_67%,#0d123c_100%)] shadow-[0_0_100px_rgba(125,110,255,0.34)]" />
          <div className="absolute bottom-[11%] left-[7%] h-[43%] w-[72%] -rotate-6 rounded-[58%_42%_52%_48%/40%_56%_44%_60%] bg-[linear-gradient(135deg,#111861_2%,#153cd0_47%,#05071c_100%)] shadow-[0_0_120px_rgba(30,75,255,0.42)]" />
          <div className="absolute left-[16%] top-[19%] h-[32%] w-[37%] rotate-12 rounded-[48%_52%_41%_59%/58%_44%_56%_42%] bg-[#0a0d37] shadow-[24px_18px_85px_rgba(0,0,0,0.52)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050716] to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-semibold tracking-[-0.02em]">AIavro</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] backdrop-blur-md">Enterprise workforce intelligence</span>
            </div>
            <div className="max-w-md pb-2 text-white">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200/80">One workforce. One operating system.</p>
              <h2 className="text-[38px] font-medium leading-[1.04] tracking-[-0.045em] xl:text-[48px]">Built for people operations that actually move.</h2>
              <p className="mt-5 max-w-sm text-[13px] leading-6 text-white/65">HR, attendance, payroll, talent and workforce intelligence — governed by AIavro, configured for VC Organics.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
