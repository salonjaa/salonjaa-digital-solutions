import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendWelcomeEmail } from "@/lib/resend";
import { site } from "@/content/site";

function generatePassword() {
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 12);
}

/**
 * Generates a new password for an existing client (e.g. "client forgot
 * their password") and emails it via the same welcome-email template used
 * at account creation — there's no self-serve "forgot password" flow yet,
 * so this is the only way a client's password ever gets reset.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await getServerClient();
  const auth = await requireAdmin(supabase);
  if (!auth.user) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  if (!checkRateLimit(`admin-reset-password:${auth.user.id}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  const { data: client } = await supabase
    .from("profiles")
    .select("full_name, email, is_admin")
    .eq("id", clientId)
    .single();

  if (!client || client.is_admin) {
    return NextResponse.json({ ok: false, error: "Client not found." }, { status: 404 });
  }
  if (!client.email) {
    return NextResponse.json({ ok: false, error: "This client has no email on file." }, { status: 400 });
  }

  const password = generatePassword();
  const { error: updateError } = await getAdminClient().auth.admin.updateUserById(clientId, { password });
  if (updateError) {
    console.error("Failed to reset client password", updateError);
    return NextResponse.json({ ok: false, error: "Failed to reset password." }, { status: 500 });
  }

  let emailSent = true;
  try {
    await sendWelcomeEmail({
      to: client.email,
      clientName: client.full_name || "there",
      password,
      loginUrl: `${site.url}/login`,
    });
  } catch (err) {
    console.error("Failed to send password-reset email", err);
    emailSent = false;
  }

  return NextResponse.json({ ok: true, password, emailSent });
}
