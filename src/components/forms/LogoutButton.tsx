"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await getBrowserClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      data-cursor-hover
      className={className ?? "text-sm font-medium text-text-secondary transition-colors hover:text-white disabled:opacity-60"}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
