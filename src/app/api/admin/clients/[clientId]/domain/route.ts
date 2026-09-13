import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/adminAuth";
import { domainSchema, updateDomainSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

/** Adds a domain the studio manages on the client's behalf. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-add-domain:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = domainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("domain_status").insert({
    client_id: clientId,
    domain_name: parsed.data.domainName,
    registrar: parsed.data.registrar || null,
    status: parsed.data.status,
    purchased_at: parsed.data.purchasedAt || null,
    renewal_date: parsed.data.renewalDate || null,
    auto_renew: parsed.data.autoRenew,
    notes: parsed.data.notes || null,
  });

  if (error) {
    console.error("Failed to add domain", error);
    return NextResponse.json({ ok: false, error: "Failed to add domain." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Updates an existing domain entry (status, renewal date, etc). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-update-domain:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = updateDomainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("domain_status")
    .update({
      domain_name: parsed.data.domainName,
      registrar: parsed.data.registrar || null,
      status: parsed.data.status,
      purchased_at: parsed.data.purchasedAt || null,
      renewal_date: parsed.data.renewalDate || null,
      auto_renew: parsed.data.autoRenew,
      notes: parsed.data.notes || null,
    })
    .eq("id", parsed.data.domainId)
    .eq("client_id", clientId);

  if (error) {
    console.error("Failed to update domain", error);
    return NextResponse.json({ ok: false, error: "Failed to update domain." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
