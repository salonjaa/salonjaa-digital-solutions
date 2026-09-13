import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge, planStatusTone, orderStatusTone, domainStatusTone } from "@/components/ui/StatusBadge";
import { formatPaise } from "@/lib/money";

export const metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS scopes every query below to this user's own rows automatically —
  // no explicit .eq("client_id", user.id) needed, but user is non-null
  // here (the layout above already redirects otherwise) so it reads fine.
  const [{ data: plan }, { data: pendingOrder }, { data: domains }] = await Promise.all([
    supabase
      .from("client_plans")
      .select("plan_name, status, base_price_paise")
      .eq("client_id", user!.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id, description, amount_paise, status")
      .eq("client_id", user!.id)
      .in("status", ["created", "attempted"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("domain_status").select("domain_name, status").eq("client_id", user!.id),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-white">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-text-muted">Current Plan</p>
          {plan ? (
            <>
              <p className="mt-2 font-display text-lg font-semibold text-white">{plan.plan_name}</p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge label={plan.status} tone={planStatusTone[plan.status]} />
                <span className="text-sm text-text-secondary">{formatPaise(plan.base_price_paise)}</span>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">No plan assigned yet — reach out if that&apos;s unexpected.</p>
          )}
          <Link href="/account/plan" data-cursor-hover className="mt-4 inline-block text-sm text-cyan hover:underline">
            View plan &amp; assets →
          </Link>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-text-muted">Payment Status</p>
          {pendingOrder ? (
            <>
              <p className="mt-2 font-display text-lg font-semibold text-white">{formatPaise(pendingOrder.amount_paise)}</p>
              <div className="mt-2">
                <StatusBadge label={pendingOrder.status} tone={orderStatusTone[pendingOrder.status]} />
              </div>
              <p className="mt-1 text-sm text-text-secondary">{pendingOrder.description}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">No payment currently pending.</p>
          )}
          <Link href="/account/payments" data-cursor-hover className="mt-4 inline-block text-sm text-cyan hover:underline">
            View payment history →
          </Link>
        </GlassCard>
      </div>

      <GlassCard>
        <p className="text-xs uppercase tracking-wide text-text-muted">Domain Status</p>
        {domains && domains.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {domains.map((d) => (
              <li key={d.domain_name} className="flex items-center justify-between gap-3">
                <span className="text-sm text-white">{d.domain_name}</span>
                <StatusBadge label={d.status.replace("_", " ")} tone={domainStatusTone[d.status]} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-text-secondary">No domain managed by us on file.</p>
        )}
        <Link href="/account/domain" data-cursor-hover className="mt-4 inline-block text-sm text-cyan hover:underline">
          View domain details →
        </Link>
      </GlassCard>
    </div>
  );
}
