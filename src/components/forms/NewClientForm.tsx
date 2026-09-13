"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { plans } from "@/content/plans";
import { parsePriceToPaise } from "@/lib/money";
import { GradientButton } from "@/components/ui/GradientButton";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

function generatePassword() {
  // Random, pronounceable-ish and copy-pasteable — not meant to be typed by
  // hand, the admin sends it to the client via WhatsApp/email.
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 12);
}

export function NewClientForm() {
  const router = useRouter();
  const [password, setPassword] = useState(generatePassword);
  const [planKey, setPlanKey] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
          password,
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
      router.push(`/admin/clients/${json.clientId}`);
      router.refresh();
    } catch {
      setStatus("error");
      setError("Something went wrong — please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 p-6 sm:p-8">
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
          <input id="client-phone" name="phone" type="tel" placeholder="+91 90000 00000" className={inputClasses} />
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
      <div>
        <label htmlFor="client-password" className="mb-1.5 block text-sm font-medium text-white">
          Login password
        </label>
        <div className="flex gap-2">
          <input
            id="client-password"
            name="password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClasses}
          />
          <button
            type="button"
            onClick={() => setPassword(generatePassword())}
            data-cursor-hover
            className="shrink-0 rounded-lg border border-white/15 px-3 text-xs font-medium text-text-secondary transition-colors hover:border-cyan/50 hover:text-white"
          >
            Regenerate
          </button>
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          Copy this — you&apos;ll need to send it to the client yourself (WhatsApp/email) after creating the account.
        </p>
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
