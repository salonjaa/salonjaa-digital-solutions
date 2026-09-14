"use client";

import { useState } from "react";

/**
 * Generates a real PDF client-side (html2canvas-pro snapshots the receipt
 * DOM node, jsPDF wraps that image in a PDF sized to match) and saves it
 * directly — no browser print dialog / print-preview step, unlike the
 * earlier window.print() approach. That approach also had a real bug: the
 * print CSS's `position: absolute` couldn't escape an `overflow-hidden`
 * ancestor, so only the receipt's header ever actually printed. Rendering
 * to a canvas and embedding that as one image sidesteps the whole class of
 * "did CSS visibility/print rules actually apply" problems.
 *
 * html2canvas-pro, not plain html2canvas: the original throws on modern
 * CSS color functions (oklch()/lab()), which Tailwind v4's built-in
 * palette generates throughout this app's stylesheet — not just the
 * receipt's own classes, since html2canvas parses the whole applicable
 * CSSOM. This fork adds support for those; found via the exact error
 * (`Attempting to parse an unsupported color function "lab"`) surfaced by
 * this button's own error display below.
 *
 * jspdf/html2canvas-pro are dynamically imported so their bundle weight
 * only loads if someone actually clicks Download, not on every page view.
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
      // html2canvas-pro, not html2canvas — the original can't parse modern
      // CSS color functions (oklch()/lab()), which Tailwind v4's built-in
      // palette generates throughout this app's stylesheet (not just the
      // receipt's own classes — html2canvas processes the whole applicable
      // CSSOM, not just the captured node's rules). This fork adds support
      // for exactly that; same API otherwise.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);

      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imageData = canvas.toDataURL("image/png");

      // A real A4 page, not a custom page sized to the exact pixel
      // dimensions of the capture — that earlier approach produced a
      // non-standard page with the image stretched edge-to-edge (no
      // margin, wrong proportions). This fits the image within A4 minus a
      // fixed margin, preserving its aspect ratio, and centers it — if the
      // receipt is taller than one page's content area, it spans
      // additional A4 pages rather than being squashed to fit.
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;

      const aspectRatio = canvas.width / canvas.height;
      const renderWidth = maxWidth;
      const renderHeight = renderWidth / aspectRatio;
      const x = margin;

      if (renderHeight <= maxHeight) {
        // Fits on one page — center it vertically within the margin area.
        const y = margin + (maxHeight - renderHeight) / 2;
        pdf.addImage(imageData, "PNG", x, y, renderWidth, renderHeight);
      } else {
        // Taller than one page: slice the source canvas into page-height
        // chunks (in source pixels) and add one PDF page per chunk.
        const pxPerMm = canvas.width / renderWidth;
        const pageContentPx = Math.floor(maxHeight * pxPerMm);
        let renderedPx = 0;
        let firstPage = true;

        while (renderedPx < canvas.height) {
          const sliceHeightPx = Math.min(pageContentPx, canvas.height - renderedPx);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeightPx;
          const ctx = sliceCanvas.getContext("2d");
          ctx?.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

          if (!firstPage) pdf.addPage();
          pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", x, margin, renderWidth, sliceHeightPx / pxPerMm);

          renderedPx += sliceHeightPx;
          firstPage = false;
        }
      }

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
