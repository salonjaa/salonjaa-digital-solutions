import Image from "next/image";
import { site } from "@/content/site";

export type ReceiptLineItem = { label: string; amountPaise: number };

export type ReceiptData = {
  receiptNumber: string;
  paidAt: string; // ISO date string
  paymentId: string | null;
  paymentMethod?: string;
  client: {
    name: string;
    company?: string | null;
    email: string;
    phone?: string | null;
  };
  lineItems: ReceiptLineItem[];
  amountPaise: number;
};

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(
    paise / 100
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

// Small stand-in for the reference design's circuit/node flourish next to
// the title — same visual idea (dots + connecting lines), not a pixel copy.
function CircuitFlourish() {
  return (
    <svg viewBox="0 0 140 60" className="h-10 w-28 shrink-0 text-[#14919b]" fill="none" aria-hidden="true">
      <path
        d="M0 12h22l10 10h30M0 30h14l8-8M0 48h30l10-10h20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4" cy="12" r="3" fill="currentColor" />
      <circle cx="4" cy="30" r="3" fill="currentColor" />
      <circle cx="4" cy="48" r="3" fill="currentColor" />
      <circle cx="62" cy="12" r="3" fill="currentColor" />
      <circle cx="60" cy="48" r="3" fill="currentColor" />
    </svg>
  );
}

/**
 * A printable payment receipt — deliberately its own self-contained light
 * theme (navy/teal on white) rather than the site's dark theme, matching
 * the studio's actual invoice branding (see the reference image this was
 * built from) and because a receipt is meant to be printed/saved as a
 * clean document, not read on a dark dashboard.
 *
 * Wrap this in an element carrying the `receipt-print-area` class (see
 * DownloadReceiptButton) so `@media print` in globals.css can hide
 * everything else on the page when the browser's print/save-as-PDF dialog
 * opens.
 */
export function Receipt({ data }: { data: ReceiptData }) {
  const subtotalPaise = data.lineItems.reduce((sum, item) => sum + item.amountPaise, 0);

  return (
    <div className="mx-auto max-w-3xl bg-[#ffffff] p-8 text-[#0f2942] shadow-xl sm:p-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-[#0f2942]/10 pb-6">
        <div className="flex items-center gap-3">
          <Image src="/images/logo-mark.png" alt="" width={56} height={66} />
          <div className="leading-tight">
            <p className="font-display text-2xl font-bold text-[#0f2942]">salonjaa</p>
            <p className="text-sm font-medium tracking-wide text-[#14919b]">digital solutions</p>
          </div>
        </div>
        <div className="text-right">
          <div className="mb-1 flex items-center justify-end gap-3">
            <CircuitFlourish />
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#0f2942]">RECEIPT</h1>
          </div>
          <dl className="space-y-0.5 text-sm">
            <div className="flex justify-end gap-2">
              <dt className="font-semibold text-[#0f2942]">Receipt #:</dt>
              <dd className="font-mono text-[#0f2942]/80">{data.receiptNumber}</dd>
            </div>
            <div className="flex justify-end gap-2">
              <dt className="font-semibold text-[#0f2942]">Date Paid:</dt>
              <dd className="text-[#0f2942]/80">{formatDate(data.paidAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Bill to / From */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="bg-[#dbeefc] px-3 py-1.5 text-sm font-bold tracking-wide text-[#0f2942]">BILL TO</p>
          <div className="space-y-0.5 px-3 py-3 text-sm">
            <p className="font-semibold text-[#0f2942]">{data.client.name}</p>
            {data.client.company && <p className="text-[#0f2942]/70">{data.client.company}</p>}
            <p className="text-[#0f2942]/70">{data.client.email}</p>
            {data.client.phone && <p className="text-[#0f2942]/70">{data.client.phone}</p>}
          </div>
        </div>
        <div>
          <p className="bg-[#dbeefc] px-3 py-1.5 text-sm font-bold tracking-wide text-[#0f2942]">FROM</p>
          <div className="space-y-0.5 px-3 py-3 text-sm">
            <p className="font-semibold text-[#0f2942]">{site.name}</p>
            <p className="whitespace-pre-line text-[#0f2942]/70">{site.address.full}</p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#dbeefc] text-left">
            <th className="px-3 py-2 font-bold text-[#0f2942]">ITEM / DESCRIPTION</th>
            <th className="px-3 py-2 text-right font-bold text-[#0f2942]">QUANTITY</th>
            <th className="px-3 py-2 text-right font-bold text-[#0f2942]">UNIT PRICE (₹)</th>
            <th className="px-3 py-2 text-right font-bold text-[#0f2942]">AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, i) => (
            <tr key={i} className="border-b border-[#0f2942]/10">
              <td className="px-3 py-3 text-[#0f2942]">{item.label}</td>
              <td className="px-3 py-3 text-right text-[#0f2942]/80">1</td>
              <td className="px-3 py-3 text-right text-[#0f2942]/80">{formatINR(item.amountPaise)}</td>
              <td className="px-3 py-3 text-right text-[#0f2942]">{formatINR(item.amountPaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment details / totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-[#0f2942]/10 p-4">
          <p className="text-sm font-bold tracking-wide text-[#0f2942]">PAYMENT DETAILS</p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[#0f2942]/60">Method</dt>
              <dd className="text-[#0f2942]">{data.paymentMethod ?? "Razorpay"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#0f2942]/60">Transaction ID</dt>
              <dd className="truncate font-mono text-xs text-[#0f2942]">{data.paymentId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#0f2942]/60">Status</dt>
              <dd>
                <span className="rounded-full bg-[#d1fae5] px-2.5 py-0.5 text-xs font-bold tracking-wide text-[#047857]">
                  PAID
                </span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex justify-between bg-[#dbeefc] px-4 py-2 text-sm font-bold text-[#0f2942]">
            <span>SUBTOTAL</span>
            <span>{formatINR(subtotalPaise)}</span>
          </div>
          <div className="flex justify-between bg-[#0f2942] px-4 py-3 text-base font-bold text-[#ffffff]">
            <span>TOTAL PAID</span>
            <span>{formatINR(data.amountPaise)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 border-t-2 border-[#0f2942]/10 pt-6 text-center">
        <p className="font-display text-lg font-bold tracking-wide text-[#0f2942]">THANK YOU FOR YOUR BUSINESS!</p>
        <p className="mt-1 text-sm text-[#14919b]">{site.url.replace(/^https?:\/\//, "")}</p>
      </div>
    </div>
  );
}
