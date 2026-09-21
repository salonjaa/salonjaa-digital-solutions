"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { plans } from "@/content/plans";
import { parsePriceToPaise } from "@/lib/money";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { IndianPhoneInput } from "@/components/forms/IndianPhoneInput";
import { CloseIcon } from "@/components/icons/AdminIcons";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

export function NewClientForm() {
  const [planKey, setPlanKey] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ clientId: string; emailSent: boolean } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const selectedTier = plans.tiers.find((t) => t.tag === planKey);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          planKey: selectedTier?.tag ?? "",
          planName: selectedTier?.name ?? "",
          planPricePaise: selectedTier ? parsePriceToPaise(selectedTier.price) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error ?? "Failed to create client.");
        return;
      }
      setStatus("idle");
      setCreated({ clientId: json.clientId, emailSent: json.emailSent });
    } catch {
      setStatus("error");
      setError("Something went wrong — please try again.");
    }
  }

  if (created) {
    return (
      <GlassCard hover={false} className="space-y-3">
        <p className="text-sm text-emerald">Client account created.</p>
        <p className="text-sm text-text-secondary">
          {created.emailSent
            ? "Their login details (email + a generated password) were emailed to them automatically."
            : "The welcome email failed to send — ask them to use \"Forgot password\" on the login page to set their own password."}
        </p>
        <Link href={`/admin/clients/${created.clientId}`} data-cursor-hover className="inline-block">
          <GradientButton>Go to client</GradientButton>
        </Link>
      </GlassCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass relative space-y-4 p-6 sm:p-8">
      <Link
        href="/admin/clients"
        aria-label="Close"
        data-cursor-hover
        className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
      >
        <CloseIcon className="h-5 w-5" />
      </Link>
      <div>
        <label htmlFor="client-name" className="mb-1.5 block text-sm font-medium text-white">
          Full name
        </label>
        <input id="client-name" name="fullName" type="text" required className={inputClasses} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="client-email" className="mb-1.5 block text-sm font-medium text-white">
            Email
          </label>
          <input id="client-email" name="email" type="email" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="client-phone" className="mb-1.5 block text-sm font-medium text-white">
            Phone / WhatsApp <span className="text-text-muted">(optional)</span>
          </label>
          <IndianPhoneInput id="client-phone" name="phone" />
        </div>
      </div>
      <div>
        <label htmlFor="client-company" className="mb-1.5 block text-sm font-medium text-white">
          Company <span className="text-text-muted">(optional)</span>
        </label>
        <input id="client-company" name="companyName" type="text" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="client-plan" className="mb-1.5 block text-sm font-medium text-white">
          Plan <span className="text-text-muted">(optional — can skip and assign later)</span>
        </label>
        <select
          id="client-plan"
          value={planKey}
          onChange={(e) => setPlanKey(e.target.value)}
          className={inputClasses}
        >
          <option value="">No plan yet</option>
          {plans.tiers.map((tier) => (
            <option key={tier.tag} value={tier.tag} className="bg-surface text-white">
              {tier.name} — {tier.tag} ({tier.price})
            </option>
          ))}
        </select>
      </div>
      {status === "error" && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </p>
      )}
      <GradientButton type="submit" size="lg" disabled={status === "pending"} className="w-full disabled:opacity-60">
        {status === "pending" ? "Creating…" : "Create Client"}
      </GradientButton>
    </form>
  );
}
