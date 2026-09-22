import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { GradientButton } from "@/components/ui/GradientButton";
import { ClientProfileEditor } from "@/components/admin/ClientProfileEditor";
import { DeleteClientButton } from "@/components/admin/DeleteClientButton";
import { clientConfirmName } from "@/lib/clientName";
import { PlanManager } from "@/components/admin/PlanManager";
import { DomainManager } from "@/components/admin/DomainManager";
import { PaymentsManager } from "@/components/admin/PaymentsManager";

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
      .select("id, description, amount_paise, status, created_at, paid_at, receipt, razorpay_order_id, razorpay_payment_id")
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

        <PaymentsManager clientId={clientId} orders={orders ?? []} />
      </div>

      <DeleteClientButton clientId={clientId} confirmName={clientConfirmName(client)} />

      {/*
        client_assets (files/credentials/notes/links) has no admin UI yet —
        the table and client-facing display already exist, this is a
        follow-up.
      */}
    </div>
  );
}
