import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { updateClientSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

/** Edits a client's profile fields — name, email, phone, company. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-update-client:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();

  const { data: existing } = await supabase.from("profiles").select("email").eq("id", clientId).single();

  // The login email lives in auth.users (profiles.email is only a copy, with
  // no sync trigger), so a change has to go through the service-role client
  // first — otherwise the client would keep logging in with the old address.
  if (existing && existing.email?.toLowerCase() !== email) {
    const { error: authError } = await getAdminClient().auth.admin.updateUserById(clientId, {
      email,
      email_confirm: true,
    });
    if (authError) {
      console.error("Failed to update client auth email", authError);
      return NextResponse.json(
        { ok: false, error: authError.status === 422 ? "That email is already in use." : "Failed to update email." },
        { status: authError.status === 422 ? 409 : 500 }
      );
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      email,
      phone: parsed.data.phone || null,
      company_name: parsed.data.companyName || null,
    })
    .eq("id", clientId);

  if (error) {
    console.error("Failed to update client profile", error);
    return NextResponse.json({ ok: false, error: "Failed to save changes." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
