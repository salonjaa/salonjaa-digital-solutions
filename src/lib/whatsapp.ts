/**
 * Appends a pre-filled message to a `wa.me/<number>` link, e.g.
 * `withWhatsappMessage(team.kumar.whatsapp, contact.whatsappMessage)`.
 * WhatsApp drops the `text` query param straight into the chat's message
 * box (as an editable draft, not an auto-sent message) once the chat opens.
 */
export function withWhatsappMessage(whatsappUrl: string, message: string) {
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}
