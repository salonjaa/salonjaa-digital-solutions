"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge, domainStatusTone } from "@/components/ui/StatusBadge";
import { PencilIcon, PlusIcon } from "@/components/icons/AdminIcons";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";
const selectClasses = inputClasses + " py-1.5";

type DomainRow = {
  id: string;
  domain_name: string;
  registrar: string | null;
  status: string;
  purchased_at: string | null;
  renewal_date: string | null;
  auto_renew: boolean;
  notes: string | null;
};

function DomainFields({ defaults }: { defaults?: Partial<DomainRow> }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="domainName" defaultValue={defaults?.domain_name ?? ""} placeholder="example.com" required className={inputClasses} />
        <select name="status" defaultValue={defaults?.status ?? "registered"} className={selectClasses}>
          {["registered", "dns_pending", "live", "expired"].map((s) => (
            <option key={s} value={s} className="bg-surface">
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="registrar" defaultValue={defaults?.registrar ?? ""} placeholder="Registrar (optional)" className={inputClasses} />
        <input name="renewalDate" type="date" defaultValue={defaults?.renewal_date ?? ""} className={inputClasses} />
      </div>
      <label className="flex items-center gap-2 text-xs text-text-secondary">
        <input type="checkbox" name="autoRenew" defaultChecked={defaults?.auto_renew ?? false} className="accent-cyan" />
        Auto-renew
      </label>
      <textarea name="notes" defaultValue={defaults?.notes ?? ""} placeholder="Notes (optional)" rows={2} className={inputClasses} />
    </>
  );
}

function AddDomainForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, autoRenew: data.autoRenew === "on" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to add domain.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="md" onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        Add Domain
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <DomainFields />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="md" disabled={saving}>
          {saving ? "Saving…" : "Add"}
        </Button>
        <Button type="button" variant="outline" size="md" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DomainRowItem({ clientId, domain }: { clientId: string; domain: DomainRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/domain`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, autoRenew: data.autoRenew === "on", domainId: domain.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to save changes.");
        return;
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
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <DomainFields defaults={domain} />
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
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 last:border-0">
      <span className="text-sm text-white">{domain.domain_name}</span>
      <div className="flex items-center gap-2">
        <StatusBadge label={domain.status.replace("_", " ")} tone={domainStatusTone[domain.status]} />
        <button type="button" onClick={() => setEditing(true)} data-cursor-hover className="text-text-muted hover:text-white">
          <PencilIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function DomainManager({ clientId, domains }: { clientId: string; domains: DomainRow[] }) {
  return (
    <GlassCard hover={false}>
      <p className="text-xs uppercase tracking-wide text-text-muted">Domains</p>
      {domains.length > 0 ? (
        <div className="mt-3 space-y-2">
          {domains.map((domain) => (
            <DomainRowItem key={domain.id} clientId={clientId} domain={domain} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-text-secondary">None on file.</p>
      )}
      <div className="mt-3">
        <AddDomainForm clientId={clientId} />
      </div>
    </GlassCard>
  );
}
