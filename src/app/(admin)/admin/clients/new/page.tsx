import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = { title: "New Client — Admin" };

// Stub — the real create-client flow needs api/admin/clients (Supabase
// Admin API user creation via the service-role client), which lands once
// SUPABASE_SERVICE_ROLE_KEY is configured. The route path and page exist
// now so the "New Client" button on /admin has somewhere to go.
export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-white">New Client</h1>
      <GlassCard>
        <p className="text-sm text-text-secondary">
          Client provisioning is coming in the next build pass — it needs the Supabase service-role key configured
          first.
        </p>
      </GlassCard>
    </div>
  );
}
