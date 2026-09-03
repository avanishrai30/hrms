"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewLocationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/locations" as Route);
  }, [router]);

  return null;
}
