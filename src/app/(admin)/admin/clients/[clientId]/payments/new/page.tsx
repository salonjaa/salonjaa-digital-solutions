import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { NewPaymentRequestForm } from "@/components/forms/NewPaymentRequestForm";

export const metadata = { title: "New Payment Request — Admin" };

export default async function NewPaymentRequestPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();

  const { data: client } = await supabase
    .from("profiles")
    .select("full_name, company_name, phone, is_admin")
    .eq("id", clientId)
    .single();

  if (!client || client.is_admin) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          New Payment Request — {client.full_name || client.company_name}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Creates a real Razorpay order the client can pay from their dashboard.
        </p>
      </div>
      <NewPaymentRequestForm
        clientId={clientId}
        clientName={client.full_name || client.company_name || "there"}
        clientPhone={client.phone}
      />
    </div>
  );
}
