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
 * with no spaces/punctuation.
 */
export function waLinkFromPhone(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
