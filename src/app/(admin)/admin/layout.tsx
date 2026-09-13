import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

// middleware.ts (proxy.ts) is the primary guard (redirects non-admins to
// /account before this ever renders); this re-check is a defensive
// fallback, same as (portal)/account/layout.tsx.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, email, is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/account");

  return (
    <AdminShell adminName={profile.full_name || "Admin"} adminEmail={profile.email || user.email || ""}>
      {children}
    </AdminShell>
  );
}
