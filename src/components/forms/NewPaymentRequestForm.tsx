"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { plans } from "@/content/plans";
import { formatPaise, parsePriceToPaise } from "@/lib/money";
import { withWhatsappMessage, waLinkFromPhone } from "@/lib/whatsapp";
import { site } from "@/content/site";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

type CreatedOrder = { orderId: string; description: string; amountPaise: number };

export function NewPaymentRequestForm({
  clientId,
  clientName,
  clientPhone,
}: {
  clientId: string;
  clientName: string;
  clientPhone: string | null;
}) {
  const [description, setDescription] = useState("");
  const [amountRupees, setAmountRupees] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedOrder | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");

  function applyTier(tag: string) {
    const tier = plans.tiers.find((t) => t.tag === tag);
    if (!tier) return;
    setDescription(`${tier.name} — ${tier.tag} plan`);
    setAmountRupees(String(parsePriceToPaise(tier.price) / 100));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    const amountPaise = Math.round(Number(amountRupees) * 100);
    if (!amountPaise || amountPaise < 100) {
      setStatus("error");
      setError("Enter an amount of at least ₹1.");
      return;
    }

    try {
      const res = await fetch("/api/admin/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, description, amountPaise, lineItems: [] }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error ?? "Failed to create payment request.");
        return;
      }
      setCreated({ orderId: json.orderId, description, amountPaise });
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Something went wrong — please try again.");
    }
  }

  async function handleSendEmail() {
    if (!created) return;
    setEmailStatus("pending");
    try {
      const res = await fetch("/api/admin/payments/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: created.orderId }),
      });
      const json = await res.json();
      setEmailStatus(res.ok && json.ok ? "sent" : "error");
    } catch {
      setEmailStatus("error");
    }
  }

  if (created) {
    const waMessage = `Hi ${clientName}, a payment request for ${formatPaise(created.amountPaise)} (${created.description}) is ready on your Salonjaa account. Log in to pay: ${site.url}/login?next=/account/payments`;

    return (
      <div className="card-glass space-y-4 p-6 sm:p-8">
        <p className="text-sm text-emerald">
          Payment request created — {formatPaise(created.amountPaise)} for &quot;{created.description}&quot;. It&apos;s
          already visible on the client&apos;s dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          {clientPhone ? (
            <Button href={withWhatsappMessage(waLinkFromPhone(clientPhone), waMessage)} variant="whatsapp" size="md">
              Send via WhatsApp
            </Button>
          ) : (
            <p className="text-xs text-text-muted">No phone on file — can&apos;t send a WhatsApp link.</p>
          )}
          <Button type="button" variant="outline" size="md" onClick={handleSendEmail} disabled={emailStatus === "pending"}>
            {emailStatus === "sent" ? "Email sent ✓" : emailStatus === "pending" ? "Sending…" : "Email the client"}
          </Button>
        </div>
        {emailStatus === "error" && <p className="text-sm text-red-400">Failed to send the email — try again.</p>}
        <Link href={`/admin/clients/${clientId}`} data-cursor-hover className="inline-block text-sm text-cyan hover:underline">
          ← Back to client
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 p-6 sm:p-8">
      <div>
        <label htmlFor="payment-tier" className="mb-1.5 block text-sm font-medium text-white">
          Prefill from a plan <span className="text-text-muted">(optional)</span>
        </label>
        <select id="payment-tier" onChange={(e) => applyTier(e.target.value)} defaultValue="" className={inputClasses}>
          <option value="">Custom amount</option>
          {plans.tiers.map((tier) => (
            <option key={tier.tag} value={tier.tag} className="bg-surface text-white">
              {tier.name} — {tier.tag} ({tier.price})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="payment-description" className="mb-1.5 block text-sm font-medium text-white">
          Description
        </label>
        <input
          id="payment-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={200}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="payment-amount" className="mb-1.5 block text-sm font-medium text-white">
          Amount (₹)
        </label>
        <input
          id="payment-amount"
          type="number"
          min={1}
          step="1"
          value={amountRupees}
          onChange={(e) => setAmountRupees(e.target.value)}
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
        {status === "pending" ? "Creating…" : "Create Payment Request"}
      </GradientButton>
    </form>
  );
}
