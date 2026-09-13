import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClientSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Admin provisions a client's login (email + admin-set password — no
 * self-serve signup) and, optionally, their initial plan in the same call.
 * User creation itself has to go through the service-role client (no other
 * way to create a Supabase Auth user server-side); everything else uses the
 * calling admin's own RLS-scoped session, same as every other admin write
 * in this app.
 */
export async function POST(req: NextRequest) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  }

  if (!checkRateLimit(`admin-create-client:${user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  const { fullName, email, phone, companyName, password, planKey, planName, planPricePaise } = parsed.data;

  const { data: created, error: createError } = await getAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    // Most common case in practice: the email is already registered.
    console.error("Failed to create client auth user", createError);
    return NextResponse.json(
      { ok: false, error: createError?.message ?? "Failed to create client account." },
      { status: createError?.status === 422 ? 409 : 500 }
    );
  }

  const clientId = created.user.id;

  // handle_new_user() already inserted a bare profile row (id, full_name,
  // email) — fill in the rest via the admin's own RLS session, same policy
  // path as every other admin write.
  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ phone: phone || null, company_name: companyName || null })
    .eq("id", clientId);

  if (profileUpdateError) {
    console.error("Failed to update new client's profile", profileUpdateError);
    // Not fatal — the login still works, admin can fill these in later once
    // that UI exists. Surface it but don't roll back the account.
  }

  if (planKey) {
    const { error: planError } = await supabase.from("client_plans").insert({
      client_id: clientId,
      plan_key: planKey,
      plan_name: planName || planKey,
      base_price_paise: planPricePaise ?? 0,
      created_by: user.id,
    });
    if (planError) {
      console.error("Failed to assign initial plan", planError);
    }
  }

  return NextResponse.json({ ok: true, clientId });
}
