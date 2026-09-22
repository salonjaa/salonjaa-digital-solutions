import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { clientConfirmName } from "@/lib/clientName";
import { deleteClientSchema, updateClientSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { generatePassword } from "@/lib/password";
import { sendLoginUpdatedEmail } from "@/lib/resend";
import { site } from "@/content/site";

/** Edits a client's profile fields — name, email, phone, company. Changing the email also resets the password. */
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
  // A new password is issued at the same time and emailed to the new address
  // (never shown to the admin), so the old credentials stop working.
  const emailChanged = !!existing && existing.email?.toLowerCase() !== email;
  const newPassword = emailChanged ? generatePassword() : null;

  if (emailChanged && newPassword) {
    const { error: authError } = await getAdminClient().auth.admin.updateUserById(clientId, {
      email,
      password: newPassword,
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

  // Best-effort, like the welcome email — the account is already updated, so
  // a failed send shouldn't fail the request. The client can still use
  // "Forgot password" on /login with the new address.
  let emailSent: boolean | undefined;
  if (emailChanged && newPassword) {
    try {
      await sendLoginUpdatedEmail({
        to: email,
        clientName: parsed.data.fullName,
        password: newPassword,
        loginUrl: `${site.url}/login`,
      });
      emailSent = true;
    } catch (err) {
      console.error("Failed to send login-updated email", err);
      emailSent = false;
    }
  }

  return NextResponse.json({ ok: true, emailChanged, emailSent });
}

/**
 * Permanently deletes a client. Deleting the Auth user cascades to their
 * profile, plans, domains and assets — but not to `orders` (no cascade,
 * deliberately) or to messages they sent, so those are handled explicitly:
 * a client with any *paid* order is refused outright (that's a real revenue
 * record, kept forever), while any non-paid orders (created/attempted/
 * failed/cancelled — see PaymentsManager's soft-cancel) are removed here so
 * the FK doesn't block the account delete; their chat threads are removed
 * first so the message FK doesn't block either. The confirmation name is
 * re-checked here, not just in the modal.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-delete-client:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = deleteClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the details and try again." },
      { status: 400 }
    );
  }

  const { data: client } = await supabase
    .from("profiles")
    .select("full_name, email, is_admin")
    .eq("id", clientId)
    .single();

  // Never delete an admin through this route (also covers deleting yourself).
  if (!client || client.is_admin) {
    return NextResponse.json({ ok: false, error: "Client not found." }, { status: 404 });
  }

  if (parsed.data.confirmName !== clientConfirmName(client)) {
    return NextResponse.json({ ok: false, error: "The name you typed doesn't match." }, { status: 400 });
  }

  const admin = getAdminClient();

  const { count: paidOrderCount, error: orderError } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("status", "paid");

  if (orderError) {
    console.error("Failed to check client orders before delete", orderError);
    return NextResponse.json({ ok: false, error: "Failed to delete client." }, { status: 500 });
  }
  if (paidOrderCount && paidOrderCount > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "This client has paid payment records on file, which can't be deleted along with the account.",
      },
      { status: 409 }
    );
  }

  // Any remaining orders here are non-paid (created/attempted/failed/
  // cancelled) — no revenue record, safe to remove along with the account.
  // The .neq guard is a last-ditch safety net against a payment landing in
  // the gap between the check above and this delete.
  const { error: nonPaidOrderError } = await admin.from("orders").delete().eq("client_id", clientId).neq("status", "paid");
  if (nonPaidOrderError) {
    console.error("Failed to delete client's non-paid orders", nonPaidOrderError);
    return NextResponse.json({ ok: false, error: "Failed to delete client." }, { status: 500 });
  }

  const { error: threadError } = await admin.from("chat_threads").delete().eq("client_id", clientId);
  if (threadError) {
    console.error("Failed to delete client chat threads", threadError);
    return NextResponse.json({ ok: false, error: "Failed to delete client." }, { status: 500 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(clientId);
  if (deleteError) {
    console.error("Failed to delete client auth user", deleteError);
    return NextResponse.json({ ok: false, error: "Failed to delete client." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
