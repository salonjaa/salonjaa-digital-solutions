"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Shared dialog chrome (backdrop + centered `.card-glass` panel), portaled
 * to `document.body` via createPortal rather than rendered inline where
 * it's used. Several admin cards (Payments, Delete client, ...) sit in
 * their own `.gradient-border` wrapper, and that utility sets
 * `isolation: isolate` (see globals.css) to scope its gradient-ring
 * pseudo-element — which as a side effect traps any `z-[100]` rendered
 * inside it to that card's own stacking context. A modal rendered inline
 * in one card can then never out-stack a *sibling* card, no matter how
 * high its z-index, because they're each their own isolated context.
 * Portaling to `document.body` sidesteps this entirely: the modal's
 * stacking context is the root, not whichever card happened to render it.
 */
export function Modal({
  onClose,
  labelledBy,
  disableClose,
  className,
  children,
}: {
  onClose: () => void;
  labelledBy: string;
  /** Suppress Escape-to-close, e.g. while a destructive action is in flight. */
  disableClose?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !disableClose) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disableClose, onClose]);

  // Every caller only renders <Modal> from state that starts closed (e.g.
  // `{open && <Modal>}`), so this never appears in the initial SSR/hydration
  // render — by the time it mounts we're always already in the browser,
  // no "wait for mount before touching document.body" dance required.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className={cn("card-glass relative w-full max-w-md space-y-4 bg-surface p-6", className)}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
