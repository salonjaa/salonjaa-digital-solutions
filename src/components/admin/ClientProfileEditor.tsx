"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { IndianPhoneInput } from "@/components/forms/IndianPhoneInput";
import { PencilIcon } from "@/components/icons/AdminIcons";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

type Client = { id: string; full_name: string | null; phone: string | null; company_name: string | null; email: string | null };

// Password reset is client-self-service only now (Forgot password on
// /login → /reset-password) — admin has no path to set or view a client's
// password, deliberately.
export function ClientProfileEditor({ client }: { client: Client }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: data.fullName, email: data.email, phone: data.phone, companyName: data.companyName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to save changes.");
        return;
      }
      if (json.emailChanged) {
        setNotice(
          json.emailSent
            ? "Email updated — a new password was generated and sent to the new address."
            : "Email updated, but the email with the new password failed to send. Ask the client to use \"Forgot password\" on the login page."
        );
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <GlassCard hover={false}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor="edit-fullName" className="mb-1 block text-xs font-medium text-text-secondary">
              Full name
            </label>
            <input id="edit-fullName" name="fullName" defaultValue={client.full_name ?? ""} required className={inputClasses} />
          </div>
          <div>
            <label htmlFor="edit-email" className="mb-1 block text-xs font-medium text-text-secondary">
              Email (also the client&apos;s login)
            </label>
            <input
              id="edit-email"
              name="email"
              type="email"
              defaultValue={client.email ?? ""}
              required
              className={inputClasses}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-phone" className="mb-1 block text-xs font-medium text-text-secondary">
                Phone
              </label>
              <IndianPhoneInput id="edit-phone" name="phone" defaultValue={client.phone} size="sm" />
            </div>
            <div>
              <label htmlFor="edit-company" className="mb-1 block text-xs font-medium text-text-secondary">
                Company
              </label>
              <input id="edit-company" name="companyName" defaultValue={client.company_name ?? ""} className={inputClasses} />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Changing the email also generates a new password, which is emailed to the new address.
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="md" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" size="md" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          {client.full_name || client.company_name || "Unnamed client"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {[client.email, client.phone].filter(Boolean).join(" · ") || "No contact details on file"}
        </p>
        {notice && <p className="mt-2 text-sm text-emerald">{notice}</p>}
        {error && !editing && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
      <Button variant="outline" size="md" onClick={() => setEditing(true)}>
        <PencilIcon className="h-4 w-4" />
        Edit
      </Button>
    </div>
  );
}
