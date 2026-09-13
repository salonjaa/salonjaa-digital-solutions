"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { plans } from "@/content/plans";
import { parsePriceToPaise, formatPaise } from "@/lib/money";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/icons/AdminIcons";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";
const selectClasses = inputClasses + " py-1.5";

type PlanRow = { id: string; plan_name: string; status: string; base_price_paise: number; started_at: string };

function PlanStatusSelect({ clientId, plan }: { clientId: string; plan: PlanRow }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSaving(true);
    try {
      await fetch(`/api/admin/clients/${clientId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, status: e.target.value }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select defaultValue={plan.status} onChange={handleChange} disabled={saving} className={selectClasses + " w-auto"}>
      <option value="active" className="bg-surface">
        Active
      </option>
      <option value="paused" className="bg-surface">
        Paused
      </option>
      <option value="ended" className="bg-surface">
        Ended
      </option>
    </select>
  );
}

function AssignPlanForm({ clientId, hasActivePlan }: { clientId: string; hasActivePlan: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTier(tag: string) {
    const tier = plans.tiers.find((t) => t.tag === tag);
    if (!tier) return;
    setPlanName(`${tier.name} — ${tier.tag}`);
    setPriceRupees(String(parsePriceToPaise(tier.price) / 100));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey: planName,
          planName,
          basePricePaise: Math.round(Number(priceRupees) * 100),
          notes: data.notes,
          endCurrentPlan: data.endCurrentPlan === "on",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to assign plan.");
        return;
      }
      setOpen(false);
      setPlanName("");
      setPriceRupees("");
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="md" onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        Assign Plan
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <select onChange={(e) => applyTier(e.target.value)} defaultValue="" className={selectClasses}>
        <option value="" className="bg-surface">
          Custom plan
        </option>
        {plans.tiers.map((tier) => (
          <option key={tier.tag} value={tier.tag} className="bg-surface">
            {tier.name} — {tier.tag} ({tier.price})
          </option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="Plan name"
          required
          className={inputClasses}
        />
        <input
          value={priceRupees}
          onChange={(e) => setPriceRupees(e.target.value)}
          type="number"
          min={0}
          placeholder="Price (₹)"
          required
          className={inputClasses}
        />
      </div>
      <textarea name="notes" placeholder="Notes (optional)" rows={2} className={inputClasses} />
      {hasActivePlan && (
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input type="checkbox" name="endCurrentPlan" defaultChecked className="accent-cyan" />
          End the current active plan
        </label>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="md" disabled={saving}>
          {saving ? "Saving…" : "Assign"}
        </Button>
        <Button type="button" variant="outline" size="md" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function PlanManager({ clientId, plans: planRows }: { clientId: string; plans: PlanRow[] }) {
  const hasActivePlan = planRows.some((p) => p.status === "active");

  return (
    <GlassCard hover={false}>
      <p className="text-xs uppercase tracking-wide text-text-muted">Plans</p>
      {planRows.length > 0 ? (
        <div className="mt-3 space-y-2">
          {planRows.map((plan) => (
            <div key={plan.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 last:border-0">
              <div>
                <p className="text-sm text-white">{plan.plan_name}</p>
                <p className="text-xs text-text-muted">{formatPaise(plan.base_price_paise)}</p>
              </div>
              <PlanStatusSelect clientId={clientId} plan={plan} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-text-secondary">None assigned.</p>
      )}
      <div className="mt-3">
        <AssignPlanForm clientId={clientId} hasActivePlan={hasActivePlan} />
      </div>
    </GlassCard>
  );
}
