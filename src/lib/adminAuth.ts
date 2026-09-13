import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

/**
 * Shared admin-auth check for api/admin/* route handlers: confirms a
 * session exists and belongs to an admin. On failure, `user` is null and
 * `status`/`error` are ready to return directly; on success, `user` is
 * non-null. (api/admin/clients and api/admin/payments/create-order predate
 * this helper and inline the same check — left as-is rather than touched
 * for a refactor.)
 */
export async function requireAdmin(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: "Not signed in.", status: 401 as const };
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return { user: null, error: "Not authorized.", status: 403 as const };
  }

  return { user, error: null, status: 200 as const };
}
