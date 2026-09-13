"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/browser";

type AccountState = "loading" | "signed-out" | "client" | "admin";

/**
 * The marketing Navbar/MobileMenu have no server-side auth awareness (they
 * render the same static chrome for everyone), so this resolves the
 * viewer's login state client-side on mount and reacts to sign-in/out —
 * the only way to show "Login" vs "My Account" vs "Admin" without turning
 * the whole marketing layout into a per-request dynamic render.
 */
function useAccountState(): AccountState {
  const [state, setState] = useState<AccountState>("loading");

  useEffect(() => {
    const supabase = getBrowserClient();
    let cancelled = false;

    async function resolve(userId: string | null) {
      if (!userId) {
        if (!cancelled) setState("signed-out");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
      if (!cancelled) setState(profile?.is_admin ? "admin" : "client");
    }

    supabase.auth.getUser().then(({ data }) => resolve(data.user?.id ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => resolve(session?.user?.id ?? null));

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function AccountNavLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const state = useAccountState();

  // Avoids a "Login" flash for an already-signed-in visitor while the
  // client-side check resolves.
  if (state === "loading") return null;

  const { href, label } =
    state === "admin"
      ? { href: "/admin", label: "Admin" }
      : state === "client"
        ? { href: "/account", label: "My Account" }
        : { href: "/login", label: "Login" };

  return (
    <Link href={href} onClick={onClick} data-cursor-hover className={className}>
      {label}
    </Link>
  );
}
