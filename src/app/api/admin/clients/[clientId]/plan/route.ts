import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/adminAuth";
import { assignPlanSchema, updatePlanSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

/** Assigns a new plan to a client, snapshotting name/price at assignment time (see 0001's note on why — decoupled from src/content/plans.ts). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-assign-plan:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = assignPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  if (parsed.data.endCurrentPlan) {
    await supabase
      .from("client_plans")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("client_id", clientId)
      .eq("status", "active");
  }

  const { error } = await supabase.from("client_plans").insert({
    client_id: clientId,
    plan_key: parsed.data.planKey,
    plan_name: parsed.data.planName,
    base_price_paise: parsed.data.basePricePaise,
    notes: parsed.data.notes || null,
    created_by: auth.user.id,
  });

  if (error) {
    console.error("Failed to assign plan", error);
    return NextResponse.json({ ok: false, error: "Failed to assign plan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Updates an existing plan row's status/notes — e.g. pausing or ending it without replacing it. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-update-plan:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("client_plans")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      ended_at: parsed.data.status === "ended" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.planId)
    .eq("client_id", clientId);

  if (error) {
    console.error("Failed to update plan", error);
    return NextResponse.json({ ok: false, error: "Failed to update plan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
