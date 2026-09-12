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
  return [process.env.CONTACT_TO_KUMAR, process.env.CONTACT_TO_SAROJ].filter(
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
      "No contact recipients configured (CONTACT_TO_KUMAR / CONTACT_TO_SAROJ are both unset)"
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
