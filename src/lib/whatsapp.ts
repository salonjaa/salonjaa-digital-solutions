/**
 * Appends a pre-filled message to a `wa.me/<number>` link, e.g.
 * `withWhatsappMessage(team.kumar.whatsapp, contact.whatsappMessage)`.
 * WhatsApp drops the `text` query param straight into the chat's message
 * box (as an editable draft, not an auto-sent message) once the chat opens.
 */
export function withWhatsappMessage(whatsappUrl: string, message: string) {
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a `wa.me` link from a free-text phone number (as entered in an
 * admin form, e.g. `client_plans`/`profiles.phone`) — strips everything but
 * digits, since `wa.me` needs the number in `<countrycode><number>` form
 * with no spaces/punctuation. A bare Indian number (10 digits, optionally
 * with a leading 0) gets `91` prepended, so admins don't have to type +91.
 */
export function waLinkFromPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const local = digits.replace(/^0+/, "");
  return `https://wa.me/${local.length === 10 ? `91${local}` : digits}`;
}
