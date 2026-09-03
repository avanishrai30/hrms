import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "../../components/app-shell";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("aiavro_session");

  if (!sessionCookie && process.env.NODE_ENV === "production") {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
