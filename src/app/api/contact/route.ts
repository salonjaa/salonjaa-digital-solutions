import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { sendContactEmail } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`contact:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    // A tripped honeypot still parses as "invalid" (company non-empty) —
    // respond as if it succeeded so bots aren't tipped off.
    const raw = body as Record<string, unknown> | null;
    if (raw && typeof raw.company === "string" && raw.company.length > 0) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Please check the form and try again." }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send contact email", err);
    return NextResponse.json({ ok: false, error: "Failed to send. Please try again." }, { status: 502 });
  }
}
