import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge, orderStatusTone } from "@/components/ui/StatusBadge";
import { StatTile } from "@/components/admin/StatTile";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusBreakdownChart } from "@/components/admin/StatusBreakdownChart";
import { UsersIcon, BriefcaseIcon, RupeeIcon, ClockIcon } from "@/components/icons/AdminIcons";
import { computeRevenueByMonth, computeStatusBreakdown, computeTotals } from "@/lib/admin-stats";
import { formatPaise } from "@/lib/money";

export const metadata = { title: "Dashboard — Admin" };

export default async function AdminDashboardPage() {
  const supabase = await getServerClient();

  const [{ data: orders }, { count: clientCount }, { count: activePlanCount }] = await Promise.all([
    // Two FKs to profiles (client_id, created_by) — the embed needs an
    // explicit hint, same as the client list query.
    supabase
      .from("orders")
      .select(
        "id, amount_paise, status, description, created_at, paid_at, client_id, profiles!orders_client_id_fkey(full_name, company_name)"
      )
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", false),
    supabase.from("client_plans").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const allOrders = orders ?? [];
  const { totalRevenuePaise, pendingAmountPaise, pendingCount } = computeTotals(allOrders);
  const revenueByMonth = computeRevenueByMonth(allOrders);
  const statusBreakdown = computeStatusBreakdown(allOrders);
  const recentOrders = allOrders.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Studio-wide revenue and client activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Revenue" value={formatPaise(totalRevenuePaise)} icon={RupeeIcon} tone="positive" />
        <StatTile
          label="Pending Payments"
          value={`${formatPaise(pendingAmountPaise)} · ${pendingCount}`}
          icon={ClockIcon}
          tone="warning"
        />
        <StatTile label="Clients" value={String(clientCount ?? 0)} icon={UsersIcon} />
        <StatTile label="Active Plans" value={String(activePlanCount ?? 0)} icon={BriefcaseIcon} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3" hover={false}>
          <p className="text-xs uppercase tracking-wide text-text-muted">Revenue — last 6 months</p>
          <div className="mt-4">
            <RevenueChart data={revenueByMonth} />
          </div>
        </GlassCard>
        <GlassCard className="lg:col-span-2" hover={false}>
          <p className="text-xs uppercase tracking-wide text-text-muted">Orders by status</p>
          <div className="mt-4">
            <StatusBreakdownChart data={statusBreakdown} />
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-text-muted">Recent Activity</p>
          <Link href="/admin/clients" data-cursor-hover className="text-sm text-cyan hover:underline">
            View all clients →
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="mt-3 space-y-2">
            {recentOrders.map((order) => {
              const client = order.profiles as unknown as { full_name: string | null; company_name: string | null } | null;
              return (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 py-2 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {client?.full_name || client?.company_name || "Unknown client"}
                    </p>
                    <p className="truncate text-xs text-text-muted">{order.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-secondary">{formatPaise(order.amount_paise)}</span>
                    <StatusBadge label={order.status} tone={orderStatusTone[order.status]} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-text-secondary">No payment activity yet.</p>
        )}
      </GlassCard>
    </div>
  );
}
