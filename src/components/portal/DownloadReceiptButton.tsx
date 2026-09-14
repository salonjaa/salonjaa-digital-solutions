"use client";

/**
 * "Download" = the browser's own print dialog, set to "Save as PDF" — no
 * PDF-generation dependency needed, and it renders exactly the same HTML/
 * CSS the user already sees. globals.css's @media print rules hide
 * everything on the page except whichever element currently carries the
 * `receipt-print-area` class.
 *
 * `targetId` matters when more than one receipt can be on the page at once
 * (a client with several paid orders, each independently expandable) — a
 * static class on every receipt wrapper would print ALL of them if more
 * than one happened to be expanded. So instead this strips the class from
 * every candidate and re-adds it only to the one being downloaded, right
 * before printing, guaranteeing exactly one receipt prints regardless of
 * how many are expanded on screen.
 */
export function DownloadReceiptButton({ targetId, className }: { targetId: string; className?: string }) {
  function handleClick() {
    document.querySelectorAll(".receipt-print-candidate").forEach((el) => el.classList.remove("receipt-print-area"));
    document.getElementById(targetId)?.classList.add("receipt-print-area");
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
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
