"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { CloseIcon } from "@/components/icons/AdminIcons";

/**
 * GitHub-style "danger zone": deleting needs the client's exact name typed
 * into a confirmation modal. The server re-checks the name, so this is UX,
 * not the security boundary.
 */
export function DeleteClientButton({ clientId, confirmName }: { clientId: string; confirmName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (deleting) return;
    setOpen(false);
    setTyped("");
    setError(null);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !deleting) {
        setOpen(false);
        setTyped("");
        setError(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleting]);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName: typed }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to delete client.");
        return;
      }
      router.push("/admin/clients");
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const matches = typed === confirmName;

  return (
    <>
      <GlassCard hover={false} className="border border-red-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Delete this client</p>
            <p className="mt-1 text-sm text-text-secondary">
              Permanently removes their login, plans, domains and chat history. This can&apos;t be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-cursor-hover
            className="shrink-0 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            Delete client
          </button>
        </div>
      </GlassCard>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-client-title"
            onClick={(e) => e.stopPropagation()}
            className="card-glass relative w-full max-w-md space-y-4 bg-surface p-6"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              data-cursor-hover
              className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <h2 id="delete-client-title" className="pr-8 font-display text-lg font-semibold text-white">
              Are you absolutely sure?
            </h2>
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              This action cannot be undone. It permanently deletes this client&apos;s login, plans, domains and
              chat history.
            </p>
            <div>
              <label htmlFor="delete-confirm" className="mb-1.5 block text-sm text-text-secondary">
                Please type <span className="select-all font-semibold text-white">{confirmName}</span> to confirm.
              </label>
              <input
                id="delete-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-red-400"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="button"
              onClick={handleDelete}
              disabled={!matches || deleting}
              className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? "Deleting…" : "I understand, delete this client"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
