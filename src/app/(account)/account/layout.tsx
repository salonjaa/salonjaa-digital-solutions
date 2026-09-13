import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portal/PortalShell";

// proxy.ts is the primary guard (redirects unauthenticated visitors to
// /login before this ever renders); this re-check is a defensive
// fallback, same as (admin)/admin/layout.tsx.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name, email, is_admin")
    .eq("id", user.id)
    .single();

  // Admins have no client data of their own (no plan/orders/domain rows),
  // so landing here directly — e.g. an old bookmark, or typing the URL —
  // would just show an empty client dashboard. Send them to /admin instead.
  if (profile?.is_admin) redirect("/admin");

  return (
    <PortalShell
      displayName={profile?.full_name || profile?.company_name || "there"}
      email={profile?.email || user.email || ""}
    >
      {children}
    </PortalShell>
  );
}
