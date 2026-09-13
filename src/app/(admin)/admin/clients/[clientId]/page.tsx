import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { StatusBadge, planStatusTone, orderStatusTone, domainStatusTone } from "@/components/ui/StatusBadge";
import { formatPaise } from "@/lib/money";

export const metadata = { title: "Client — Admin" };

export default async function AdminClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();

  const { data: client } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, phone, email, is_admin")
    .eq("id", clientId)
    .single();

  if (!client || client.is_admin) notFound();

  const [{ data: plans }, { data: domains }, { data: orders }] = await Promise.all([
    supabase
      .from("client_plans")
      .select("id, plan_name, status, base_price_paise, started_at")
      .eq("client_id", clientId)
      .order("started_at", { ascending: false }),
    supabase.from("domain_status").select("id, domain_name, status").eq("client_id", clientId),
    supabase
      .from("orders")
      .select("id, description, amount_paise, status, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            {client.full_name || client.company_name || "Unnamed client"}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {[client.email, client.phone].filter(Boolean).join(" · ") || "No contact details on file"}
          </p>
        </div>
        <GradientButton href={`/admin/clients/${clientId}/payments/new`}>New Payment Request</GradientButton>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-text-muted">Plans</p>
          {plans && plans.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {plans.map((plan) => (
                <li key={plan.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-white">{plan.plan_name}</span>
                  <StatusBadge label={plan.status} tone={planStatusTone[plan.status]} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">None assigned.</p>
          )}
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-text-muted">Domains</p>
          {domains && domains.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {domains.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-white">{d.domain_name}</span>
                  <StatusBadge label={d.status.replace("_", " ")} tone={domainStatusTone[d.status]} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">None on file.</p>
          )}
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-text-muted">Recent Orders</p>
          {orders && orders.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-white">{formatPaise(order.amount_paise)}</span>
                  <StatusBadge label={order.status} tone={orderStatusTone[order.status]} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">No payment requests yet.</p>
          )}
        </GlassCard>
      </div>

      {/*
        Editing an existing client's plan/assets/domain status after
        creation is still a follow-up — for now those are set at creation
        time (plan) or not editable from the UI yet (assets/domain).
      */}
    </div>
  );
}
