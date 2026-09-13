"use client";

import { useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { forgotPasswordSchema } from "@/lib/validation";
import { GradientButton } from "@/components/ui/GradientButton";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

/**
 * Self-service password reset — the only way a client (or admin) gets back
 * into their account if they forget their password. Admin has no way to
 * see or set a client's password anymore; this replaces that.
 */
export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Please check your details and try again.");
      return;
    }

    const { error: resetError } = await getBrowserClient().auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Supabase doesn't reveal whether the email exists — always show the
    // same success message so this can't be used to enumerate accounts.
    if (resetError) {
      console.error("resetPasswordForEmail failed", resetError);
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="card-glass space-y-2 p-6 sm:p-8">
        <p className="text-sm text-emerald">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <p className="text-sm text-text-secondary">Check your inbox (and spam folder) — the link expires after a while.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 p-6 sm:p-8">
      <div>
        <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-white">
          Email
        </label>
        <input id="forgot-email" name="email" type="email" autoComplete="email" required className={inputClasses} />
      </div>
      {status === "error" && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </p>
      )}
      <GradientButton type="submit" size="lg" disabled={status === "pending"} className="w-full disabled:opacity-60">
        {status === "pending" ? "Sending…" : "Send Reset Link"}
      </GradientButton>
    </form>
  );
}
