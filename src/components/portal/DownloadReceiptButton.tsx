"use client";

/**
 * "Download" = the browser's own print dialog, set to "Save as PDF" — no
 * PDF-generation dependency needed, and it renders exactly the same HTML/
 * CSS the user already sees. globals.css's @media print rules hide
 * everything on the page except the element carrying `receipt-print-area`
 * (see Receipt.tsx's usage) so what prints is just the receipt, not the
 * dashboard chrome around it.
 */
export function DownloadReceiptButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-cursor-hover
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-[#0f2942] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      }
    >
      Download Receipt
    </button>
  );
}
