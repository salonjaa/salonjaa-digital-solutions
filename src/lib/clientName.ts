/**
 * The exact string an admin must type to confirm deleting a client (shown in
 * the delete modal and re-checked server-side). Falls back to the email so
 * there's always something to type, even for a client with no name on file.
 */
export function clientConfirmName(client: { full_name: string | null; email: string | null }) {
  return client.full_name?.trim() || client.email || "";
}
