"use client";

import { useState } from "react";

/**
 * Generates a real PDF client-side (html2canvas snapshots the receipt DOM
 * node, jsPDF wraps that image in a PDF sized to match) and saves it
 * directly — no browser print dialog / print-preview step, unlike the
 * earlier window.print() approach. That approach also had a real bug: the
 * print CSS's `position: absolute` couldn't escape an `overflow-hidden`
 * ancestor, so only the receipt's header ever actually printed. Rendering
 * to a canvas and embedding that as one image sidesteps the whole class of
 * "did CSS visibility/print rules actually apply" problems.
 *
 * jspdf/html2canvas are dynamically imported so their bundle weight only
 * loads if someone actually clicks Download, not on every page view.
 *
 * `targetId` must be the id of the (already-rendered, even if visually
 * off-screen) element to capture — see InvoiceCard's off-screen Receipt.
 */
export function DownloadReceiptButton({
  targetId,
  fileName,
  className,
}: {
  targetId: string;
  fileName: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    const node = document.getElementById(targetId);
    if (!node) {
      setStatus("error");
      setErrorMessage(`Could not find the receipt content (id="${targetId}").`);
      return;
    }

    setStatus("pending");
    setErrorMessage(null);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imageData = canvas.toDataURL("image/png");

      // Page sized to exactly match the captured content — one receipt,
      // one page, no scaling/cropping math against a fixed paper size.
      const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
      setStatus("idle");
    } catch (err) {
      console.error("Failed to generate receipt PDF", err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "pending"}
        data-cursor-hover
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-[#0f2942] transition-opacity hover:opacity-90 disabled:opacity-60"
        }
      >
        {status === "pending" ? "Preparing…" : status === "error" ? "Failed — retry" : "Download Receipt"}
      </button>
      {status === "error" && errorMessage && (
        <p className="max-w-xs text-xs text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
