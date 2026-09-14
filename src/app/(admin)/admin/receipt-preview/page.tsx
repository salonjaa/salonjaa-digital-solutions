import { Receipt, type ReceiptData } from "@/components/portal/Receipt";
import { DownloadReceiptButton } from "@/components/portal/DownloadReceiptButton";

export const metadata = { title: "Receipt Preview — Admin" };

// Sample data only — for reviewing the receipt design before it's wired to
// real orders. Not linked from anywhere in client-facing nav.
const sampleReceipt: ReceiptData = {
  receiptNumber: "a1b2c3d4-e5f6",
  paidAt: new Date().toISOString(),
  paymentId: "pay_QwErTyUiOpAsDf12",
  paymentMethod: "Razorpay (UPI)",
  client: {
    name: "Aditya Sahu",
    company: "Aditya Enterprises",
    email: "aditya@example.com",
    phone: "+91 90000 00000",
  },
  lineItems: [
    { label: "Website Development", amountPaise: 1_500_000 },
    { label: "SEO Optimization Services", amountPaise: 810_000 },
    { label: "Digital Marketing Campaign", amountPaise: 2_000_000 },
  ],
  amountPaise: 1_500_000 + 810_000 + 2_000_000,
};

export default function ReceiptPreviewPage() {
  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Receipt Preview</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Sample data only — for design review. Click Download to test the print/PDF output.
          </p>
        </div>
        <DownloadReceiptButton targetId="receipt-sample" />
      </div>

      <div id="receipt-sample" className="receipt-print-candidate rounded-2xl">
        <Receipt data={sampleReceipt} />
      </div>
    </div>
  );
}
