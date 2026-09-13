"use client";

import { useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { setNewPasswordSchema } from "@/lib/validation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

/**
 * For an already-logged-in user changing their password by choice —
 * distinct from the forgot-password flow (/forgot-password ->
 * /reset-password), which is for someone who can't log in at all. This
 * just calls updateUser directly since the existing session is already
 * proof enough; no email round-trip needed.
 */
export function ChangePasswordForm() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = setNewPasswordSchema.safeParse({ password: data.password });
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Please check your details and try again.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setStatus("error");
      setError("Passwords don't match.");
      return;
    }

    const { error: updateError } = await getBrowserClient().auth.updateUser({ password: parsed.data.password });
    if (updateError) {
      setStatus("error");
      setError(updateError.message || "Failed to update password.");
      return;
    }

    setStatus("success");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <GlassCard hover={false} className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="change-password" className="mb-1.5 block text-sm font-medium text-white">
            New password
          </label>
          <input
            id="change-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="change-password-confirm" className="mb-1.5 block text-sm font-medium text-white">
            Confirm new password
          </label>
          <input
            id="change-password-confirm"
            name="confirmPassword"
            type="password"
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
        {status === "success" && (
          <p className="rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm font-medium text-emerald">
            Password updated.
          </p>
        )}
        <GradientButton type="submit" size="md" disabled={status === "pending"} className="disabled:opacity-60">
          {status === "pending" ? "Saving…" : "Update Password"}
        </GradientButton>
      </form>
    </GlassCard>
  );
}
