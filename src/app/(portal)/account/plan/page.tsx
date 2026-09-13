import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge, planStatusTone } from "@/components/ui/StatusBadge";
import { formatPaise } from "@/lib/money";

export const metadata = { title: "Plan & Assets" };

const kindLabel: Record<string, string> = {
  file: "File",
  credential: "Credential",
  note: "Note",
  link: "Link",
};

export default async function PlanPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: plans }, { data: assets }] = await Promise.all([
    supabase
      .from("client_plans")
      .select("id, plan_name, status, base_price_paise, custom_addons, notes, started_at, ended_at")
      .eq("client_id", user!.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("client_assets")
      .select("id, kind, title, description, url, secret_value, created_at")
      .eq("client_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const addons = (plan: NonNullable<typeof plans>[number]) =>
    Array.isArray(plan.custom_addons) ? (plan.custom_addons as { label?: string; price_paise?: number }[]) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Plan &amp; Assets</h1>
        <p className="mt-1 text-sm text-text-secondary">What you&apos;re on, and anything we&apos;ve attached to your account.</p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">Plan history</h2>
        {plans && plans.length > 0 ? (
          plans.map((plan) => (
            <GlassCard key={plan.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg font-semibold text-white">{plan.plan_name}</p>
                <StatusBadge label={plan.status} tone={planStatusTone[plan.status]} />
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                {formatPaise(plan.base_price_paise)} · started {new Date(plan.started_at).toLocaleDateString("en-IN")}
                {plan.ended_at ? ` · ended ${new Date(plan.ended_at).toLocaleDateString("en-IN")}` : ""}
              </p>
              {addons(plan).length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-text-secondary">
                  {addons(plan).map((addon, i) => (
                    <li key={i}>
                      + {addon.label}
                      {typeof addon.price_paise === "number" ? ` — ${formatPaise(addon.price_paise)}` : ""}
                    </li>
                  ))}
                </ul>
              )}
              {plan.notes && <p className="mt-3 text-sm text-text-secondary">{plan.notes}</p>}
            </GlassCard>
          ))
        ) : (
          <p className="text-sm text-text-secondary">No plan assigned yet.</p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">Assets</h2>
        {assets && assets.length > 0 ? (
          <div className="space-y-3">
            {assets.map((asset) => (
              <GlassCard key={asset.id}>
                <div className="flex items-center gap-2">
                  <span className="chip px-2.5 py-1 text-xs font-medium text-text-secondary">{kindLabel[asset.kind] ?? asset.kind}</span>
                  <p className="font-display text-base font-semibold text-white">{asset.title}</p>
                </div>
                {asset.description && <p className="mt-2 text-sm text-text-secondary">{asset.description}</p>}
                {asset.url && (
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" data-cursor-hover className="mt-2 inline-block text-sm text-cyan hover:underline">
                    {asset.url}
                  </a>
                )}
                {asset.secret_value && (
                  <p className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-sm text-white">
                    {asset.secret_value}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nothing attached to your account yet.</p>
        )}
      </div>
    </div>
  );
}
