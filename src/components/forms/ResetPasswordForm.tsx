"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { setNewPasswordSchema } from "@/lib/validation";
import { GradientButton } from "@/components/ui/GradientButton";
import { PasswordInput } from "@/components/ui/PasswordInput";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

/**
 * Lands here from the link in the forgot-password email. Supabase's
 * browser client auto-exchanges the recovery token in the URL for a
 * session on load (detectSessionInUrl, on by default) and fires a
 * PASSWORD_RECOVERY auth event once it has — we wait for that (or an
 * already-established session) before allowing the form to submit, so a
 * stale/expired link fails with a clear message instead of a confusing
 * "session missing" error from updateUser.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    const supabase = getBrowserClient();

    function markReady() {
      readyRef.current = true;
      setReady(true);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });

    // Give the URL-based session exchange a moment before concluding the
    // link is bad — it resolves on mount, but not synchronously.
    const timeout = setTimeout(() => {
      if (!readyRef.current) setInvalidLink(true);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = setNewPasswordSchema.safeParse(data);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Please check your details and try again.");
      return;
    }

    const { error: updateError } = await getBrowserClient().auth.updateUser({ password: parsed.data.password });
    if (updateError) {
      setStatus("error");
      setError(updateError.message || "Failed to update password — the link may have expired.");
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/login"), 2000);
  }

  if (invalidLink) {
    return (
      <div className="card-glass space-y-2 p-6 sm:p-8">
        <p className="text-sm text-red-400">This reset link is invalid or has expired.</p>
        <a href="/forgot-password" data-cursor-hover className="text-sm text-cyan hover:underline">
          Request a new one →
        </a>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="card-glass p-6 sm:p-8">
        <p className="text-sm text-emerald">Password updated — redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 p-6 sm:p-8">
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-white">
          New password
        </label>
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClasses}
        />
      </div>
      {status === "error" && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </p>
      )}
      <GradientButton
        type="submit"
        size="lg"
        disabled={!ready || status === "pending"}
        className="w-full disabled:opacity-60"
      >
        {!ready ? "Verifying link…" : status === "pending" ? "Saving…" : "Set New Password"}
      </GradientButton>
    </form>
  );
}
