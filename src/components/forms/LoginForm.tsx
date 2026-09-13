"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { loginSchema } from "@/lib/validation";
import { GradientButton } from "@/components/ui/GradientButton";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

/**
 * Shared login for both clients and the admin — Supabase Auth doesn't
 * distinguish them, `middleware.ts` and the post-login redirect below do,
 * based on `profiles.is_admin`. Accounts are admin-provisioned; there is no
 * self-service sign-up here.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Please check your details and try again.");
      return;
    }

    const supabase = getBrowserClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInError || !signInData.user) {
      setStatus("error");
      setError("Incorrect email or password.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", signInData.user.id)
      .single();

    // A `next` pointing at /admin is only honored for an actual admin —
    // middleware.ts would bounce a non-admin straight back anyway, but
    // redirecting correctly the first time avoids a visible extra hop.
    const destination =
      next && (profile?.is_admin || !next.startsWith("/admin")) ? next : profile?.is_admin ? "/admin" : "/account";

    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 p-6 sm:p-8">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-white">
          Email
        </label>
        <input id="login-email" name="email" type="email" autoComplete="email" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-white">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </div>
      {status === "error" && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </p>
      )}
      <GradientButton type="submit" size="lg" disabled={status === "pending"} className="w-full disabled:opacity-60">
        {status === "pending" ? "Signing in…" : "Sign In"}
      </GradientButton>
    </form>
  );
}
