import { Resend } from "resend";
import type { ContactPayload } from "./validation";

let client: Resend | null = null;

function getClient() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

function destinationAddresses() {
  return [process.env.CONTACT_TO_SAROJ, process.env.CONTACT_TO_SNEHANJALI].filter(
    (v): v is string => Boolean(v)
  );
}

function fromAddress() {
  // Requires a domain verified in Resend for production delivery.
  return process.env.CONTACT_FROM_EMAIL ?? "Salonjaa Digital Solutions <onboarding@resend.dev>";
}

export async function sendContactEmail(data: ContactPayload) {
  const to = destinationAddresses();
  if (to.length === 0) {
    throw new Error(
      "No contact recipients configured (CONTACT_TO_SAROJ / CONTACT_TO_SNEHANJALI are both unset)"
    );
  }

  const { data: result, error } = await getClient().emails.send({
    from: fromAddress(),
    to,
    subject: `New website enquiry from ${data.name}`,
    text: `Name: ${data.name}\nPhone: ${data.phone || "—"}\nProject type: ${data.projectType || "—"}\n\n${data.message}`,
  });

  // The Resend SDK resolves (rather than throws) on API-level failures —
  // e.g. an unverified sending domain, an invalid recipient — so without
  // this check a rejected send would be reported as ok:true to the visitor
  // while no email actually went out.
  if (error) {
    throw new Error(`Resend API error: ${error.name} — ${error.message}`);
  }

  return result;
}

export async function sendWelcomeEmail(params: { to: string; clientName: string; password: string; loginUrl: string }) {
  const { data: result, error } = await getClient().emails.send({
    from: fromAddress(),
    to: params.to,
    subject: "Your Salonjaa Digital Solutions account",
    text: `Hi ${params.clientName},\n\nYour account is ready. Log in to see your plan, payments, and domain status:\n\n${params.loginUrl}\n\nEmail: ${params.to}\nPassword: ${params.password}\n\nIf you'd like this password changed, just let us know.\n\n— Salonjaa Digital Solutions`,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.name} — ${error.message}`);
  }

  return result;
}

export async function sendPaymentRequestEmail(params: {
  to: string;
  clientName: string;
  description: string;
  amountPaise: number;
  loginUrl: string;
}) {
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(params.amountPaise / 100);

  const { data: result, error } = await getClient().emails.send({
    from: fromAddress(),
    to: params.to,
    subject: `Payment request from Salonjaa Digital Solutions — ${amount}`,
    text: `Hi ${params.clientName},\n\nA payment request for ${amount} (${params.description}) is ready on your account.\n\nLog in to pay: ${params.loginUrl}\n\n— Salonjaa Digital Solutions`,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.name} — ${error.message}`);
  }

  return result;
}
