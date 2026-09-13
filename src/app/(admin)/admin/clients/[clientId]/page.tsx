import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { StatusBadge, orderStatusTone } from "@/components/ui/StatusBadge";
import { ClientProfileEditor } from "@/components/admin/ClientProfileEditor";
import { PlanManager } from "@/components/admin/PlanManager";
import { DomainManager } from "@/components/admin/DomainManager";
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
    supabase
      .from("domain_status")
      .select("id, domain_name, registrar, status, purchased_at, renewal_date, auto_renew, notes")
      .eq("client_id", clientId)
      .order("domain_name", { ascending: true }),
    supabase
      .from("orders")
      .select("id, description, amount_paise, status, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <ClientProfileEditor client={client} />

      <GradientButton href={`/admin/clients/${clientId}/payments/new`}>New Payment Request</GradientButton>

      <div className="grid gap-4 md:grid-cols-3">
        <PlanManager clientId={clientId} plans={plans ?? []} />
        <DomainManager clientId={clientId} domains={domains ?? []} />

        <GlassCard hover={false}>
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
        client_assets (files/credentials/notes/links) has no admin UI yet —
        the table and client-facing display already exist, this is a
        follow-up.
      */}
    </div>
  );
}
