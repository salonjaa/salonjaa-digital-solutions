import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { StatusBadge, planStatusTone } from "@/components/ui/StatusBadge";

export const metadata = { title: "Clients — Admin" };

export default async function AdminClientsPage() {
  const supabase = await getServerClient();

  // is_admin() RLS lets this admin session see every client's rows, not
  // just its own — no service-role client needed for a read like this.
  // client_plans has two FKs to profiles (client_id, created_by), so the
  // embed needs an explicit hint — otherwise PostgREST can't tell which
  // relationship to follow.
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, phone, client_plans!client_plans_client_id_fkey(plan_name, status)")
    .eq("is_admin", false)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Clients</h1>
          <p className="mt-1 text-sm text-text-secondary">Every client account provisioned on the studio.</p>
        </div>
        <GradientButton href="/admin/clients/new">New Client</GradientButton>
      </div>

      {clients && clients.length > 0 ? (
        <div className="space-y-3">
          {clients.map((client) => {
            const activePlan = client.client_plans?.find((p) => p.status === "active");
            return (
              <Link key={client.id} href={`/admin/clients/${client.id}`} data-cursor-hover>
                <GlassCard className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold text-white">
                      {client.full_name || client.company_name || "Unnamed client"}
                    </p>
                    {client.phone && <p className="text-sm text-text-secondary">{client.phone}</p>}
                  </div>
                  {activePlan ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">{activePlan.plan_name}</span>
                      <StatusBadge label={activePlan.status} tone={planStatusTone[activePlan.status]} />
                    </div>
                  ) : (
                    <span className="text-sm text-text-muted">No active plan</span>
                  )}
                </GlassCard>
              </Link>
            );
          })}
        </div>
      ) : (
        <GlassCard>
          <p className="text-sm text-text-secondary">
            No clients yet — create the first one once a plan is sold.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
